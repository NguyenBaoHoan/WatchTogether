import React, { useState } from 'react';
import { Play, Pause, Volume2, Settings, Maximize, Clock, Share } from 'lucide-react';

const VideoPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, _setCurrentTime] = useState(0);
    const [duration] = useState(183); // 3:03 in seconds

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (currentTime / duration) * 100;

    return (
        <div className="w-full">
            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <div className="aspect-video flex items-center justify-center relative">
                    {/* Video Thumbnail/Content */}
                    <img
                        src="https://img.youtube.com/vi/YE7VzlLtp-4/maxresdefault.jpg"
                        alt="Watch2Gether - Cats vs. Dogs"
                        className="w-full h-full object-cover"
                    />

                    {/* YouTube Logo overlay */}
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-red-600 text-white px-3 py-1 rounded flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                <Play size={14} className="text-red-600 ml-0.5" />
                            </div>
                            <span className="font-semibold text-sm">YouTube</span>
                        </div>
                    </div>

                    {/* Video title overlay */}
                    <div className="absolute top-4 left-4 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-black">
                            W
                        </div>
                        <span className="text-white font-medium">Watch2Gether - Cats vs. Dogs</span>
                    </div>

                    {/* Top right controls */}
                    <div className="absolute top-4 right-4 flex items-center space-x-3">
                        <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70">
                            <Clock size={20} className="text-white" />
                            <span className="text-white text-sm ml-1">Watch later</span>
                        </button>
                        <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70">
                            <Share size={20} className="text-white" />
                            <span className="text-white text-sm ml-1">Share</span>
                        </button>
                    </div>
                </div>

                {/* Custom Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    {/* Progress bar */}
                    <div className="relative mb-4">
                        <div className="w-full h-1 bg-gray-600 rounded-full">
                            <div
                                className="h-1 bg-cyan-400 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                            <span className="text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                                <Settings size={20} />
                            </button>
                            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                                <Volume2 size={20} />
                            </button>
                            <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;