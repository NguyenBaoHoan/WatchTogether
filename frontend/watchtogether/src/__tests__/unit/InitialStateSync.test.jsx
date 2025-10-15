/**
 * ============================================
 * TEST 3: INITIAL STATE SYNC (User mới join phòng)
 * ============================================
 * 
 * Mục đích:
 * - Test user mới join nhận được state hiện tại của video
 * - Test REQUEST_SYNC và SYNC_STATE events
 * - Test sync từ Redis state
 * 
 * Backend flow tương ứng:
 * 1. Client mới join → Connect WebSocket
 * 2. Client subscribe /queue/video/sync (private queue)
 * 3. Client gửi REQUEST_SYNC → /app/rooms/{roomId}/video
 * 4. VideoSyncService.sendCurrentStateToUser()
 *    - Lấy room state từ Redis
 *    - Tạo SYNC_STATE event
 *    - Send riêng tới user via /queue
 * 5. Client nhận SYNC_STATE và apply state
 * 
 * File: src/__tests__/unit/InitialStateSync.test.jsx
 * Folder: src/__tests__/unit/
 */

import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function InitialStateSyncTest() {
  const [roomId, setRoomId] = useState('test-room-123');
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [syncStatus, setSyncStatus] = useState('NOT_SYNCED');
  const [logs, setLogs] = useState([]);
  
  // Player state (sẽ được sync từ server)
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackState, setPlaybackState] = useState('STOPPED');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const clientRef = useRef(null);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Simulate existing room state (normally this would be set by Host)
  const simulateExistingRoomState = () => {
    addLog('info', '🎬 Simulating existing room state in Redis...');
    addLog('info', 'Room state: videoUrl=https://example.com/video.mp4, position=45.5s, state=PLAYING');
    
    // Note: Trong thực tế, bạn cần có Host client gửi events trước
    // hoặc dùng Postman để set room state trong Redis
  };

  // Connect as new user
  const connectAsNewUser = () => {
    addLog('info', '👤 Connecting as NEW USER...');
    setConnectionStatus('CONNECTING');
    setSyncStatus('NOT_SYNCED');

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      addLog('success', '✅ Connected!');
      setConnectionStatus('CONNECTED');

      // ⭐ BƯỚC 1: Subscribe tới private queue để nhận SYNC_STATE
      client.subscribe('/user/queue/video/sync', (message) => {
        const syncEvent = JSON.parse(message.body);
        addLog('success', `📥 Received SYNC_STATE from server!`);
        addLog('info', `State: ${JSON.stringify(syncEvent, null, 2)}`);
        
        // ⭐ BƯỚC 2: Apply sync state to player
        applySyncState(syncEvent);
      });

      // ⭐ BƯỚC 3: Subscribe tới room events (như client bình thường)
      client.subscribe(`/topic/rooms/${roomId}/video`, (message) => {
        const event = JSON.parse(message.body);
        addLog('info', `📥 Received room event: ${event.type}`);
        handleRoomEvent(event);
      });

      addLog('info', '📡 Subscribed to sync queue and room events');

      // ⭐ BƯỚC 4: Request current state từ server
      // Note: Phần này cần backend implement endpoint REQUEST_SYNC
      // Hoặc tự động gửi khi user join
      setTimeout(() => {
        requestSync(client);
      }, 1000);
    };

    client.onStompError = (frame) => {
      addLog('error', `❌ STOMP error: ${frame.headers['message']}`);
      setConnectionStatus('ERROR');
    };

    client.activate();
    clientRef.current = client;
  };

  // Request sync from server
  const requestSync = (client) => {
    addLog('info', '🔄 Requesting current state from server...');
    setSyncStatus('REQUESTING');

    const requestEvent = {
      type: 'REQUEST_SYNC',
      timestamp: Date.now()
    };

    client.publish({
      destination: `/app/rooms/${roomId}/video/sync`,
      body: JSON.stringify(requestEvent)
    });
  };

  // Apply sync state from server
  const applySyncState = (syncEvent) => {
    try {
      // Set video URL
      if (syncEvent.videoUrl) {
        setVideoUrl(syncEvent.videoUrl);
        addLog('success', `🎬 Video URL: ${syncEvent.videoUrl}`);
      }

      // Set current time
      if (syncEvent.currentTime !== undefined) {
        setCurrentTime(syncEvent.currentTime);
        addLog('success', `⏱️ Current time: ${syncEvent.currentTime}s`);
      }

      // Set playback state
      if (syncEvent.playbackState) {
        setPlaybackState(syncEvent.playbackState);
        setIsPlaying(syncEvent.playbackState === 'PLAYING');
        addLog('success', `▶️ Playback state: ${syncEvent.playbackState}`);
      }

      setSyncStatus('SYNCED');
      addLog('success', '✅ Sync completed! Player state updated.');

    } catch (error) {
      addLog('error', `❌ Failed to apply sync state: ${error.message}`);
      setSyncStatus('ERROR');
    }
  };

  // Handle room events (after initial sync)
  const handleRoomEvent = (event) => {
    switch (event.type) {
      case 'PLAY':
        setIsPlaying(true);
        if (event.currentTime !== undefined) {
          setCurrentTime(event.currentTime);
        }
        addLog('info', `▶️ Synced: PLAY at ${event.currentTime}s`);
        break;
      
      case 'PAUSE':
        setIsPlaying(false);
        if (event.currentTime !== undefined) {
          setCurrentTime(event.currentTime);
        }
        addLog('info', `⏸️ Synced: PAUSE at ${event.currentTime}s`);
        break;
      
      case 'SEEK':
        if (event.currentTime !== undefined) {
          setCurrentTime(event.currentTime);
        }
        addLog('info', `⏩ Synced: SEEK to ${event.currentTime}s`);
        break;
      
      case 'CHANGE':
        if (event.videoUrl) {
          setVideoUrl(event.videoUrl);
          setCurrentTime(0);
          setIsPlaying(false);
        }
        addLog('info', `🔄 Synced: VIDEO CHANGED to ${event.videoUrl}`);
        break;
    }
  };

  // Disconnect
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      setConnectionStatus('DISCONNECTED');
      setSyncStatus('NOT_SYNCED');
      addLog('info', '🔌 Disconnected');
    }
  };

  // Manual request sync
  const manualRequestSync = () => {
    if (clientRef.current && connectionStatus === 'CONNECTED') {
      requestSync(clientRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          🧪 Test 3: Initial State Sync (New User)
        </h2>

        {/* Room ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={connectionStatus === 'CONNECTED'}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Status */}
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            connectionStatus === 'CONNECTED' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'CONNECTING' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'ERROR' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Connection: {connectionStatus}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            syncStatus === 'SYNCED' ? 'bg-green-100 text-green-800' :
            syncStatus === 'REQUESTING' ? 'bg-yellow-100 text-yellow-800' :
            syncStatus === 'ERROR' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Sync: {syncStatus}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={simulateExistingRoomState}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            1. Simulate Room State
          </button>
          <button
            onClick={connectAsNewUser}
            disabled={connectionStatus === 'CONNECTED'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            2. Connect as New User
          </button>
          <button
            onClick={manualRequestSync}
            disabled={connectionStatus !== 'CONNECTED'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Request Sync
          </button>
          <button
            onClick={disconnect}
            disabled={connectionStatus !== 'CONNECTED'}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>

        {/* Synced Player State Display */}
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h3 className="font-semibold mb-3">📺 Synced Player State</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Video URL:</div>
              <div className="font-mono text-xs bg-white p-2 rounded border break-all">
                {videoUrl || '(not set)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Playback State:</div>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                <span className={isPlaying ? 'text-green-600' : 'text-red-600'}>
                  {playbackState || '(not set)'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Time:</div>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                {currentTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Is Playing:</div>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                {isPlaying ? '▶️ YES' : '⏸️ NO'}
              </div>
            </div>
          </div>
        </div>

        {/* Expected Results */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Expected Results:</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>✅ Connect → Request sync → Receive SYNC_STATE → Player state updates</li>
            <li>✅ State phải match với room state trong Redis</li>
            <li>✅ Backend log: &quot;Sending current state to user sessionId&quot;</li>
            <li>✅ Sau sync, nhận được room events như bình thường</li>
          </ul>
        </div>

        {/* Test Instructions */}
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold mb-2">📝 How to Test:</h3>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Mở tab 1 (Host): Send PLAY event để set room state</li>
            <li>Mở tab 2 (New User): Click "Connect as New User"</li>
            <li>Tab 2 tự động request sync và nhận state từ Redis</li>
            <li>Verify: Tab 2 player state = Tab 1 player state</li>
          </ol>
        </div>

        {/* Logs */}
        <div>
          <h3 className="font-semibold mb-2">📜 Logs</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Backend Mapping */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">🔗 Backend Flow:</h3>
          <ol className="list-decimal ml-5 space-y-1">
            <li><code>Client</code> → Subscribe /user/queue/video/sync</li>
            <li><code>Client</code> → Publish REQUEST_SYNC → /app/rooms/{'{'}roomId{'}'}/video/sync</li>
            <li><code>VideoSyncService.sendCurrentStateToUser()</code> → Get room từ Redis</li>
            <li><code>messagingTemplate.convertAndSendToUser()</code> → Send SYNC_STATE</li>
            <li><code>Client</code> → Receive and apply state</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
