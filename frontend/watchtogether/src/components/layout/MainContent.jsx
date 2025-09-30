import React from 'react';
import VideoPlayer from '../video/VideoPlayer';
import VideoGrid from '../ui/VideoGrid';
import SearchBar from '../features/SearchBar'
const MainContent = () => {
    // Dữ liệu shorts giống như trong ảnh
    const shortsData = [
        {
            id: 1,
            title: "Spring",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/WhWc3b3KhnY/maxresdefault.jpg",
            duration: "0:15"
        },
        {
            id: 2,
            title: "Caminandes 1: Llama Drama",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/GOQJB5ioPbU/maxresdefault.jpg",
            duration: "1:30"
        },
        {
            id: 3,
            title: "Caminandes 2: Gran Dillama",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/Z4C82eyhwgU/maxresdefault.jpg",
            duration: "2:30"
        },
        {
            id: 4,
            title: "Caminandes 3: Llamigos",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/SkVqJ1SGeL0/maxresdefault.jpg",
            duration: "2:30"
        },
        {
            id: 5,
            title: "Big Buck Bunny",
            author: "Blender Animation...",
            thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/maxresdefault.jpg",
            duration: "9:56"
        }
    ];

    // Dữ liệu popular videos
    const popularVideos = [
        {
            id: 6,
            title: "PS5 vs Xbox in 2025: Which is Better?",
            author: "PS5 vs Xbox Series X in 2025, which is actually",
            thumbnail: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
            views: "1.2M views",
            duration: "12:45"
        },
        {
            id: 7,
            title: "PS5 vs Xbox Series X ...",
            author: "Which is better? The PlayStation 5 or the Xbox",
            thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
            views: "856K views",
            duration: "15:30"
        },
        {
            id: 8,
            title: "PS5 vs XBOX in 2025... What Happened!?",
            author: "Is Xbox dying, or can we still save it? I review the",
            thumbnail: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
            views: "2.1M views",
            duration: "18:22"
        },
        {
            id: 9,
            title: "Nintendo Switch 1 vs. 2 vs PS4 vs Xbox Series S|X vs. PS5 vs...",
            author: "tonyhawksproskatler #nintendoswitch2",
            thumbnail: "https://img.youtube.com/vi/example4/maxresdefault.jpg",
            views: "543K views",
            duration: "25:10"
        },
        {
            id: 10,
            title: "PS5 vs Xbox Series X: Which is Best?",
            author: "The ultimate PS5 vs Xbox Series X comparison",
            thumbnail: "https://img.youtube.com/vi/example5/maxresdefault.jpg",
            views: "3.4M views",
            duration: "20:15"
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
