import React, { useState } from 'react';

// Component icon đơn giản (có thể thay thế bằng lucide-react hoặc heroicons nếu dự án đã có)
const IconWrapper = ({ children }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;

const RoomSidebar = ({ onInvite }) => {
    // State giả lập cho Mic/Camera/Screen để có hiệu ứng click
    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(false);
    const [screenOn, setScreenOn] = useState(false);

    const SidebarItem = ({ icon, label, active, onClick, colorClass = "text-gray-400 group-hover:text-white" }) => (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center justify-center w-full py-4 gap-1 transition-colors hover:bg-gray-800 ${active ? 'bg-gray-800' : ''}`}
        >
            <div className={`transition-transform group-hover:scale-110 ${active ? 'text-green-500' : colorClass}`}>
                {icon}
            </div>
            <span className="text-[10px] font-medium text-gray-400 group-hover:text-white">{label}</span>
        </button>
    );

    return (
        <div className="w-[72px] h-full bg-[#0B1120] flex flex-col items-center border-r border-gray-800 flex-shrink-0 z-20">
            {/* Top Section */}
            <div className="flex flex-col w-full mt-2">
                <SidebarItem
                    label="Invite"
                    onClick={onInvite}
                    icon={<IconWrapper><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></IconWrapper>}
                />

                <SidebarItem
                    label="Settings"
                    icon={<IconWrapper><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconWrapper>}
                />
            </div>

            {/* Media Controls Group */}
            <div className="flex flex-col w-full my-4 gap-2 bg-gray-900/50 py-2 rounded-lg mx-1 w-[90%]">
                <SidebarItem
                    label="Camera"
                    active={camOn}
                    onClick={() => setCamOn(!camOn)}
                    colorClass={camOn ? "text-green-500" : "text-gray-400"}
                    icon={<IconWrapper><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></IconWrapper>}
                />

                <SidebarItem
                    label="Mic"
                    active={micOn}
                    onClick={() => setMicOn(!micOn)}
                    colorClass={micOn ? "text-green-500" : "text-gray-400"}
                    icon={<IconWrapper><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></IconWrapper>}
                />

                <SidebarItem
                    label="Screen"
                    active={screenOn}
                    onClick={() => setScreenOn(!screenOn)}
                    colorClass={screenOn ? "text-blue-500" : "text-gray-400"}
                    icon={<IconWrapper><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></IconWrapper>}
                />
                <SidebarItem
                    label="Help"
                    icon={<IconWrapper><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconWrapper>}
                />
            </div>

            {/* Bottom Section */}
            <div className="mt-auto flex flex-col w-full mb-4">

            </div>
        </div>
    );
};

export default RoomSidebar;