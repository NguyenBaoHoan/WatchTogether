import React from 'react';

// --- GIAO DIỆN (UI PURE) ---
const RoomMembers = ({ participants = [], currentUser, hostName }) => {
    return (
        <div className="bg-[#1E2939] p-4 h-full text-white overflow-y-auto custom-scrollbar flex flex-col">
            {/* Header: Đếm số lượng */}
            <h3 className="font-bold mb-4 text-blue-300 border-b border-gray-600 pb-2 text-sm uppercase tracking-wide flex justify-between items-center">
                <span>Thành viên</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{participants.length}</span>
            </h3>

            {/* List Members */}
            <div className="space-y-3 flex-1">
                {participants.map((member, index) => {
                    // Logic kiểm tra Host và Bản thân
                    const isHost = member === hostName;
                    const isMe = member === currentUser;

                    return (
                        <div key={index} 
                            className={`flex items-center gap-3 p-3 rounded-lg shadow-sm border transition-all ${
                                isHost 
                                ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' // Style VÀNG cho Host
                                : isMe 
                                    ? 'bg-[#2a4575] border-blue-500/50' // Style XANH cho Mình
                                    : 'bg-[#233b66] border-transparent hover:border-gray-600' // Style Thường
                            }`}
                        >
                            <div className="relative">
                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm ${
                                    isHost 
                                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 ring-2 ring-yellow-400' 
                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                }`}>
                                    {member.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* Icon Vương Miện (Chỉ hiện nếu là Host) */}
                                {isHost && (
                                    <div className="absolute -top-3 -right-2 transform rotate-12 drop-shadow-md">
                                        <span className="text-xl filter drop-shadow">👑</span>
                                    </div>
                                )}

                                {/* Dot Online (Chỉ hiện cho người thường) */}
                                {!isHost && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#1E2939] rounded-full animate-pulse"></div>}
                            </div>
                            
                            <div className="overflow-hidden">
                                <p className={`font-bold text-sm truncate w-32 flex items-center gap-1 ${isHost ? 'text-yellow-400' : 'text-white'}`}>
                                    {member} 
                                    {isMe && <span className="text-[10px] bg-gray-600 px-1 rounded text-gray-200">YOU</span>}
                                </p>
                                
                                {isHost ? (
                                    <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827 1.035L17.448 5H20a1 1 0 100 2h-2.551l-1.033 1.936a1 1 0 01-1.827-1.035l1.699-3.181L11 4.323V3a1 1 0 01-1-1zm0 13a5.002 5.002 0 004.992-4.908l-.206-6.425a1 1 0 00-1.996.126l.205 6.407A3.003 3.003 0 0110 13 3.003 3.003 0 017.005 8.199l.205-6.407a1 1 0 00-1.996-.126l-.206 6.425A5.002 5.002 0 0010 15zm0 1c2.667 0 5.106-1.127 6.82-2.948.47.53.766 1.218.819 1.97.058.835-.164 1.625-.567 2.278a.998.998 0 01-1.396.294l-5.676-3.235zm-6.82-2.948A8.966 8.966 0 0110 16v-.006l-5.676 3.235a.998.998 0 01-1.396-.294 3.998 3.998 0 01-.567-2.278c.053-.752.349-1.44.819-1.97z" clipRule="evenodd" />
                                        </svg>
                                        Room Owner
                                    </span>
                                ) : (
                                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                        <span className="w-1 h-1 bg-green-400 rounded-full"></span> Online
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {participants.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-4xl mb-2">😴</p>
                        <p className="text-sm">Đang đợi mọi người...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomMembers;