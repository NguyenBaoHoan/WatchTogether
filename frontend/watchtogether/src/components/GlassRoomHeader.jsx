import React, { useState } from 'react';

const GlassRoomHeader = ({ roomId, username }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(roomId);
        } else {
            // Fallback logic giữ nguyên
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
            {/* 1. GIẢM GLOW VÀ ĐỔI TONE MÀU: Chuyển sang Blue/Cyan cho hợp với #162541 */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500"></div>

            {/* 2. THU GỌN KÍCH THƯỚC:
                - Giảm padding: px-4 py-1.5 (cũ là px-6 py-3)
                - Background: Dùng chính màu theme #162541 có độ trong suốt
            */}
            <div className="relative flex items-center gap-3 bg-[#162541]/80 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-1.5 text-white shadow-lg">

                {/* Phần User */}
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                    {/* Giảm kích thước Avatar: w-7 h-7 (cũ là w-9 h-9) */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-[#162541] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        {/* Bỏ chữ "USER" label cho gọn, hoặc để font cực nhỏ */}
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium leading-none mb-0.5">Host</span>
                        <span className="text-xs font-semibold text-gray-200 leading-none max-w-[80px] truncate">{username}</span>
                    </div>
                </div>

                {/* Phần Room ID */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold leading-none mb-0.5">Room ID</span>
                        {/* Giảm font size Room ID, đổi màu sang Cyan/White */}
                        <code className="font-mono text-sm font-bold text-cyan-300 tracking-wide">
                            {roomId}
                        </code>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="ml-1 p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-90 group-copy relative"
                        title="Copy Room ID"
                    >
                        {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}

                        {/* Tooltip nhỏ gọn hơn */}
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