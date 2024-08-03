'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import VideoJS from '../../components/VideoJS';
import { LuVolumeX,LuVolume2,LuHeart, LuMessageCircle, LuShare2, LuPlay, LuPause, LuChevronUp, LuChevronDown, LuMaximize, LuMinimize } from 'react-icons/lu'
import Player from 'video.js/dist/types/player';

interface Video {
    id: string;
    hlsManifestUrl: string;
    title: string;
    user: {
        username: string;
    };
}

const VideoFeed: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
    const [lastVideoId, setLastVideoId] = useState<string | null>(null);
    const [isLandscape, setIsLandscape] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const playerRef = useRef<Player | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    const isTogglingPlayRef = useRef<boolean>(false);

    const fetchVideos = useCallback(async (): Promise<void> => {
        try {
            const response = await axios.get<Video[]>(`http://localhost:3001/api/v1/videos/feed?lastVideoId=${lastVideoId}&limit=5`);
            setVideos(prevVideos => [...prevVideos, ...response.data]);
            if (response.data.length > 0) {
                setLastVideoId(response.data[response.data.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    }, [lastVideoId]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);


    const updatePlayingState = useCallback((playing: boolean) => {
        isPlayingRef.current = playing;
        setIsPlaying(playing);
    }, []);


    const togglePlay = useCallback(async (): Promise<void> => {
        if (isTogglingPlayRef.current) return;
        isTogglingPlayRef.current = true;

        const player = playerRef.current;
        if (player) {
            try {
                if (player.paused()) {
                    await player.play();
                    updatePlayingState(true);
                    console.log('Video started playing (user action)');
                } else {
                    player.pause();
                    updatePlayingState(false);
                    console.log('Video paused (user action)');
                }
            } catch (error) {
                console.error('Error toggling play/pause:', error);
            } finally {
                isTogglingPlayRef.current = false;
            }
        } else {
            console.error('Player reference is null');
            isTogglingPlayRef.current = false;
        }
        
    }, [updatePlayingState]);

    const handleVideoClick = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Video container clicked');
        togglePlay();
    }, [togglePlay]);

    const handleNextVideo = useCallback((): void => {
        setIsLandscape(false);
        if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(prevIndex => prevIndex + 1);
        } else {
            fetchVideos();
        }
    }, [currentVideoIndex, videos.length, fetchVideos]);

    const handlePreviousVideo = useCallback((): void => {
        setIsLandscape(false);
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(prevIndex => prevIndex - 1);
        }
    }, [currentVideoIndex]);

    const toggleOrientation = useCallback((): void => {
        setIsLandscape(prev => !prev);
    }, []);

    const handleLike = useCallback((): void => {
        console.log('Liked video');
    }, []);

    const handleComment = useCallback((): void => {
        console.log('Commented on video');
    }, []);

    const handleShare = useCallback((): void => {
        console.log('Shared video');
    }, []);

    const videoJsOptions = useMemo(() => ({
        autoplay: true ,
        muted: false,
        responsive: true,
        
        fluid: true,
        sources: videos[currentVideoIndex] ? [{
            src: videos[currentVideoIndex].hlsManifestUrl,
            type: 'application/x-mpegURL'
        }] : [],
        controlBar: false,
    }), [videos, currentVideoIndex]);

    const toggleMute = useCallback(() => {
        const player = playerRef.current;
        if (player) {
            const newMutedState = !player.muted();
            player.muted(newMutedState);
            setIsMuted(newMutedState);
        }
    }, []);


    const onPlayerReady = useCallback((player: Player) => {
        playerRef.current = player;
        player.on('play', () => {
            updatePlayingState(true);
            console.log('Video started playing (event)');
        });
        player.on('pause', () => {
            updatePlayingState(false);
            console.log('Video paused (event)');
        });
        console.log('Video Player is ready');
        player.play()!.catch(error => {
            console.error('Error playing video on ready:', error);
        });

        player.play()
    }, [updatePlayingState]);

    if (videos.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`video-feed flex bg-gray-900 items-center justify-center min-h-screen ${isLandscape ? 'p-4' : ''}`}>
            <div 
                className={`video-container bg-black flex flex-col justify-center relative overflow-hidden
                            ${isLandscape 
                                ? 'w-full max-w-4xl aspect-video' 
                                : 'w-full max-w-md aspect-[9/16]'}`}
            >
                <div className="flex items-center justify-center" onClick={handleVideoClick}>
                    <VideoJS
                        options={videoJsOptions}
                        onReady={onPlayerReady}
                    />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold">{videos[currentVideoIndex].title}</p>
                    <p>By: {videos[currentVideoIndex].user.username}</p>
                </div>
                <div className="absolute right-4 bottom-20 flex flex-col space-y-4">
                    <button onClick={handleLike} className="p-2 bg-white text-black rounded-full">
                        <LuHeart size={24} />
                    </button>
                    <button onClick={handleComment} className="p-2 bg-white text-black rounded-full">
                        <LuMessageCircle size={24} />
                    </button>
                    <button onClick={handleShare} className="p-2 bg-white text-black rounded-full">
                        <LuShare2 size={24} />
                    </button>
                </div>
                <button 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        togglePlay();
                    }} 
                    className="absolute top-4 left-4 p-2 bg-white text-black rounded-full"
                >
                    {isPlaying ? <LuPause size={24} /> : <LuPlay size={24} />}
                </button>
                <button 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        toggleMute();
                    }} 
                    className="absolute top-4 left-16 p-2 bg-white text-black rounded-full"
                >
                    {isMuted ? <LuVolumeX size={24} /> : <LuVolume2 size={24} />}
                </button>
                <button 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        toggleOrientation();
                    }} 
                    className="absolute top-4 right-4 p-2 bg-white text-black rounded-full"
                >
                    {isLandscape ? <LuMinimize size={24} /> : <LuMaximize size={24} />}
                </button>
            </div>
            {(
                <div className="flex -mr-6 pl-4 flex-col space-y-4">
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handlePreviousVideo();
                        }}
                        className="p-2 bg-white text-black rounded-full"
                        disabled={currentVideoIndex === 0}
                    >
                        <LuChevronUp size={24} />
                    </button>
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleNextVideo();
                        }}
                        className="p-2 bg-white text-black rounded-full"
                    >
                        <LuChevronDown size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;