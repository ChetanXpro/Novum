import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import "videojs-contrib-quality-levels"; 
import 'videojs-contrib-quality-levels';
import videojsqualityselector from 'videojs-hls-quality-selector';

interface VideoJSProps {
    options: any;
    onReady: (player: any) => void;
}

export const VideoJS: React.FC<VideoJSProps> = ({ options, onReady }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current?.appendChild(videoElement);

            const player: Player = videojs(videoElement, {
                ...options,
                controls: false,
                preload: 'auto',
            }, () => {
                console.log('player is ready');
                onReady && onReady(player);
            });

            // player.hlsQualitySelector = videojsqualityselector;
            // player.hlsQualitySelector();
      
         
            playerRef.current = player;

            // Apply custom styles
            const style = document.createElement('style');
            style.textContent = `
                .video-js .vjs-control-bar { display: none !important; }
                .video-js .vjs-big-play-button { display: none !important; }
                .video-js .vjs-loading-spinner { display: none !important; }
                .video-js .vjs-text-track-display { display: none !important; }
                .video-js .vjs-poster { background-size: cover; }
            `;
            document.head.appendChild(style);
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player className="w-full h-full">
            <div ref={videoRef} className="w-full h-full" />
        </div>
    );
}

export default VideoJS;