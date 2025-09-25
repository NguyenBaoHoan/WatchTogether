import React from 'react';

const VideoPlayer = () => {
    return (
        // `aspect-video` là một class của Tailwind giúp giữ tỷ lệ 16:9
        // `w-full` đảm bảo nó chiếm hết chiều rộng của container cha (MainContent)
        <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
            <p className="text-gray-500">Video Player Placeholder</p>
        </div>
    );
};

export default VideoPlayer;
