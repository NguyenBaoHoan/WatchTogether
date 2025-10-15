/**
 * ============================================
 * TEST 1: WEBSOCKET CONNECTION & AUTHENTICATION
 * ============================================
 * 
 * Mục đích:
 * - Test kết nối WebSocket với backend
 * - Test xác thực JWT qua cookie HttpOnly
 * - Test handshake interceptor
 * 
 * Backend flow tương ứng:
 * 1. Client connect → SockJS('/ws')
 * 2. WebSocketHandshakeInterceptor.beforeHandshake()
 *    - Extract JWT từ cookie WT_ACCESS_TOKEN
 *    - Validate token
 *    - Set session attributes (participantId, roomId)
 * 3. Return true/false → allow/reject connection
 * 
 * File: src/__tests__/unit/WebSocketConnection.test.jsx
 * Folder: src/__tests__/unit/
 */

import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Component test WebSocket connection
 * Hiển thị status connection và logs
 */
export default function WebSocketConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [logs, setLogs] = useState([]);
  const [client, setClient] = useState(null);

  // Helper: Add log message
  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Test: Kết nối WebSocket với cookie authentication
  const testConnection = () => {
    addLog('info', '🔌 Starting WebSocket connection test...');
    setConnectionStatus('CONNECTING');

    try {
      // ⭐ QUAN TRỌNG: Không truyền Authorization header
      // Cookie HttpOnly sẽ tự động gửi kèm request
      const stompClient = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        
        // Debug callback
        debug: (str) => {
          addLog('debug', `STOMP: ${str}`);
        },

        // Connection settings
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Callback khi connect thành công
      stompClient.onConnect = (frame) => {
        addLog('success', '✅ WebSocket connected successfully!');
        addLog('info', `Frame: ${JSON.stringify(frame.headers)}`);
        setConnectionStatus('CONNECTED');

        // Test: Subscribe để nhận messages
        stompClient.subscribe('/user/queue/video/sync', (message) => {
          addLog('info', `📥 Received message: ${message.body}`);
        });
      };

      // Callback khi có lỗi STOMP
      stompClient.onStompError = (frame) => {
        addLog('error', `❌ STOMP error: ${frame.headers['message']}`);
        addLog('error', `Details: ${frame.body}`);
        setConnectionStatus('ERROR');
      };

      // Callback khi disconnect
      stompClient.onDisconnect = () => {
        addLog('warn', '🔌 Disconnected from WebSocket');
        setConnectionStatus('DISCONNECTED');
      };

      // Activate connection
      stompClient.activate();
      setClient(stompClient);

    } catch (error) {
      addLog('error', `❌ Connection failed: ${error.message}`);
      setConnectionStatus('ERROR');
    }
  };

  // Test: Disconnect
  const testDisconnect = () => {
    if (client) {
      addLog('info', '🔌 Disconnecting...');
      client.deactivate();
      setClient(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [client]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          🧪 Test 1: WebSocket Connection
        </h2>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            connectionStatus === 'CONNECTED' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'CONNECTING' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'ERROR' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Status: {connectionStatus}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'CONNECTED'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={testDisconnect}
            disabled={connectionStatus !== 'CONNECTED'}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Expected Results:</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            <li>✅ Nếu có cookie WT_ACCESS_TOKEN: Connection thành công</li>
            <li>❌ Nếu không có cookie: Connection failed (401 Unauthorized)</li>
            <li>📡 Backend log: "✅ WebSocket handshake success: participant ... joined room ..."</li>
          </ul>
        </div>

        {/* Logs Display */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Click Connect to start.</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  log.type === 'info' ? 'text-blue-400' :
                  'text-gray-400'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>

        {/* Backend Mapping */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">🔗 Backend Flow:</h3>
          <ol className="list-decimal ml-5 space-y-1">
            <li><code>WebSocketConfig.registerStompEndpoints()</code> → Register /ws endpoint</li>
            <li><code>WebSocketHandshakeInterceptor.beforeHandshake()</code> → Extract JWT từ cookie</li>
            <li><code>JwtService.validateToken()</code> → Validate token</li>
            <li><code>JwtService.extractParticipantId()</code> → Get participant info</li>
            <li>Set session attributes → Allow connection</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
