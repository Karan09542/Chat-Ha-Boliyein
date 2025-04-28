import React from 'react'
import { RxCross2 } from 'react-icons/rx';
import { cn } from '../../../../utils/utils';

interface WaitMessageProps {
    message: string;
    className?: string;
    onClose: () => void;

}
const WaitMessage: React.FC<WaitMessageProps> = ({ message, onClose, className }) => {
    return (
        <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50", className)}>

            <div className="relative backdrop-blur-md bg-black/50 border border-white/30 shadow-xl rounded-2xl p-6 w-[300px] flex flex-col items-center text-center animate-pulse">
                {/* ❌ Close Icon */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white hover:text-red-300 transition"
                    aria-label="Close"
                >
                    <RxCross2 size={20} />
                </button>
                {/* ⏳ Spinner */}
                <svg
                    className="w-10 h-10 text-white animate-spin mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
                <div className="text-white font-semibold text-lg">
                    {message}
                </div>
            </div>
        </div>
    )
}

export default WaitMessage;