// src/components/roomJPA/VoiceChat.jsx
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// =============================================================================
// HƯỚNG DẪN LẤY APP_ID VÀ SERVER_SECRET (MIỄN PHÍ):
// 1. Truy cập: https://console.zegocloud.com/
// 2. Đăng ký tài khoản miễn phí (Free Tier: 10,000 phút/tháng)
// 3. Tạo Project mới -> Chọn "Voice & Video Call"
// 4. Vào Dashboard -> Copy AppID và ServerSecret
// =============================================================================
const APP_ID = 2045587269; // ⚠️ THAY BẰNG APP_ID CỦA BẠN
const SERVER_SECRET = "9819896a2d9514a43e1a6f692a24110a"; // ⚠️ THAY BẰNG SERVER_SECRET CỦA BẠN

const VoiceChat = forwardRef(({ roomId, username, isVisible, onClose, mode = 'voice' }, ref) => {
    const meetingContainerRef = useRef(null);
    const zegoInstanceRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [error, setError] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false); // Thu gọn/Mở rộng

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        leaveRoom: () => {
            if (zegoInstanceRef.current) {
                zegoInstanceRef.current.destroy();
                zegoInstanceRef.current = null;
                setIsJoined(false);
            }
        }
    }));

    useEffect(() => {
        if (!isVisible || !roomId || !username) return;
        if (zegoInstanceRef.current) return; // Đã join rồi thì không join lại

        const initMeeting = async () => {
            try {
                // Tạo unique userID để tránh conflict
                const userID = `${username}_${Date.now()}`;

                // 1. Tạo Kit Token
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    APP_ID,
                    SERVER_SECRET,
                    `watchtogether_${roomId}`, // Prefix để tránh trùng với room khác
                    userID,
                    username || 'Guest'
                );

                // 2. Khởi tạo instance
                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zegoInstanceRef.current = zp;

                // 3. Join phòng với config compact - ẩn hết toolbar
                zp.joinRoom({
                    container: meetingContainerRef.current,
                    sharedLinks: [],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.GroupCall,
                    },
                    showPreJoinView: false,
                    layout: "Grid",
                    showUserList: false,
                    showLayoutButton: false,
                    showScreenSharingButton: false,
                    showRoomDetailsButton: false,
                    maxUsers: 10,
                    // Cấu hình mặc định tùy theo mode
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: mode === 'video',
                    // UI tối giản - ẩn hết các nút
                    showLeaveRoomConfirmDialog: false,
                    showRoomTimer: false,
                    showMyCameraToggleButton: true,
                    showMyMicrophoneToggleButton: true,
                    showAudioVideoSettingsButton: false,
                    showTextChat: false,
                    showRemoveUserButton: false,
                    lowerLeftNotification: {
                        showUserJoinAndLeave: false,
                        showTextChat: false,
                    },
                    // Callbacks
                    onJoinRoom: () => {
                        console.log('✅ Đã tham gia voice/video room');
                        setIsJoined(true);
                    },
                    onLeaveRoom: () => {
                        console.log('👋 Đã rời voice/video room');
                        setIsJoined(false);
                    },
                    onUserJoin: (users) => {
                        console.log('👤 User joined:', users);
                    },
                    onUserLeave: (users) => {
                        console.log('👤 User left:', users);
                    },
                });
            } catch (err) {
                console.error('Lỗi khởi tạo Voice Chat:', err);
                setError('Không thể kết nối Voice Chat. Vui lòng thử lại!');
            }
        };

        // Delay nhỏ để đảm bảo container đã mount
        const timer = setTimeout(() => {
            if (meetingContainerRef.current) {
                initMeeting();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isVisible, roomId, username, mode]);

    // Cleanup khi component unmount hoặc ẩn
    useEffect(() => {
        return () => {
            if (zegoInstanceRef.current) {
                zegoInstanceRef.current.destroy();
                zegoInstanceRef.current = null;
            }
        };
    }, []);

    if (!isVisible) return null;

    const handleLeave = () => {
        if (zegoInstanceRef.current) {
            zegoInstanceRef.current.destroy();
            zegoInstanceRef.current = null;
            setIsJoined(false);
        }
        onClose?.();
    };

    return (
        // INLINE SECTION - Nằm giữa video chính và Popular Videos
        // overflow-hidden và relative để giới hạn Zego SDK không tràn ra ngoài
        <div className="voice-chat-container bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden relative" style={{ isolation: 'isolate' }}>
            {/* Header Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 relative z-20">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="text-white font-medium">
                        {mode === 'video' ? 'Video Call' : 'Voice Chat'}
                    </span>
                    <span className="text-gray-400 text-sm">
                        • Room: {roomId}
                    </span>
                    {isJoined && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                            Đang kết nối
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Toggle Minimize */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title={isMinimized ? "Mở rộng" : "Thu gọn"}
                    >
                        {isMinimized ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        )}
                    </button>

                    {/* Leave Button */}
                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Rời cuộc gọi
                    </button>
                </div>
            </div>

            {/* Zego Container - Ẩn khi minimize */}
            {!isMinimized && (
                <div
                    className="relative bg-gray-800"
                    style={{
                        height: '320px',  // Tăng chiều cao để hiển thị đủ toolbar
                        minHeight: '320px'
                    }}
                >
                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
                            <div className="text-center p-6">
                                <div className="text-red-400 text-4xl mb-3">⚠️</div>
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        onClose?.();
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Zego Video Container - Wrapper để giới hạn SDK */}
                    <div
                        className="zego-container-wrapper w-full h-full bg-gray-800"
                        ref={meetingContainerRef}
                        style={{
                            position: 'relative',
                            height: '100%',
                        }}
                    ></div>

                    {/* Loading State */}
                    {!isJoined && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-300">Đang kết nối tới cuộc gọi...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Minimized Status Bar */}
            {isMinimized && (
                <div className="flex items-center justify-center py-3 bg-gray-800/50">
                    <span className="text-gray-400 text-sm">
                        {isJoined ? '🟢 Đang trong cuộc gọi - Bấm mũi tên để mở rộng' : '⏳ Đang kết nối...'}
                    </span>
                </div>
            )}
        </div>
    );
});

VoiceChat.displayName = 'VoiceChat';

export default VoiceChat;