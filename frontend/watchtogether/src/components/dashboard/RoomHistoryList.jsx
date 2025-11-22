import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiService'; // Import apiClient đã cấu hình

const RoomHistoryList = ({ user }) => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm fetch dữ liệu
    const fetchHistory = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Gọi API Backend (Endpoint bạn đã tạo ở bước trước)
            const response = await apiClient.get('/rooms/history');

            // Map dữ liệu từ Backend về format hiển thị
            const formattedData = response.data.map(room => ({
                id: room.roomId,
                name: room.roomName || `Phòng ${room.roomId.substring(0, 6)}...`,
                createdAt: room.createdAt,
                participants: room.participants ? room.participants.length : 0,
                isActive: true // Logic check active tùy backend
            }));

            setRooms(formattedData);
            setError(null);
        } catch (err) {
            console.error("Failed to load history", err);
            setError("Không thể tải lịch sử phòng.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi API khi component mount hoặc user thay đổi
    useEffect(() => {
        fetchHistory();
    }, [user]);

    // Xử lý vào phòng
    const handleJoinRoom = (roomId) => {
        // Lấy tên hiển thị từ thông tin user (được truyền qua props)
        const username = user?.name || user?.email;

        // Truyền username qua state giống như JoinPage
        navigate(`/room/${roomId}`, {
            state: {
                username: username
            }
        });
    };

    // Render Loading
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">Đang tải danh sách phòng...</p>
            </div>
        );
    }

    // Render Error
    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // Render Empty State
    if (rooms.length === 0) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
                <div className="inline-block p-4 bg-gray-700 rounded-full mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Chưa có lịch sử phòng</h3>
                <p className="text-gray-400">Tạo phòng mới để bắt đầu xem video cùng bạn bè!</p>
            </div>
        );
    }

    // Render List
    return (
        <div className="space-y-4">
            {rooms.map((room) => (
                <div
                    key={room.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-200 group"
                >
                    <div className="flex items-center justify-between">
                        {/* Room Info */}
                        <div className="flex items-center space-x-4 flex-1">
                            {/* Icon */}
                            <div className="p-3 bg-gray-700 group-hover:bg-blue-600 rounded-lg transition-colors duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>{room.participants} người</span>
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
                                    {room.isActive && (
                                        <>
                                            <span>•</span>
                                            <span className="text-green-400 font-semibold">● Đang hoạt động</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => handleJoinRoom(room.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            <span>Vào Phòng</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RoomHistoryList;