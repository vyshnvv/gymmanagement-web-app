import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isProcessing,
  variant = "default",
}) => {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-xl p-8 max-w-md w-full relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#e5e5e5]/50 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          {isDanger && (
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
          )}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <div className="text-[#e5e5e5]/70 mb-8">{message}</div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:animate-pulse ${
              isDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
            }`}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
