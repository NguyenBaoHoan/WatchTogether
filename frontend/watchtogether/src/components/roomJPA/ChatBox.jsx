import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ messages, onSendMessage, currentUser }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    // Hàm format thời gian (VD: 14:30)
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        // Nếu chuỗi trả về từ Java không đúng chuẩn ISO, JS có thể parse sai,
        // nhưng LocalDateTime default format của Jackson thường JS hiểu được.
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Hàm lấy màu avatar ngẫu nhiên dựa trên tên
    const getAvatarColor = (name) => {
        const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Chat Room</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {messages.length} messages
                </span>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => {
                    // Kiểm tra xem tin nhắn này có phải của mình không
                    const isMine = msg.sender === currentUser;
                    const isJoinMessage = msg.type === 'JOIN';

                    if (isJoinMessage) {
                        return (
                            <div key={idx} className="flex justify-center my-2">
                                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                                    {msg.sender} đã tham gia phòng
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                            {/* Avatar cho người khác */}
                            {!isMine && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(msg.sender || '?')}`}>
                                    {(msg.sender || '?').charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                {/* Tên người gửi (chỉ hiện cho người khác) */}
                                {!isMine && <span className="text-xs text-gray-500 ml-1 mb-1">{msg.sender}</span>}
                                
                                {/* Bong bóng tin nhắn */}
                                <div className={`px-4 py-2 rounded-2xl shadow-sm text-sm break-words relative group ${
                                    isMine 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}>
                                    {msg.content}
                                    
                                    {/* Thời gian - Hiển thị khi hover hoặc luôn hiển thị nhỏ bên dưới */}
                                    <div className={`text-[10px] mt-1 opacity-70 text-right ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {formatTime(msg.timestamp) || 'Just now'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2 items-center">
                <input
                    type="text"
                    className="flex-1 bg-gray-100 text-gray-800 border-0 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                        input.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatBox;