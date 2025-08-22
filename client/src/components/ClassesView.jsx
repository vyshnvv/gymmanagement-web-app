import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import ScheduleModal from "../components/ScheduleModal.jsx"; // Import the new modal component

const classes = [
  {
    emoji: "🧘",
    name: "Yoga",
    description: "Flexibility, breathing, stress relief.",
  },
  {
    emoji: "💃",
    name: "Zumba / Dance Fitness",
    description: "Cardio workout through dance moves.",
  },
  {
    emoji: "🏋️",
    name: "CrossFit / Functional Training",
    description: "High-intensity strength + endurance training.",
  },
  {
    emoji: "🚴",
    name: "Spinning / Cycling",
    description: "Cardio endurance on stationary bikes.",
  },
  {
    emoji: "🔥",
    name: "HIIT (High Intensity Interval Training)",
    description: "Short bursts of intense exercise with rests.",
  },
  {
    emoji: "🤸",
    name: "Pilates",
    description: "Core strength, balance, posture.",
  },
  {
    emoji: "🥊",
    name: "Boxing / Kickboxing",
    description: "Strength + cardio + self-defense.",
  },
  {
    emoji: "💪",
    name: "Strength & Conditioning Bootcamps",
    description: "Group-based weight + bodyweight training.",
  },
  {
    emoji: "🤸🏼‍♀️",
    name: "Aerobics / Step Aerobics",
    description: "Rhythmic cardio movements, often with music.",
  },
  {
    emoji: "🧠",
    name: "Mindfulness & Meditation Sessions",
    description: "Relaxation and recovery focus.",
  },
];

const ClassesView = ({ setCurrentView }) => {
  const { authUser } = useAuthStore();
  const { subscription } = authUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleOpenModal = (classData) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const isSubscribed =
    subscription.plan === "Premium" || subscription.plan === "VIP";

  return (
    <>
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        classData={selectedClass}
      />
      <section>
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">
            Available Classes
          </h2>
          <p className="text-lg text-[#e5e5e5]/70 max-w-3xl">
            Join our group classes to stay motivated and achieve your goals
            faster.
          </p>
        </div>

        {isSubscribed ? (
          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls.name}
                className="bg-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/10 p-6 flex flex-col md:flex-row items-center justify-between"
              >
                <div className="flex items-center gap-6 flex-1 mb-4 md:mb-0">
                  <div className="text-4xl">{cls.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{cls.name}</h3>
                    <p className="text-[#e5e5e5]/60">{cls.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(cls)}
                  className="w-full md:w-auto px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300 flex-shrink-0"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/10 p-12">
            <h3 className="text-2xl font-bold mb-4">
              Upgrade to Access Classes
            </h3>
            <p className="text-lg text-[#e5e5e5]/70 max-w-xl mx-auto mb-8">
              A Premium or VIP subscription is required to access our exclusive
              group classes. Upgrade your plan to unlock your full potential.
            </p>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold transition-all duration-300 hover:bg-[#e5e5e5]/90"
            >
              View Plans
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default ClassesView;
