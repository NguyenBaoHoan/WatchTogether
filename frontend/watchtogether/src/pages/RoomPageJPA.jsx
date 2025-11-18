import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebsocket'; // Đảm bảo đường dẫn đúng
import VideoPlayer from '../components/VideoPlayer'; // Đảm bảo đường dẫn đúng
import ChatBox from '../components/ChatBox'; // Đảm bảo đường dẫn đúng
import { ToastContainer, toast } from 'react-toastify';

const RoomPageJPA = () => {
    // 1. Lấy RoomID từ URL và Username từ state
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // State "username" được truyền từ JoinPage
    const [username] = useState(location.state?.username || '');

    // 2. Kiểm tra nếu vào thẳng link mà không có username
    useEffect(() => {
        if (!username) {
            toast.error("Vui lòng tham gia từ trang join!");
            navigate('/join'); // Đẩy về trang join
        }
    }, [username, navigate]);

    // --- TOÀN BỘ LOGIC STATE VÀ HÀM TỪ APP.JSX CŨ ---
    // (Dán toàn bộ logic bạn đã gửi vào đây)

    const [messages, setMessages] = useState([]);
    const [videoState, setVideoState] = useState({
        videoId: 'M7lc1UVf-VE',
        isPlaying: false,
        timestamp: 0
    });
    const [inputVideoId, setInputVideoId] = useState('');
    const playerInstanceRef = useRef(null);
    const [isSynced, setIsSynced] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [hostName, setHostName] = useState('');
    const [isWaitingForSync, setIsWaitingForSync] = useState(false);

    const stateRef = useRef({
        isHost: false,
        isSynced: false,
        videoId: videoState.videoId,
        isWaitingForSync: false
    });

    useEffect(() => {
        stateRef.current = {
            isHost: isHost,
            isSynced: isSynced,
            videoId: videoState.videoId,
            isWaitingForSync: isWaitingForSync
        };
    }, [isHost, isSynced, videoState.videoId, isWaitingForSync]);

    const handleVideoAction = (data) => {
        if (data.type === 'ASK_SYNC') {
            if (stateRef.current.isHost) {
                console.log('Host đang trả lời ASK_SYNC...');
                const currentTime = playerInstanceRef.current ? playerInstanceRef.current.getCurrentTime() : 0;
                const currentStatus = playerInstanceRef.current ? (playerInstanceRef.current.getPlayerState() === 1 ? 'PLAY' : 'PAUSE') : 'PAUSE';
                sendVideoAction(currentStatus, stateRef.current.videoId, currentTime);
            }
            return;
        }

        if (!stateRef.current.isHost && !stateRef.current.isSynced) {
            if (stateRef.current.isWaitingForSync && (data.type === 'PLAY' || data.type === 'PAUSE')) {
                console.log("First sync received! Unlocking sync.");
                setIsSynced(true);
                setIsWaitingForSync(false);
            } else {
                console.log("Action bị bỏ qua (chưa sync và không phải là reply):", data.type);
                return;
            }
        }

        console.log('Received Action:', data);
        setVideoState(prev => ({
            ...prev,
            isPlaying: data.type === 'PLAY',
            timestamp: data.timestamp,
            videoId: data.videoId || prev.videoId
        }));
    };

    const handleChatMessage = (msg) => {
        if (msg.hostName) {
            setHostName(msg.hostName);
            if (msg.hostName === username) {
                setIsHost(true);
                setIsSynced(true);
                toast.info("Bạn là chủ phòng!");
            } else {
                setIsHost(false);
                setIsSynced(false);
            }
            setVideoState(prev => ({
                ...prev,
                videoId: msg.currentVideoId,
                timestamp: msg.currentTime,
                isPlaying: false
            }));
        } else {
            setMessages(prev => [...prev, msg]);
        }
    };

    const { isConnected, sendVideoAction, sendChatMessage } = useWebSocket(
        roomId, // <== Lấy từ useParams
        username, // <== Lấy từ useLocation
        handleVideoAction,
        handleChatMessage
    );

    const onPlayerStateChange = (type, currentTime) => {
        if (isSynced || isHost) {
            sendVideoAction(type, videoState.videoId, currentTime);
        }
    };

    const getYouTubeID = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleChangeVideo = () => {
        if (!isHost) {
            toast.error("Chỉ chủ phòng mới được đổi video!");
            return;
        }
        if (!inputVideoId.trim()) {
            toast.warning("Vui lòng nhập link YouTube!");
            return;
        }
        const extractedId = getYouTubeID(inputVideoId);
        if (extractedId) {
            sendVideoAction('CHANGE_VIDEO', extractedId, 0);
            setInputVideoId('');
            toast.success("Đã đổi video thành công!");
        } else {
            toast.error("Link YouTube không hợp lệ! Vui lòng kiểm tra lại.");
            console.error("Invalid URL:", inputVideoId);
        }
    };

    const handleSync = () => {
        if (!isConnected) {
            toast.error("Chưa kết nối tới server, không thể Sync!");
            return;
        }
        if (isHost) {
            const currentTime = playerInstanceRef.current ? playerInstanceRef.current.getCurrentTime() : 0;
            const currentStatus = playerInstanceRef.current ? (playerInstanceRef.current.getPlayerState() === 1 ? 'PLAY' : 'PAUSE') : 'PAUSE';
            sendVideoAction(currentStatus, videoState.videoId, currentTime);
            toast.success("Đã đồng bộ lại cho tất cả mọi người!");
        } else {
            setIsWaitingForSync(true);
            sendVideoAction('ASK_SYNC', videoState.videoId, 0);
            toast.info("Đang lấy dữ liệu từ chủ phòng...");
        }
    };

    // --- JSX CỦA PHÒNG XEM (step === 2) ---
    // (Thêm text-white để đọc được trên nền tối)
    return (
        <div className="min-h-screen text-white">
            <ToastContainer position="top-right" autoClose={3000} />

            <nav className="bg-gray-800 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-xl font-bold flex items-center gap-2">
                        <span>WatchTogether</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                            {isConnected ? 'Connected' : 'Connecting...'}
                        </span>
                    </div>
                    <div>Room: {roomId} | User: {username}</div>
                </div>
            </nav>

            <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-3 rounded-lg shadow flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="text-lg font-semibold text-gray-700">
                                Current Host: <span className="text-blue-600 font-bold">{hostName}</span>
                            </span>
                        </div>
                        {isHost && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">
                                You are the Host
                            </span>
                        )}
                    </div>

                    <VideoPlayer
                        videoId={videoState.videoId}
                        isPlaying={isSynced ? videoState.isPlaying : false}
                        timestamp={videoState.timestamp}
                        onStateChange={onPlayerStateChange}
                        onPlayerInstance={(player) => { playerInstanceRef.current = player; }}
                    />

                    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-center">
                        <div className="flex-1 flex gap-2">
                            <input
                                className="flex-1 border p-2 rounded text-black" // Thêm text-black
                                placeholder="Paste YouTube ID (e.g. M7lc1UVf-VE)"
                                value={inputVideoId}
                                onChange={(e) => setInputVideoId(e.target.value)}
                            />
                            <button
                                onClick={handleChangeVideo}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Change Video
                            </button>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={!isConnected}
                            className={`px-6 py-2 rounded text-white font-bold transition-colors ${!isSynced
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                : 'bg-green-500 hover:bg-green-600'
                                }`}
                        >
                            {!isSynced ? "BẤM ĐỂ SYNC" : "Resync"}
                        </button>
                    </div>

                    {!isSynced && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                            <p className="font-bold">Chào mừng {username}!</p>
                            <p>Bạn đang ở chế độ chờ. Hãy bấm nút <b>SYNC</b> màu đỏ để bắt đầu xem cùng mọi người.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 h-[600px]">
                    <ChatBox messages={messages} onSendMessage={sendChatMessage} />
                    <div className="bg-white rounded p-4 shadow">
                        <h3 className="font-bold mb-2 text-gray-700">Coming Soon: Queue</h3>
                        <p className="text-sm text-gray-500">Video queue functionality will be implemented here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomPageJPA;