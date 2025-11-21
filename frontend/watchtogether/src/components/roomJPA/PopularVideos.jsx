import React, { useState, useEffect } from 'react';

// ⚠️ QUAN TRỌNG: Hãy thay thế bằng API Key của bạn
const API_KEY = 'AIzaSyAheQyFkEnWwwtgWx2sHhqLr6wxM6G5D0I'; 
const MAX_RESULTS = 12; // Số lượng video muốn lấy
const REGION_CODE = 'VN'; // Mã quốc gia (VN cho Việt Nam, US cho Mỹ...)

const PopularVideos = ({ onVideoSelect }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopularVideos = async () => {
            try {
                setLoading(true);
                // Gọi API lấy video phổ biến
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${REGION_CODE}&maxResults=${MAX_RESULTS}&key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }

                const data = await response.json();

                // Map dữ liệu từ YouTube API sang format của component
                const mappedVideos = data.items.map(item => ({
                    id: item.id,
                    title: item.snippet.title,
                    // Lấy ảnh chất lượng cao nếu có, không thì lấy trung bình
                    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                    channel: item.snippet.channelTitle,
                    description: item.snippet.description,
                    viewCount: item.statistics.viewCount // Có thể dùng thêm view count nếu muốn
                }));

                setVideos(mappedVideos);
            } catch (err) {
                console.error("Error fetching YouTube videos:", err);
                setError("Không thể tải danh sách video. Vui lòng kiểm tra API Key.");
            } finally {
                setLoading(false);
            }
        };

        fetchPopularVideos();
    }, []);

    // Hiển thị Loading
    if (loading) {
        return (
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                    Popular videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#283240] rounded-lg h-[280px] animate-pulse">
                            <div className="h-[160px] bg-gray-700 rounded-t-lg"></div>
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Hiển thị Lỗi (nếu có) nhưng vẫn render khung để không vỡ layout
    if (error) {
        return (
            <div className="mt-8 text-red-400 bg-red-900/20 p-4 rounded border border-red-500/50">
                Lỗi: {error}
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                Popular videos region: {REGION_CODE}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <div 
                        key={video.id} 
                        className="bg-[#283240] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border border-gray-700/50 hover:border-blue-500"
                        onClick={() => onVideoSelect(video.id)}
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                            <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            
                            {/* Play Icon on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-red-600 rounded-full p-3 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col h-[180px]">
                            {/* Title */}
                            <h3 className="text-white font-bold text-sm leading-tight mb-2 line-clamp-2" title={video.title}>
                                {video.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-xs mb-3 line-clamp-3 flex-grow">
                                {video.description || "No description available."}
                            </p>

                            {/* Footer: Channel & Actions */}
                            <div className="mt-auto pt-2 border-t border-gray-600 flex justify-between items-center">
                                <span className="text-xs text-blue-300 font-medium truncate max-w-[60%]">
                                    {video.channel}
                                </span>
                                
                                <div className="flex gap-2">
                                    {/* Star/Favorite Icon */}
                                    <button 
                                        className="text-gray-400 hover:text-yellow-400 transition-colors p-1"
                                        onClick={(e) => { e.stopPropagation(); }}
                                        title="Favorite"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                                        </svg>
                                    </button>
                                    
                                    {/* Plus/Add Icon */}
                                    <button 
                                        className="text-gray-400 hover:text-green-400 transition-colors p-1"
                                        onClick={(e) => { e.stopPropagation(); }}
                                        title="Add to queue"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularVideos;