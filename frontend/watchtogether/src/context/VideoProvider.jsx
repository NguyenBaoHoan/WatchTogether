import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoContext } from './VideoContext';
import { useRoom } from '../hooks/useRoom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


// ⭐ THÊM DÒNG NÀY ĐỂ FIX LỖI "global is not defined" KHI DÙNG STOMP.JS TRÊN TRÌNH DUYỆT
if (typeof global === 'undefined') {
  window.global = window;
}

export default function VideoProvider({ children }) {
  const { roomData } = useRoom();

  // ============================================
  // 📹 VIDEO STATE
  // ============================================
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  // ============================================
  // 🔒 SYNC FLAGS (Quan trọng!)
  // ============================================
  /**
   * isSyncing = true khi đang xử lý event từ server
   * Để tránh: Server event → Update player → Trigger onPlay → Send lại server (LOOP!)
   */
  const isSyncingRef = useRef(false);

  /**
   * WebSocket client reference
   */
  const stompClientRef = useRef(null);

  /**
   * Video player reference (YouTube IFrame API hoặc HTML5 video)
   */
  const playerRef = useRef(null);

  // ============================================
  // 📡 WEBSOCKET: Send events tới server
  // ============================================
  const sendVideoEvent = useCallback((type, extraData = {}) => {
    // Chỉ Host mới có quyền gửi events (optional: check role)
    if (!stompClientRef.current || !roomData?.roomId) {
      console.warn('Cannot send event: WebSocket not connected');
      return;
    }

    const event = {
      type,
      currentTime,
      videoUrl,
      timestamp: Date.now(),
      ...extraData,
    };

    console.log('📤 Sending video event:', event);

    stompClientRef.current.publish({
      destination: `/app/rooms/${roomData.roomId}/video`,
      body: JSON.stringify(event),
    });
  }, [roomData?.roomId, currentTime, videoUrl]);

  // ============================================
  // 🎬 VIDEO ACTIONS (được gọi bởi UI)
  // ============================================
  const playVideo = useCallback(() => {
    console.log('▶️ Play video triggered');
    setIsPlaying(true);

    // Nếu đang sync từ server, không gửi event (tránh loop)
    if (!isSyncingRef.current) {
      sendVideoEvent('PLAY');
    }

    // Gọi player API nếu có
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    }
  }, [sendVideoEvent]);

  const pauseVideo = useCallback(() => {
    console.log('⏸️ Pause video triggered');
    setIsPlaying(false);

    if (!isSyncingRef.current) {
      sendVideoEvent('PAUSE');
    }

    // Gọi player API nếu có
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, [sendVideoEvent]);

  const seekVideo = useCallback((time) => {
    console.log('⏩ Seek to:', time);
    const clampedTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(clampedTime);

    if (!isSyncingRef.current) {
      sendVideoEvent('SEEK', { currentTime: clampedTime });
    }

    // Gọi player API nếu có
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(clampedTime);
    }
  }, [sendVideoEvent, duration]);

  const changeVideo = useCallback((url) => {
    console.log('🔄 Change video to:', url);
    setVideoUrl(url);
    setCurrentTime(0);
    setIsPlaying(false);
    setDuration(0);

    if (!isSyncingRef.current) {
      sendVideoEvent('CHANGE', { videoUrl: url });
    }

    // Gọi player API nếu có
    if (playerRef.current?.loadVideoByUrl) {
      playerRef.current.loadVideoByUrl(url);
    }
  }, [sendVideoEvent]);

  // ============================================
  // 📊 UTILITY FUNCTIONS
  // ============================================
  const updateCurrentTime = useCallback((time) => {
    const now = Date.now();
    // Throttle updates để không spam quá nhiều
    if (now - lastSyncTime > 500) { // Chỉ update 2 lần/giây
      setCurrentTime(time);
      setLastSyncTime(now);
    }
  }, [lastSyncTime]);

  const updateDuration = useCallback((newDuration) => {
    console.log('📊 Duration updated:', newDuration);
    setDuration(newDuration);
  }, []);

  // Request sync from server (khi mới join room)
  const requestSync = useCallback(() => {
    if (!stompClientRef.current || !roomData?.roomId) return;

    console.log('🔄 Requesting sync from server...');
    stompClientRef.current.publish({
      destination: `/app/rooms/${roomData.roomId}/video/sync`,
      body: JSON.stringify({
        type: 'REQUEST_SYNC',
        timestamp: Date.now()
      }),
    });
  }, [roomData?.roomId]);

  // ============================================
  // 📡 WEBSOCKET: Nhận events từ server
  // ============================================
  useEffect(() => {
    // ⭐ Không cần kiểm tra accessToken nữa (đã có trong HttpOnly cookie)
    if (!roomData?.roomId) return;

    console.log('🔌 Connecting to WebSocket...');

    // Tạo STOMP client
    const client = new Client({
      // ⭐ Dùng relative path để tận dụng Vite proxy
      webSocketFactory: () => new SockJS('/ws'),
      // ⭐ Không cần connectHeaders (cookie sẽ tự động gửi)
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket connected');

      // Subscribe tới video events của phòng
      client.subscribe(`/topic/rooms/${roomData.roomId}/video`, (message) => {
        const event = JSON.parse(message.body);
        console.log('📥 Received video event:', event);

        // ⭐ BẬT FLAG: Đang sync từ server
        isSyncingRef.current = true;

        // Xử lý từng loại event
        switch (event.type) {
          case 'PLAY':
            console.log('📥 Sync: Playing video');
            setIsPlaying(true);
            // Nếu có player reference, gọi player.play()
            if (playerRef.current?.playVideo) {
              playerRef.current.playVideo();
            }
            break;

          case 'PAUSE':
            console.log('📥 Sync: Pausing video');
            setIsPlaying(false);
            if (playerRef.current?.pauseVideo) {
              playerRef.current.pauseVideo();
            }
            break;

          case 'SEEK':
            console.log('📥 Sync: Seeking to', event.currentTime);
            setCurrentTime(event.currentTime);
            if (playerRef.current?.seekTo) {
              playerRef.current.seekTo(event.currentTime);
            }
            break;

          case 'CHANGE':
            console.log('📥 Sync: Changing video to', event.videoUrl);
            setVideoUrl(event.videoUrl);
            setCurrentTime(0);
            setIsPlaying(false);
            setDuration(0);
            // Load video mới vào player
            if (playerRef.current?.loadVideoByUrl) {
              playerRef.current.loadVideoByUrl(event.videoUrl);
            }
            break;

          case 'SYNC_STATE':
            // Nhận trạng thái đầy đủ từ server
            console.log('📥 Sync: Full state received', event);
            if (event.videoUrl) setVideoUrl(event.videoUrl);
            if (typeof event.currentTime === 'number') setCurrentTime(event.currentTime);
            if (typeof event.isPlaying === 'boolean') setIsPlaying(event.isPlaying);

            // Apply to player
            if (playerRef.current) {
              if (event.videoUrl && playerRef.current.loadVideoByUrl) {
                playerRef.current.loadVideoByUrl(event.videoUrl);
              }
              if (typeof event.currentTime === 'number' && playerRef.current.seekTo) {
                playerRef.current.seekTo(event.currentTime);
              }
              if (event.isPlaying && playerRef.current.playVideo) {
                playerRef.current.playVideo();
              } else if (!event.isPlaying && playerRef.current.pauseVideo) {
                playerRef.current.pauseVideo();
              }
            }
            break;

          default:
            console.warn('Unknown event type:', event.type);
        }

        // ⭐ TẮT FLAG sau khi xử lý xong (delay nhỏ để chắc chắn)
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 100);
      });

      // Request initial sync khi connect thành công
      setTimeout(() => {
        requestSync();
      }, 1000);
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
    };

    client.activate();
    stompClientRef.current = client;

    // Cleanup khi unmount
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.roomId]); // ⭐ Bỏ accessToken khỏi dependencies

  // ============================================
  // 🎁 CONTEXT VALUE
  // ============================================
  const value = {
    // State
    videoUrl,
    isPlaying,
    currentTime,
    duration,
    isSyncing: isSyncingRef.current,

    // Actions
    playVideo,
    pauseVideo,
    seekVideo,
    changeVideo,
    updateCurrentTime,
    updateDuration,
    requestSync,

    // Refs
    playerRef,
  };

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}