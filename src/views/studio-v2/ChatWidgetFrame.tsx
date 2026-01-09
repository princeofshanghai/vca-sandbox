import React from 'react';
import { X, Paperclip, Send } from 'lucide-react';

interface ChatWidgetFrameProps {
    children: React.ReactNode;
}

export const ChatWidgetFrame = ({ children }: ChatWidgetFrameProps) => {
    return (
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 mx-auto font-sans relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Help</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} strokeWidth={2} />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-hide">
                {children}
            </div>

            {/* Footer / Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm hover:border-gray-400 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-900 placeholder-gray-500 font-medium"
                    />
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <Paperclip size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollbar hide utility style (inline for validation) */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
