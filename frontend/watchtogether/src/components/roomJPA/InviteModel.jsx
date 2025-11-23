import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserAdd } from 'iconsax-react';
import { toast } from 'react-toastify';

const InviteModal = ({ isOpen, onClose, inviteLink }) => {
    const [activeTab, setActiveTab] = useState('qr'); // Mặc định hiển thị tab QR
    const [copied, setCopied] = useState(false);

    // Reset state khi mở modal
    useEffect(() => {
        if (isOpen) {
            setActiveTab('qr');
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Đã copy link vào clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Danh sách các tabs
    const tabs = [
        { id: 'link', label: 'Liên kết mời' },
        // { id: 'email', label: 'Email / Mạng xã hội' }, // Tạm ẩn các tab chưa làm chức năng
        { id: 'qr', label: 'Mã QR' },
        // { id: 'embed', label: 'Nhúng' },
    ];

    return (
        // 1. Backdrop (Lớp nền tối mờ)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
             {/* 2. Modal Container (Khung chính) - Màu nền tối #2C3546 giống ảnh */}
            <div className="bg-[#2C3546] rounded-lg shadow-2xl w-full max-w-lg text-gray-200 overflow-hidden animate-slide-in-up border border-gray-700/50">
                
                {/* Header */}
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold text-white">Mời bạn bè xem cùng với bạn!</h2>
                </div>

                {/* Tabs Navigation */}
                <div className="px-6 flex space-x-6 border-b border-gray-600/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 transition-all duration-200 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'text-white border-b-2 border-yellow-500'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area (Khu vực thay đổi nội dung) */}
                <div className="p-6 min-h-[200px] flex flex-col items-center justify-center">
                    
                    {/* Nội dung Tab QR-Code */}
                    {activeTab === 'qr' && (
                        <div className="bg-white p-3 rounded-lg shadow-inner animate-fade-in">
                            <QRCodeSVG value={inviteLink} size={160} level={"H"} includeMargin={true} />
                        </div>
                    )}

                    {/* Nội dung Tab Invitation Link */}
                    {activeTab === 'link' && (
                        <div className="w-full space-y-3 animate-fade-in">
                            <p className="text-sm text-gray-400">Chia sẻ liên kết này với bạn bè của bạn:</p>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={inviteLink} 
                                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                <button 
                                    onClick={handleCopyLink}
                                    className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    {copied ? 'Đã sao chép!' : 'Sao chép'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Các tab khác có thể thêm nội dung tương tự ở đây */}
                </div>

                {/* Description Box (Hộp thông tin bên dưới) */}
                <div className="px-6 pb-6">
                     <div className="bg-[#374151]/80 rounded-lg p-4 flex items-start gap-3 text-sm text-gray-300 border border-gray-600/30">
                        <UserAdd size="24" color="#FF8A65" variant="Bold" className="flex-shrink-0 mt-0.5"/>
                        <p>
                            WatchTogether là dịch vụ video xã hội cho phép bạn xem video cùng nhau và đồng bộ với bạn bè. Hãy mời vài người bạn và bắt đầu cuộc vui!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#232b38] flex justify-end border-t border-gray-700/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;