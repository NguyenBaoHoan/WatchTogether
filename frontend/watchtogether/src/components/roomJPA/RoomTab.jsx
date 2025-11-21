import React from 'react';

const RoomTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'chat', label: 'Trò chuyện' },
        { id: 'members', label: 'Thành viên' },
    ];

    return (
        <div className="w-full bg-[#1E2939] rounded-t-lg border-b border-gray-600 select-none">
            <div className="flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex-1 py-3 px-4 text-sm font-bold text-center transition-all duration-200 outline-none
                            ${activeTab === tab.id
                                ? 'text-blue-400 border-b-2 border-blue-500 bg-[#1c2e52]' // Active: Chữ xanh, gạch chân, nền sáng hơn
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e3157]'   // Inactive
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RoomTabs;