import React from 'react';
import { Star, Plus } from 'lucide-react';

const VideoCard = ({ video, isLarge = false }) => {
    return (
        <div className={`bg-[#2c2c34] rounded-lg overflow-hidden group cursor-pointer ${isLarge ? 'col-span-2' : ''
            }`}>
            {/* Ảnh thumbnail */}
            <div className="relative">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={`w-full object-cover ${isLarge ? 'h-40' : 'h-32'}`}
                />
                {/* Lớp phủ màu đen hiện lên khi hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300"></div>

                {/* Duration badge */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                    </div>
                )}
            </div>

            {/* Thông tin video */}
            <div className="p-4">
                <h4 className="font-medium text-white mb-2 line-clamp-2 leading-tight">
                    {video.title}
                </h4>
                <p className="text-sm text-gray-400 mb-3 hover:text-blue-400 cursor-pointer">
                    {video.author}
                </p>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Star size={16} className="text-gray-400 hover:text-yellow-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Plus size={16} className="text-gray-400 hover:text-green-400" />
                        </button>
                    </div>

                    {video.views && (
                        <span className="text-xs text-gray-500">{video.views}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
