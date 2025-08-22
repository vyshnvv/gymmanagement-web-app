

import React, { useState } from "react";
import { X } from "lucide-react";
import useBookingStore from "../store/useBookingStore";

const BookingModal = ({ isOpen, onClose, specialists, specialistType, onBook }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { getBookingForSlot } = useBookingStore();

  if (!isOpen) return null;

  const handleBookClick = () => {
    if (selectedSpecialist && selectedSlot) {
      onBook({ specialist: selectedSpecialist, slot: selectedSlot });
      setSelectedSpecialist(null);
      setSelectedSlot(null);
    }
  };

  const handleClose = () => {
    setSelectedSpecialist(null);
    setSelectedSlot(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-xl p-8 max-w-lg w-full relative transform transition-all">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#e5e5e5]/50 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Schedule a {specialistType} Session
        </h2>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">
            1. Select a {specialistType}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {specialists.map((specialist) => (
              <button
                key={specialist.name}
                onClick={() => {
                  setSelectedSpecialist(specialist);
                  setSelectedSlot(null);
                }}
                className={`p-4 rounded-lg text-left border-2 transition-all duration-200 ${
                  selectedSpecialist?.name === specialist.name
                    ? "bg-[#e5e5e5]/10 border-[#e5e5e5]/50"
                    : "bg-[#e5e5e5]/5 border-transparent hover:border-[#e5e5e5]/30"
                }`}
              >
                <h4 className="font-bold">{specialist.name}</h4>
                <p className="text-sm text-[#e5e5e5]/60">{specialist.specialty}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedSpecialist && (
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-3">
              2. Select an Available Time Slot
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedSpecialist.slots.map((slot) => {
                const isBooked = !!getBookingForSlot(
                  selectedSpecialist.name,
                  slot
                );
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={isBooked}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedSlot === slot
                        ? "bg-[#e5e5e5]/10 border-[#e5e5e5]/50"
                        : "bg-[#e5e5e5]/5 border-transparent hover:border-[#e5e5e5]/30"
                    } ${
                      isBooked
                        ? "opacity-40 cursor-not-allowed bg-red-500/10 border-red-500/20 text-[#e5e5e5]/50 line-through"
                        : ""
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleBookClick}
            disabled={!selectedSpecialist || !selectedSlot}
            className="px-6 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;