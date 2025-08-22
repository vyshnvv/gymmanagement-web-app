import React, { useState } from "react";
import { X } from "lucide-react";

const NutritionBookingModal = ({ isOpen, onClose, nutritionists, onBook }) => {
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen) return null;

  const handleBookClick = () => {
    if (selectedNutritionist && selectedSlot) {
      onBook({ nutritionist: selectedNutritionist, slot: selectedSlot });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-xl p-8 max-w-lg w-full relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#e5e5e5]/50 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Schedule a Nutrition Consultation
        </h2>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">
            1. Select a Nutritionist
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nutritionists.map((nutritionist) => (
              <button
                key={nutritionist._id}
                onClick={() => {
                  setSelectedNutritionist(nutritionist);
                  setSelectedSlot(null); // Reset slot selection
                }}
                className={`p-4 rounded-lg text-left border-2 transition-all duration-200 ${
                  selectedNutritionist?._id === nutritionist._id
                    ? "bg-[#e5e5e5]/10 border-[#e5e5e5]/50"
                    : "bg-[#e5e5e5]/5 border-transparent hover:border-[#e5e5e5]/30"
                }`}
              >
                <h4 className="font-bold">{nutritionist.fullName}</h4>
                <p className="text-sm text-[#e5e5e5]/60">
                  {nutritionist.specialty}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedNutritionist && (
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-3">
              2. Select an Available Time Slot
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedNutritionist.availabilitySlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedSlot === slot
                      ? "bg-[#e5e5e5]/10 border-[#e5e5e5]/50"
                      : "bg-[#e5e5e5]/5 border-transparent hover:border-[#e5e5e5]/30"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleBookClick}
            disabled={!selectedNutritionist || !selectedSlot}
            className="px-6 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionBookingModal;
