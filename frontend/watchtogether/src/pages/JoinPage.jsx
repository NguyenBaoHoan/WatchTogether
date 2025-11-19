import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/apiService';
import { toast } from 'react-toastify';

function JoinPage() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [roomName, setRoomName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState(''); // State cho ID phòng để join
  const [guestName, setGuestName] = useState(''); // State cho tên khách vãng lai

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Lấy state từ redirect

  const { user, isAuthenticated } = useAuth();

  // 1. Xử lý khi bị Redirect từ RoomPage về (có kèm targetRoomId)
  useEffect(() => {
    if (location.state?.targetRoomId) {
      setActiveTab('join'); // Chuyển sang tab Join
      setRoomIdToJoin(location.state.targetRoomId); // Điền sẵn ID
      toast.info("Vui lòng nhập tên để tiếp tục vào phòng.");
    }
  }, [location.state]);

  // --- HÀM TẠO PHÒNG (Giữ nguyên) ---
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.warning("Vui lòng nhập tên phòng!");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để tạo phòng!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        roomName: roomName,
        username: user?.name || user?.email
      };
      const response = await apiClient.post('/rooms/create', payload);
      const roomData = response.data;
      toast.success(`Tạo phòng "${roomName}" thành công!`);
      navigate(`/room/${roomData.roomId}`, { state: { username: user?.name || user?.email } });
    } catch (error) {
      console.error("Create room error:", error);
      toast.error(typeof error.response?.data === 'string' ? error.response.data : "Lỗi tạo phòng!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀM THAM GIA PHÒNG (Logic Mới) ---
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomIdToJoin.trim()) {
      toast.warning("Vui lòng nhập ID phòng!");
      return;
    }

    // Tên hiển thị: Ưu tiên User đã login, nếu không thì lấy Guest Name nhập tay
    const finalUsername = user?.name || user?.email || guestName;

    if (!finalUsername.trim()) {
      toast.warning("Vui lòng nhập tên hiển thị!");
      return;
    }

    // Điều hướng thẳng vào phòng
    navigate(`/room/${roomIdToJoin}`, { state: { username: finalUsername } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl w-96">

        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">WatchTogether</h1>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-600 mb-6">
          <button
            className={`flex-1 py-2 font-semibold ${activeTab === 'create' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('create')}
          >
            Tạo Phòng
          </button>
          <button
            className={`flex-1 py-2 font-semibold ${activeTab === 'join' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('join')}
          >
            Vào Phòng
          </button>
        </div>

        <div className="mb-6 text-center text-gray-300">
          Xin chào, <span className="font-bold text-blue-400">{user?.name || user?.email || 'Guest'}</span>
        </div>

        {/* FORM TẠO PHÒNG */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tên phòng mới</label>
              <input
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ví dụ: Anime Night..."
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white p-3 rounded-lg font-bold shadow-lg transition-all ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                }`}
            >
              {isLoading ? 'Đang tạo...' : '🚀 Tạo & Tham Gia'}
            </button>
          </form>
        )}

        {/* FORM THAM GIA PHÒNG */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nhập ID Phòng</label>
              <input
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Dán ID phòng vào đây..."
                value={roomIdToJoin}
                onChange={e => setRoomIdToJoin(e.target.value)}
                autoFocus
              />
            </div>

            {/* Nếu chưa đăng nhập thì hiện ô nhập tên */}
            {!isAuthenticated && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên hiển thị của bạn</label>
                <input
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Tên bạn là gì?"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full text-white p-3 rounded-lg font-bold shadow-lg bg-green-600 hover:bg-green-500 transition-all"
            >
              👉 Vào Ngay
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-gray-400 p-2 text-sm hover:text-white transition-colors mt-4"
        >
          ← Quay lại Dashboard
        </button>
      </div>
    </div>
  );
}

export default JoinPage;