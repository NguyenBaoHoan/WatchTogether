import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebsocket'; // Đảm bảo đường dẫn đúng
import VideoPlayer from '../components/roomJPA/VideoPlayer'; // Đảm bảo đường dẫn đúng
import ChatBox from '../components/roomJPA/ChatBox'; // Đảm bảo đường dẫn đúng
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/apiService';
import GlassRoomHeader from '../components/roomJPA/GlassRoomHeader';
import RoomTabs from '../components/roomJPA/RoomTab';
import RoomMembers from '../components/roomJPA/RoomMembers';
import PopularVideos from '../components/roomJPA/PopularVideos';
const RoomPageJPA = () => {
    // 1. Lấy RoomID từ URL và Username từ state
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định username: Lấy từ state (nếu từ JoinPage qua) HOẶC từ Auth (nếu đã login)
    const [username, setUsername] = useState(location.state?.username || user?.name || user?.email || '');


    // 2. Lấy thông tin user từ Auth Context (ưu tiên này hơn)
    const { user, isLoading } = useAuth();

    // 3. Cập nhật username khi user load xong (trường hợp F5 lại trang)
    useEffect(() => {
        if (user?.name || user?.email) {
            setUsername(user.name || user.email);
        }
    }, [user]);

    // 4. Logic bảo vệ: Chỉ đá về Join nếu KHÔNG có username VÀ KHÔNG đang loading user
    useEffect(() => {
        if (!isLoading && !username && !user) {
            toast.info("Vui lòng nhập tên để tham gia phòng!");
            // Quan trọng: Truyền roomId về để JoinPage biết
            navigate('/join', { state: { targetRoomId: roomId } });
        }
    }, [username, user, isLoading, navigate, roomId]);
    const [activeTab, setActiveTab] = useState('chat');
    // --- TOÀN BỘ LOGIC STATE VÀ HÀM TỪ APP.JSX CŨ ---
    // Room State
    const [messages, setMessages] = useState([]);
    const [videoState, setVideoState] = useState({
        videoId: 'M7lc1UVf-VE', // Default YT video
        isPlaying: false,
        timestamp: 0
    });
    const [inputVideoId, setInputVideoId] = useState('');
    const playerInstanceRef = useRef(null);

    // 1. State mới: Xác định đã bấm Sync chưa và có phải Host không
    const [isSynced, setIsSynced] = useState(false); // Mặc định là CHƯA Sync
    const [isHost, setIsHost] = useState(false);
    const [hostName, setHostName] = useState('');
    // Đánh dấu đang "chờ" phản hồi sync
    const [isWaitingForSync, setIsWaitingForSync] = useState(false);
    // 2. TẠO MỘT REF ĐỂ LƯU STATE MỚI NHẤT
    // Ref này sẽ giúp các callback (như handleVideoAction) luôn đọc được giá trị mới
    const stateRef = useRef({
        isHost: false,
        isSynced: false,
        videoId: videoState.videoId,
        isWaitingForSync: false // Thêm vào ref
    });

    // 3. CẬP NHẬT REF MỖI KHI STATE THAY ĐỔI
    useEffect(() => {
        stateRef.current = {
            isHost: isHost,
            isSynced: isSynced,
            videoId: videoState.videoId,
            isWaitingForSync: isWaitingForSync // Thêm vào ref
        };
    }, [isHost, isSynced, videoState.videoId, isWaitingForSync]); // Phụ thuộc vào các state này

    // WebSocket Callbacks
    const handleVideoAction = (data) => {
        if (data.type === 'ASK_SYNC') {
            // neu la host thi gui lai trang thai hien tai
            // Dùng ref để check (luôn là giá trị mới nhất)
            if (stateRef.current.isHost) {
                console.log('Host đang trả lời ASK_SYNC...');
                const currentTime = playerInstanceRef.current ? playerInstanceRef.current.getCurrentTime() : 0;
                // Gửi lệnh SYNC chứa thời gian thực của Host
                // Lưu ý: Gửi kèm trạng thái playing hiện tại của Host
                const currentStatus = playerInstanceRef.current ? (playerInstanceRef.current.getPlayerState() === 1 ? 'PLAY' : 'PAUSE') : 'PAUSE';
                sendVideoAction(currentStatus, videoState.videoId, currentTime);
            }
            return; // Không cần update state gì cả
        }
        // CỔNG KIỂM SOÁT LOGIC MỚI
        if (!stateRef.current.isHost && !stateRef.current.isSynced) {
            // Tôi là Guest VÀ chưa Sync.

            // Kiểm tra xem tôi có đang "chờ" không (đã bấm nút Sync chưa)
            if (stateRef.current.isWaitingForSync && (data.type === 'PLAY' || data.type === 'PAUSE')) {
                // ĐÚNG! Đây là tin nhắn trả lời tôi đang chờ.
                console.log("First sync received! Unlocking sync.");
                setIsSynced(true); // Mở cổng
                setIsWaitingForSync(false); // Ngừng chờ
            } else {
                // KHÔNG! Đây là lệnh Host tua/play/pause (nhiễu). Bỏ qua.
                console.log("Action bị bỏ qua (chưa sync và không phải là reply):", data.type);
                return;
            }
        }

        console.log('Received Action:', data);
        setVideoState(prev => ({
            ...prev,
            // Nếu nhận lệnh SYNC/PLAY thì cập nhật playing, ngược lại giữ nguyên
            isPlaying: data.type === 'PLAY',

            timestamp: data.timestamp,
            // Nếu có videoId mới thì cập nhật, không thì giữ cũ
            videoId: data.videoId || prev.videoId
        }));
    };

    // --- FETCH LỊCH SỬ CHAT TỪ DATABASE ---
    useEffect(() => {
        if (roomId && username) {
            console.log("Fetching chat history for room:", roomId);
            apiClient.get('/chat/history', {
                params: { roomId }
            })
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch chat history:", err));
        }
    }, [roomId, username]); // Chỉ chạy khi roomId hoặc username có giá trị (lúc mới vào)

    // Callback riêng để xử lý thông tin phòng (Host, Video đang phát...)
    const handleRoomInfo = (roomData) => {
        console.log("Received Room Info:", roomData);

        // 1. Cập nhật Host Name
        if (roomData.hostName) {
            setHostName(roomData.hostName);

            // Kiểm tra xem mình có phải Host không
            // So sánh với username hiện tại (hoặc email nếu bạn dùng email làm định danh)
            if (roomData.hostName === username) {
                setIsHost(true);
                setIsSynced(true);
                toast.info("Bạn là chủ phòng!");
            } else {
                setIsHost(false);
                setIsSynced(false);
            }
        }

        // 2. Cập nhật Video State (để người mới vào sync ngay)
        setVideoState(prev => ({
            ...prev,
            videoId: roomData.currentVideoId || 'M7lc1UVf-VE',
            timestamp: roomData.currentTime || 0,
            isPlaying: roomData.isPlaying || false
        }));
    };
    // Callback riêng để xử lý Chat
    const handleChatMessage = (msg) => {
        // Chỉ thêm tin nhắn vào list
        setMessages(prev => [...prev, msg]);
    };

    // Hook khởi tạo kết nối
    const { isConnected, sendVideoAction, sendChatMessage } = useWebSocket(
        roomId,
        username,
        handleVideoAction,
        handleChatMessage,
        handleRoomInfo
    );

    const onPlayerStateChange = (type, currentTime) => {
        // Chỉ cho phép gửi lệnh nếu đã Sync hoặc là Host
        if (isSynced || isHost) {
            sendVideoAction(type, videoState.videoId, currentTime);
        }
    };
    // ------------------------ CHANGE VIDEO ------------------------
    // 1. Hàm tách ID YouTube
    const getYouTubeID = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // 2. HÀM TRUNG TÂM: performVideoChange
    // Hàm này chịu trách nhiệm thay đổi video, bất kể nguồn gốc lệnh gọi (Input hay List)
    const performVideoChange = (newVideoId) => {
        console.log("Thực hiện đổi video sang ID:", newVideoId);
        
        // Logic kiểm tra Host/Sync để quyết định gửi lệnh hay chỉ đổi local
        if (isSynced || isHost) {
            // Case 1: Đổi cho cả phòng
            sendVideoAction('CHANGE_VIDEO', newVideoId, 0);
            toast.success("Đã đổi video phòng thành công!");
        } else {
            // Case 2: Chỉ đổi máy mình
            setVideoState(prev => ({
                ...prev,
                videoId: newVideoId,
                isPlaying: false,
                timestamp: 0
            }));
            toast.success("Đã đổi video local thành công!");
        }
    };

    // 3. Xử lý nút "Change Video" (Ô nhập liệu)
    const handleChangeVideo = () => {
        if (!inputVideoId.trim()) return toast.warning("Nhập link đi bạn ơi!");
        
        const extractedId = getYouTubeID(inputVideoId);
        if (extractedId) {
            performVideoChange(extractedId); // <-- GỌI HÀM CHUNG
            setInputVideoId(''); 
        } else {
            toast.error("Link YouTube lỗi rồi!");
        }
    };

    // 4. Xử lý click vào Card (Danh sách Popular)
    const handleSelectFromList = (videoId) => {
        performVideoChange(videoId); // <-- GỌI HÀM CHUNG (Y hệt bên trên)
        
        // Bonus: Cuộn lên đầu trang cho người dùng xem
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleSync = () => {
        if (!isConnected) {
            toast.error("Chưa kết nối tới server, không thể Sync!");
            return;
        }

        if (isHost) {
            // Nếu là Host: Gửi thời gian của mình cho mọi người (PUSH)
            const currentTime = playerInstanceRef.current ? playerInstanceRef.current.getCurrentTime() : 0;
            const currentStatus = playerInstanceRef.current ? (playerInstanceRef.current.getPlayerState() === 1 ? 'PLAY' : 'PAUSE') : 'PAUSE';
            // Gửi lệnh PLAY để ép mọi người chạy theo mình
            sendVideoAction(currentStatus, videoState.videoId, currentTime);

            console.log("Syncing at time:", currentTime); // Debug xem đúng chưa
            toast.success("Đã đồng bộ lại cho tất cả mọi người!");
        } else {
            // Guest bấm Sync: Đặt cờ "đang chờ" và gửi ASK_SYNC
            setIsWaitingForSync(true);
            sendVideoAction('ASK_SYNC', videoState.videoId, 0);
            toast.info("Đang lấy dữ liệu từ chủ phòng...");
        }
    };

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
                    <GlassRoomHeader roomId={roomId} username={username} />
                </div>
            </nav>

            <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* --- CỘT TRÁI: VIDEO PLAYER --- */}
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
                    {/* --- DANH SÁCH VIDEO PHỔ BIẾN --- */}
                    <PopularVideos onVideoSelect={handleSelectFromList} />
                </div>

                {/* --- CỘT PHẢI: TABS & CONTENT --- */}
                <div className="h-[600px] flex flex-col bg-[#1E2939] rounded-lg shadow-lg overflow-hidden border border-gray-700">

                    {/* 1. Thanh Tabs */}
                    <RoomTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* 2. Nội dung thay đổi theo Tab */}
                    <div className="flex-1 overflow-hidden relative bg-[#1E2939]">
                        {activeTab === 'chat' && (
                            // Wrapper div màu trắng để chứa ChatBox (vì ChatBox của bạn thiết kế nền sáng)
                            <div className="h-full bg-white">
                                <ChatBox
                                    messages={messages}
                                    onSendMessage={sendChatMessage}
                                    currentUser={username}
                                />
                            </div>
                        )}

                        {activeTab === 'members' && (
                            // Component Members đã được thiết kế tối màu sẵn
                            <RoomMembers
                                hostName={hostName}
                                currentUser={username}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomPageJPA;