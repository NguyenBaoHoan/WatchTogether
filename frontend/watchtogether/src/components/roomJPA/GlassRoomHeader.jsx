import React, { useState } from 'react';

const GlassRoomHeader = ({ roomId, username, roomName }) => { // 1. Nhận thêm props roomName
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(roomId);
        } else {
            // Fallback logic
            const textArea = document.createElement("textarea");
            textArea.value = roomId;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Error copying', err);
            }
            document.body.removeChild(textArea);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500"></div>

            {/* Main Container */}
            <div className="relative flex items-center gap-3 bg-[#1E2939]/80 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-1.5 text-white shadow-lg">

                {/* --- [MỚI] PHẦN TÊN PHÒNG (ĐẶT Ở ĐẦU) --- */}
                <div className="flex flex-col justify-center border-r border-white/10 pr-3 max-w-[150px]">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold leading-none mb-0.5">
                        Room
                    </span>
                    <h1 className="text-sm font-bold text-white leading-none truncate" title={roomName}>
                        {roomName || "Loading..."}
                    </h1>
                </div>
                {/* ----------------------------------------- */}

                {/* Phần User (Host) */}
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 p-[1.5px] shrink-0">
                        <div className="w-full h-full rounded-full bg-[#1E2939] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                                {username ? username.charAt(0).toUpperCase() : "?"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium leading-none mb-0.5">Host</span>
                        <span className="text-xs font-semibold text-gray-200 leading-none max-w-[80px] truncate">{username}</span>
                    </div>
                </div>

                {/* Phần Room ID */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold leading-none mb-0.5">ID</span>
                        <code className="font-mono text-sm font-bold text-cyan-300 tracking-wide">
                            {roomId.substring(0, 8)}... {/* Cắt ngắn ID hiển thị cho gọn, copy vẫn full */}
                        </code>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="ml-1 p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-90 group-copy relative"
                        title="Copy Full Room ID"
                    >
                        {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}

                        <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 border border-white/10 text-white text-[10px] rounded whitespace-nowrap transition-all duration-300 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
                            Copied
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlassRoomHeader;