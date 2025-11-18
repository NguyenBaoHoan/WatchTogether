import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoId, isPlaying, timestamp, onStateChange, onPlayerInstance, isSynced }) => {
    // Lưu trữ instance của YouTube Player để gọi lệnh (play/pause/seek)
    const playerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    // THÊM BIẾN NÀY: Cờ để chặn loop
    const isRemoteUpdate = useRef(false);
    // Timer để xử lý Debounce (Trì hoãn) cho sự kiện Pause
    const pauseTimeout = useRef(null);
    // Cấu hình Player

    // BẢO VỆ CHỐNG CRASH: Nếu không có videoId, không render
    if (!videoId) {
        return (
            <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg shadow flex items-center justify-center text-white">
                <p>Đang chờ video...</p>
            </div>
        );
    }

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin, // Fix lỗi chặn nhúng
        },
    };

    // 2. HÀM onReady: Nơi thực hiện cú Sync đầu tiên (First Sync)
    const onReady = (event) => {
        console.log("YouTube Player Ready!");
        playerRef.current = event.target;
        setIsReady(true);

        // Gửi instance ra ngoài cho App
        if (onPlayerInstance) {
            onPlayerInstance(event.target);
        }

        // --- THỰC HIỆN SYNC NGAY LẬP TỨC NẾU ĐÃ ĐƯỢC PHÉP (isSynced=true) ---
        if (isSynced) {
            console.log("Performing First Sync inside onReady...");
            try {
                isRemoteUpdate.current = true;
                // Seek trước
                event.target.seekTo(timestamp, true);
                // Play/Pause sau
                if (isPlaying) {
                    event.target.playVideo();
                } else {
                    event.target.pauseVideo();
                }
                // Tắt cờ sau 1s
                setTimeout(() => { isRemoteUpdate.current = false; }, 1000);
            } catch (e) {
                console.error("Error first sync:", e);
            }
        }
    };

    // 3. useEffect: Xử lý các lần Sync tiếp theo (khi Host thao tác)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        // Chỉ chạy nếu Player đã sẵn sàng VÀ đã được phép Sync
        if (!isReady || !playerRef.current || !isSynced) {
            return;
        }

        console.log("Syncing state update:", { isPlaying, timestamp });

        isRemoteUpdate.current = true;
        try {
            const player = playerRef.current;
            const playerState = player.getPlayerState();
            const currentTime = player.getCurrentTime();

            // 1. Đồng bộ Time (Seek)
            // Chỉ seek nếu lệch quá 1.5s để tránh giật cục
            if (Math.abs(currentTime - timestamp) > 1.5) {
                console.log(`Seeking to ${timestamp}`);
                player.seekTo(timestamp, true);
            }

            // 2. Đồng bộ Play/Pause
            if (isPlaying && playerState !== 1) {
                player.playVideo();
            } else if (!isPlaying && playerState === 1) {
                player.pauseVideo();
            }

        } catch (e) {
            console.error("Lỗi khi đang sync (useEffect):", e);
        }

        setTimeout(() => {
            isRemoteUpdate.current = false;
        }, 500);

    }, [isPlaying, timestamp, isReady, isSynced]);
    // Xử lý sự kiện người dùng bấm trên Player (Client -> Server)
    const handleStateChange = (event) => {
        if (isRemoteUpdate.current) return;

        const playerState = event.data;
        const currentTime = event.target.getCurrentTime();

        // Xóa timer Pause đang chờ (nếu có)
        if (pauseTimeout.current) {
            clearTimeout(pauseTimeout.current);
            pauseTimeout.current = null;
        }

        // 1 = PLAYING
        if (playerState === 1) {
            // Gửi lệnh PLAY (onStateChange đã được App.jsx lọc)
            onStateChange('PLAY', currentTime);
        }
        // 2 = PAUSED
        else if (playerState === 2) {
            // Chờ 250ms để lọc Pause do tua/lag
            pauseTimeout.current = setTimeout(() => {
                onStateChange('PAUSE', currentTime);
            }, 250);
        }
        // 3 = BUFFERING -> KHÔNG LÀM GÌ CẢ. 
        // Vì sau khi buffer xong, nó sẽ tự nhảy sang 1 hoặc 2.
    };
    // BẢO VỆ CHỐNG CRASH: Nếu không có videoId, không render YouTube Player
    if (!videoId) {
        return (
            <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                    <p>Vui lòng nhập link video...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-full">
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={handleStateChange}
                    className="w-full h-full" // Class cho iframe
                    iframeClassName="w-full h-full" // Class cho thẻ iframe thực tế
                    // Thêm Key để reset component khi đổi video
                    key={videoId}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;