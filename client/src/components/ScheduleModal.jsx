import React from "react";
import { X, Clock } from "lucide-react";

const ScheduleModal = ({ isOpen, onClose, classData }) => {
  if (!isOpen || !classData) return null;


  const schedules = {
    Yoga: ["Mon: 8:00 AM", "Wed: 6:00 PM", "Fri: 8:00 AM"],
    "Zumba / Dance Fitness": ["Tue: 7:00 PM", "Thu: 7:00 PM", "Sat: 10:00 AM"],
    "CrossFit / Functional Training": [
      "Mon: 6:00 AM",
      "Wed: 5:00 PM",
      "Fri: 6:00 AM",
    ],
    "Spinning / Cycling": ["Tue: 6:30 PM", "Thu: 6:30 PM", "Sun: 9:00 AM"],
    "HIIT (High Intensity Interval Training)": [
      "Mon: 7:00 PM",
      "Wed: 7:00 PM",
      "Fri: 7:00 PM",
    ],
    Pilates: ["Tue: 9:00 AM", "Thu: 9:00 AM", "Sat: 11:00 AM"],
    "Boxing / Kickboxing": ["Mon: 5:30 PM", "Wed: 5:30 PM", "Fri: 5:30 PM"],
    "Strength & Conditioning Bootcamps": [
      "Tue: 5:00 PM",
      "Thu: 5:00 PM",
      "Sat: 8:00 AM",
    ],
    "Aerobics / Step Aerobics": [
      "Mon: 10:00 AM",
      "Wed: 10:00 AM",
      "Fri: 10:00 AM",
    ],
    "Mindfulness & Meditation Sessions": ["Tue: 8:00 PM", "Sun: 5:00 PM"],
  };

  const schedule = schedules[classData.name] || ["Schedule not available."];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-xl p-8 max-w-md w-full relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#e5e5e5]/50 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">{classData.emoji}</span>
          <h2 className="text-2xl font-bold">
            {classData.name} Weekly Schedule
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {schedule.map((time, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-[#e5e5e5]/80"
            >
              <Clock className="w-5 h-5 text-[#e5e5e5]/50" />
              <span>{time}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold transition-all duration-300 hover:bg-[#e5e5e5]/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
