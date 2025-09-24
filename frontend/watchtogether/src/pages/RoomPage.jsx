// src/pages/RoomPage.jsx
import React, { useState } from 'react';
import { useRoom } from '../hooks/useRoom'; // Sử dụng hook
import InviteModal from '../components/features/InviteModal'; // Import Modal

function RoomPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { roomData } = useRoom(); // Lấy dữ liệu phòng từ context

    // Nếu không có roomData (trường hợp truy cập thẳng vào trang)
    if (!roomData) {
        return <div>Loading room...</div>;
    }

    return (
        <div className="bg-[#1e1e24] min-h-screen text-white flex">
            {/* Sidebar trái */}
            <aside className="w-20 bg-[#2c2c34] p-2 flex flex-col items-center space-y-6">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-black text-2xl">W</div>
                <button
                    title="Invite friends"
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </button>
            </aside>

            {/* Main content... */}
            <main className="flex-1 p-4">
                {/* ... Giao diện phòng xem phim của bạn ... */}
                <h1 className="text-2xl">Welcome to Room: {roomData.roomId}</h1>
            </main>

            {/* Modal */}
            <InviteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                joinUrl={roomData.joinUrl}
            />
        </div>
    );
}

export default RoomPage;