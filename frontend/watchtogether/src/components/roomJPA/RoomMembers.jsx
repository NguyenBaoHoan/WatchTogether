import React from 'react';

const RoomMembers = ({ hostName, currentUser }) => {
    // Component hiển thị danh sách thành viên với tone màu tối #1E2939

    return (
        <div className="bg-[#1E2939] p-4 h-full text-white overflow-y-auto custom-scrollbar">
            {/* Header nhỏ bên trong */}
            <h3 className="font-bold mb-4 text-blue-300 border-b border-gray-600 pb-2 text-sm uppercase tracking-wide">
                Danh sách thành viên
            </h3>

            <div className="space-y-3">
                {/* 1. Hiển thị Host */}
                <div className="flex items-center gap-3 bg-[#1e3157] p-3 rounded-lg shadow-sm border border-gray-700">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white shadow-md">
                            {(hostName || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1e3157] rounded-full"></div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-100">{hostName || 'Đang tải...'}</p>
                        <span className="text-xs text-red-300 font-medium bg-red-900/30 px-2 py-0.5 rounded">Chủ phòng</span>
                    </div>
                </div>

                {/* 2. Hiển thị Bạn (Current User) */}
                <div className="flex items-center gap-3 bg-[#233b66] p-3 rounded-lg shadow-sm border border-blue-500/50">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-md">
                            {(currentUser || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#233b66] rounded-full"></div>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white">{currentUser} (Bạn)</p>
                        <span className="text-xs text-blue-300 font-medium">Đang trực tuyến</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 italic">
                    Danh sách thành viên đầy đủ sẽ được cập nhật...
                </p>
            </div>
        </div>
    );
};

export default RoomMembers;