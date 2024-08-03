import { Inject, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';
import PgBoss = require('pg-boss');
import { PG_BOSS } from '../../common/queue/pg-boss.module';
// import { Logger } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../common/provider/prisma.provider';
import { LoggerService } from '../../common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranscodingService {
  private readonly logger = new LoggerService();
  private s3: S3;

  constructor(
    @Inject(PG_BOSS) private readonly pgBoss: PgBoss,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
    this.startTranscodingWorker();
  }

  async queueVideoForTranscoding(videoId: string, s3Key: string) {
    this.logger.info(`Queuing video ${videoId} for transcoding`);
    await this.pgBoss.send("video-transcoding", { videoId, s3Key });
  }

  async startTranscodingWorker() {
    this.pgBoss.work('video-transcoding', this.handleTranscodingJob.bind(this))
      .catch(error => this.logger.error(`Failed to set up video-transcoding handler: ${error}`));
  }

  private async handleTranscodingJob(job: PgBoss.Job<{ videoId: string; s3Key: string }>) {
    const { videoId, s3Key } = job.data;
    try {
      this.logger.info(`Transcoding video ${videoId} with job ${job.id}`);
      await this.transcodeVideo(videoId, s3Key);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to transcode video ${videoId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async transcodeVideo(videoId: string, s3Key: string) {
    const tempDir = `/tmp/${videoId}`;
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      this.logger.info(`Downloading video ${videoId} from S3`);
      const inputPath = path.join(tempDir, 'input.mp4');
      await this.downloadFromS3(s3Key, inputPath);

      await this.runFfmpeg(inputPath, tempDir, videoId);

      const hlsManifestKey = await this.uploadHlsFiles(tempDir, videoId);

      await this.updateVideoStatus(videoId, hlsManifestKey);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  private async downloadFromS3(s3Key: string, outputPath: string): Promise<void> {
    const inputStream = this.s3.getObject({ Bucket: process.env.S3_BUCKET_NAME ?? "", Key: s3Key }).createReadStream();
    const outputStream = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
      inputStream.pipe(outputStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  private runFfmpeg(inputPath: string, outputDir: string, videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);

      // 1080p (equivalent in portrait mode)
      command.output(`${outputDir}/${videoId}_1080p.m3u8`)
        .outputOptions([
          '-vf scale=1080:-2',  // Scale to 1080 width, maintain aspect ratio
          '-c:v libx264',
          '-b:v 5000k',
          '-maxrate 5350k',
          '-bufsize 7500k',
          '-c:a aac',
          '-b:a 192k',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', `${outputDir}/${videoId}_1080p_%03d.ts`
        ]);

      // 720p (equivalent in portrait mode)
      command.output(`${outputDir}/${videoId}_720p.m3u8`)
        .outputOptions([
          '-vf scale=720:-2',  // Scale to 720 width, maintain aspect ratio
          '-c:v libx264',
          '-b:v 2800k',
          '-maxrate 2996k',
          '-bufsize 4200k',
          '-c:a aac',
          '-b:a 128k',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', `${outputDir}/${videoId}_720p_%03d.ts`
        ]);

      // 360p (equivalent in portrait mode)
      command.output(`${outputDir}/${videoId}_360p.m3u8`)
        .outputOptions([
          '-vf scale=360:-2',  // Scale to 360 width, maintain aspect ratio
          '-c:v libx264',
          '-b:v 800k',
          '-maxrate 856k',
          '-bufsize 1200k',
          '-c:a aac',
          '-b:a 96k',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', `${outputDir}/${videoId}_360p_%03d.ts`
        ]);

      // Common options
      command.outputOptions([
        '-preset slow',
        '-profile:v main',
        '-crf 23',
        '-g 60',
        '-keyint_min 60',
        '-sc_threshold 0',
        '-threads 0'
      ]);

      command.on('end', () => {
        this.logger.info(`Transcoding completed for video ${videoId}`);
        this.createMasterPlaylist(outputDir, videoId);
        resolve();
      }).on('error', reject).run();
    });
  }

  private createMasterPlaylist(outputDir: string, videoId: string): void {
    const masterContent = `#EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1080x1920
  ${videoId}_1080p.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=720x1280
  ${videoId}_720p.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=360x640
  ${videoId}_360p.m3u8`;

    fs.writeFileSync(`${outputDir}/${videoId}_master.m3u8`, masterContent);
  }

  private async uploadHlsFiles(dir: string, videoId: string): Promise<string> {
    try {


      this.logger.info(`Uploading transcoded files for video ${videoId}`);
      const files = fs.readdirSync(dir);
      const hlsManifestKey = `hls/${videoId}/${videoId}_master.m3u8`;

      for (const file of files) {
        const fileContent = fs.readFileSync(path.join(dir, file));
        const s3Key = `hls/${videoId}/${file}`;
        await this.s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME ?? "",
          Key: s3Key,
          Body: fileContent,
          ContentType: file.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T',
        }).promise();
      }

      return hlsManifestKey;
    } catch (error) {

      this.logger.error(`Failed to upload transcoded files for video ${videoId}: ${error.message}`);
      throw error;
    }
  }

  private async updateVideoStatus(videoId: string, hlsManifestKey: string): Promise<void> {
    try {


      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          hlsManifestKey,
          status: 'READY',
        },
      });
    } catch (error) {

      this.logger.error(`Failed to update video status for video ${videoId}: ${error.message}`);
    }
  }
}