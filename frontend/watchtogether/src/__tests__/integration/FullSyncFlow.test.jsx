/**
 * ============================================
 * TEST 4: INTEGRATION TEST - FULL SYNC FLOW
 * ============================================
 * 
 * Mục đích:
 * - Test toàn bộ flow từ đầu đến cuối
 * - Simulate multiple clients (Host + Guests)
 * - Test real-time sync giữa các clients
 * 
 * Full Backend Flow:
 * 1. Create room → Get cookie
 * 2. Connect WebSocket → Authenticate
 * 3. Subscribe to room events
 * 4. Send/receive video events
 * 5. New user join → Get initial state
 * 6. All users stay in sync
 * 
 * File: src/__tests__/integration/FullSyncFlow.test.jsx
 * Folder: src/__tests__/integration/
 */

import { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Simulate một client (user)
class SimulatedClient {
  constructor(id, roomId, onLog, onStateChange) {
    this.id = id;
    this.roomId = roomId;
    this.onLog = onLog;
    this.onStateChange = onStateChange;
    this.client = null;
    this.state = {
      videoUrl: '',
      currentTime: 0,
      isPlaying: false,
      playbackState: 'STOPPED'
    };
  }

  log(type, message) {
    this.onLog(this.id, type, message);
  }

  connect() {
    this.log('info', '🔌 Connecting...');
    
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => console.log(`[${this.id}]`, str),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      this.log('success', '✅ Connected!');

      // Subscribe to room events
      this.client.subscribe(`/topic/rooms/${this.roomId}/video`, (message) => {
        const event = JSON.parse(message.body);
        this.handleEvent(event);
      });

      // Subscribe to sync queue
      this.client.subscribe('/user/queue/video/sync', (message) => {
        const syncEvent = JSON.parse(message.body);
        this.log('success', `📥 Received SYNC_STATE`);
        this.applySyncState(syncEvent);
      });

      this.log('info', '📡 Subscribed to events');
    };

    this.client.onStompError = (frame) => {
      this.log('error', `❌ Error: ${frame.headers['message']}`);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.log('info', '🔌 Disconnected');
    }
  }

  sendEvent(type, data = {}) {
    if (!this.client) {
      this.log('error', '❌ Not connected');
      return;
    }

    const event = {
      type,
      currentTime: this.state.currentTime,
      timestamp: Date.now(),
      ...data
    };

    this.log('info', `📤 Sending ${type} event`);
    this.client.publish({
      destination: `/app/rooms/${this.roomId}/video`,
      body: JSON.stringify(event)
    });
  }

  handleEvent(event) {
    this.log('info', `📥 Received ${event.type}`);

    switch (event.type) {
      case 'PLAY':
        this.state.isPlaying = true;
        this.state.currentTime = event.currentTime || this.state.currentTime;
        this.state.playbackState = 'PLAYING';
        break;
      
      case 'PAUSE':
        this.state.isPlaying = false;
        this.state.currentTime = event.currentTime || this.state.currentTime;
        this.state.playbackState = 'PAUSED';
        break;
      
      case 'SEEK':
        this.state.currentTime = event.currentTime || 0;
        break;
      
      case 'CHANGE':
        this.state.videoUrl = event.videoUrl || '';
        this.state.currentTime = 0;
        this.state.isPlaying = false;
        break;
    }

    this.onStateChange(this.id, { ...this.state });
    this.log('success', `✓ State updated: ${JSON.stringify(this.state)}`);
  }

  applySyncState(syncEvent) {
    if (syncEvent.videoUrl) this.state.videoUrl = syncEvent.videoUrl;
    if (syncEvent.currentTime !== undefined) this.state.currentTime = syncEvent.currentTime;
    if (syncEvent.playbackState) {
      this.state.playbackState = syncEvent.playbackState;
      this.state.isPlaying = syncEvent.playbackState === 'PLAYING';
    }
    
    this.onStateChange(this.id, { ...this.state });
    this.log('success', `✓ Synced state: ${JSON.stringify(this.state)}`);
  }

  requestSync() {
    if (!this.client) return;
    
    this.log('info', '🔄 Requesting sync...');
    this.client.publish({
      destination: `/app/rooms/${this.roomId}/video/sync`,
      body: JSON.stringify({ type: 'REQUEST_SYNC', timestamp: Date.now() })
    });
  }
}

export default function FullSyncFlowTest() {
  const [roomId, setRoomId] = useState('integration-test-room');
  const [logs, setLogs] = useState([]);
  const [clientStates, setClientStates] = useState({});
  const clients = useRef({});

  const addLog = (clientId, type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { clientId, type, message, timestamp }]);
  };

  const updateClientState = (clientId, state) => {
    setClientStates(prev => ({ ...prev, [clientId]: state }));
  };

  // Create clients
  const createClient = (id) => {
    if (clients.current[id]) {
      addLog('system', 'warn', `Client ${id} already exists`);
      return;
    }

    const client = new SimulatedClient(id, roomId, addLog, updateClientState);
    clients.current[id] = client;
    client.connect();
  };

  const disconnectClient = (id) => {
    if (clients.current[id]) {
      clients.current[id].disconnect();
      delete clients.current[id];
      setClientStates(prev => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });
    }
  };

  const sendEventFromClient = (id, type, data) => {
    if (clients.current[id]) {
      clients.current[id].sendEvent(type, data);
    }
  };

  const requestSyncForClient = (id) => {
    if (clients.current[id]) {
      clients.current[id].requestSync();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(clients.current).forEach(client => client.disconnect());
    };
  }, []);

  // Check if all clients are in sync
  const checkSync = () => {
    const states = Object.values(clientStates);
    if (states.length < 2) {
      addLog('system', 'warn', 'Need at least 2 clients to check sync');
      return;
    }

    const firstState = states[0];
    const allInSync = states.every(state => 
      state.videoUrl === firstState.videoUrl &&
      Math.abs(state.currentTime - firstState.currentTime) < 1 && // Allow 1s difference
      state.isPlaying === firstState.isPlaying
    );

    if (allInSync) {
      addLog('system', 'success', '✅ All clients are IN SYNC!');
    } else {
      addLog('system', 'error', '❌ Clients are OUT OF SYNC!');
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          🧪 Test 4: Integration Test - Full Sync Flow
        </h2>

        {/* Room ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Client Management */}
        <div className="mb-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">👥 Client Management</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => createClient('Host')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Host
            </button>
            <button
              onClick={() => createClient('Guest1')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Guest 1
            </button>
            <button
              onClick={() => createClient('Guest2')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Guest 2
            </button>
            <button
              onClick={() => createClient('Guest3')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Guest 3
            </button>
            <button
              onClick={checkSync}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              🔍 Check Sync
            </button>
          </div>

          {/* Active Clients */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(clients.current).map(id => (
              <div key={id} className="border rounded p-2 text-center bg-gray-50">
                <div className="font-semibold">{id}</div>
                <button
                  onClick={() => disconnectClient(id)}
                  className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Event Controls */}
        <div className="mb-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">🎮 Send Events</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(clients.current).map(id => (
              <div key={id} className="border rounded p-3">
                <div className="font-semibold mb-2">{id}</div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => sendEventFromClient(id, 'PLAY')}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▶️ PLAY
                  </button>
                  <button
                    onClick={() => sendEventFromClient(id, 'PAUSE')}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    ⏸️ PAUSE
                  </button>
                  <button
                    onClick={() => sendEventFromClient(id, 'SEEK', { currentTime: 30 })}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ⏩ SEEK
                  </button>
                  <button
                    onClick={() => requestSyncForClient(id)}
                    className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    🔄 SYNC
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client States Display */}
        <div className="mb-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">📊 Client States</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(clientStates).map(([id, state]) => (
              <div key={id} className="border rounded p-3 bg-gray-50">
                <div className="font-semibold mb-2">{id}</div>
                <div className="text-xs space-y-1">
                  <div className={state.isPlaying ? 'text-green-600' : 'text-red-600'}>
                    {state.isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}
                  </div>
                  <div>Time: {state.currentTime.toFixed(1)}s</div>
                  <div className="truncate" title={state.videoUrl}>
                    URL: {state.videoUrl || '(none)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Test Scenarios:</h3>
          <ol className="list-decimal ml-5 space-y-2 text-sm">
            <li>
              <strong>Basic Sync:</strong> Add Host + Guest1 → Host PLAY → Check Guest1 synced
            </li>
            <li>
              <strong>Multiple Guests:</strong> Add Host + Guest1 + Guest2 → Host PAUSE → All synced
            </li>
            <li>
              <strong>Late Join:</strong> Host PLAY → Add Guest3 → Guest3 request sync → Guest3 catches up
            </li>
            <li>
              <strong>Guest Control:</strong> Guest sends SEEK → All clients sync to new time
            </li>
            <li>
              <strong>Check Sync:</strong> Click "Check Sync" → Verify all clients same state
            </li>
          </ol>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">📜 Logs</h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
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
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                <span className="text-purple-400">[{log.clientId}]</span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Expected Results */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Expected Results:</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>Tất cả clients kết nối thành công với cookie authentication</li>
            <li>Khi 1 client send event → All clients nhận được và sync state</li>
            <li>Client mới join request sync → Nhận current state từ Redis</li>
            <li>Click "Check Sync" → All clients có same state</li>
            <li>Backend logs hiển thị broadcast events và state updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
