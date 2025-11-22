/**
 * 📊 DashboardPage.jsx
 * 
 * Trang Dashboard sau khi đăng nhập thành công
 * - Hiển thị thông tin user từ JWT token
 * - Danh sách lịch sử phòng đã tạo
 * - Nút tạo phòng mới
 * - Giao diện hiện đại, responsive
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import RoomHistoryList from '../components/dashboard/RoomHistoryList';
const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isLoading } = useRoom();


    // Xử lý tạo phòng mới
    const handleCreateRoom = async () => {
        try {
            navigate('/join');
        } catch (error) {
            console.error(error);
            alert('Vui lòng thử lại!');
        }
    };

    // Xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold text-yellow-400">WatchTogether</span>
                            </div>

                        </div>

                        {/* User Info & Actions */}
                        <div className="flex items-center space-x-4">


                            {/* User Menu */}
                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-white font-semibold">{user?.name || user?.email || 'User'}</p>
                                    <p className="text-gray-400 text-sm">{user?.email}</p>
                                </div>

                                {/* Avatar & Dropdown */}
                                <div className="relative group">
                                    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg hover:shadow-lg transition-shadow duration-200">
                                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-150"
                                            >
                                                🚪 Đăng Xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title & Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Phòng Của Tôi</h1>

                    <div className="flex space-x-3">
                        {/* Nút Làm Mới */}
                        <button
                            onClick={() => window.location.reload()}
                            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                            title="Làm mới danh sách"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {/* Nút Tạo Phòng */}
                        <button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Đang tạo...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Tạo Phòng Mới</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Thay thế toàn bộ phần Room History List cũ bằng Component mới */}
                <RoomHistoryList user={user} />
            </main>
        </div>
    );
};

export default DashboardPage;
