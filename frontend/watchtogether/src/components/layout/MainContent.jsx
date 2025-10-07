import React from 'react';
import VideoPlayer from '../video/VideoPlayer';
import VideoGrid from '../video/VideoGrid';
import SearchBar from '../features/SearchBar'
const MainContent = () => {
    // Dữ liệu shorts giống như trong ảnh
    const shortsData = [
        {
            id: 1,
            title: "Spring",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/WhWc3b3KhnY/maxresdefault.jpg",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        {
            id: 2,
            title: "Caminandes 1: Llama Drama",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/GOQJB5ioPbU/maxresdefault.jpg",
            duration: "1:30",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        },
        {
            id: 3,
            title: "Caminandes 2: Gran Dillama",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/Z4C82eyhwgU/maxresdefault.jpg",
            duration: "2:30",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        },
        {
            id: 4,
            title: "Caminandes 3: Llamigos",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/SkVqJ1SGeL0/maxresdefault.jpg",
            duration: "2:30",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        },
        {
            id: 5,
            title: "Big Buck Bunny",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/maxresdefault.jpg",
            duration: "9:56",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
    ];

    // ⭐ Dữ liệu popular videos - GOOGLE SAMPLE VIDEOS
    const popularVideos = [
        {
            id: 6,
            title: "Big Buck Bunny",
            author: "Blender Foundation • 10 minutes",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
            views: "Open source animated short film",
            duration: "9:56",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        },
        {
            id: 7,
            title: "Elephant's Dream",
            author: "Blender Foundation • 11 minutes",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
            views: "First open movie project",
            duration: "10:53",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        },
        {
            id: 8,
            title: "Sintel",
            author: "Blender Foundation • 15 minutes",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
            views: "Fantasy short film",
            duration: "14:48",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        },
        {
            id: 9,
            title: "Tears of Steel",
            author: "Blender Foundation • 12 minutes",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
            views: "Sci-fi short film",
            duration: "12:14",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        },
        {
            id: 10,
            title: "For Bigger Blazes",
            author: "Google • 15 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
            views: "Short sample video",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        {
            id: 11,
            title: "For Bigger Escape",
            author: "Google • 15 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
            views: "Short sample video",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        },
        {
            id: 12,
            title: "For Bigger Fun",
            author: "Google • 15 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
            views: "Short sample video",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        },
        {
            id: 13,
            title: "For Bigger Joyrides",
            author: "Google • 15 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
            views: "Short sample video",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        },
        {
            id: 14,
            title: "For Bigger Meltdowns",
            author: "Google • 15 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
            views: "Short sample video",
            duration: "0:15",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
        },
        {
            id: 15,
            title: "Subaru Outback On Street And Dirt",
            author: "Google • 30 seconds",
            thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
            views: "Car commercial",
            duration: "0:30",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
        }
    ];

    return (
        <main className="flex-1 bg-[#1e1e1e] overflow-auto">
            {/* Search Bar Section */}
            <div className="p-6 border-b border-gray-700">
                <SearchBar />
            </div>

            {/* Video Player Section */}
            <div className="p-6">
                <VideoPlayer />
            </div>

            {/* Video Recommendations */}
            <div className="px-6 pb-6 space-y-8">
                <VideoGrid videos={shortsData} title="Watch2Gether Shorts" columns={5} />
                <VideoGrid videos={popularVideos} title="Popular videos" columns={5} />
            </div>
        </main>
    );
};

export default MainContent;
