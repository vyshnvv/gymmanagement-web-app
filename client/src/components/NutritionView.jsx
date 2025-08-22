import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useBookingStore from "../store/useBookingStore";
import { Calendar, User, CheckCircle } from "lucide-react";
import NutritionBookingModal from "../components/NutritionBookingModal.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const NutritionView = ({ setCurrentView }) => {
  const { authUser } = useAuthStore();
  const { subscription } = authUser;

  const { getUserBooking, addBooking, cancelBooking, fetchBookings } =
    useBookingStore();

  const bookedSession = getUserBooking(authUser._id);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [nutritionists, setNutritionists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    const fetchNutritionists = async () => {
      setIsLoading(true);
      try {

        const response = await axiosInstance.get("/staff/active");
        const filtered = response.data.filter(
          (staff) => staff.role === "nutritionist"

        );
        setNutritionists(filtered);
      } catch (error) {
        toast.error("Could not fetch nutritionists.");
        console.error("Failed to fetch nutritionists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subscription.plan === "VIP") {
      fetchNutritionists();
    }
  }, [fetchBookings, subscription.plan]);

  const handleBookSession = async ({ nutritionist, slot }) => {
    const success = await addBooking({
      userId: authUser._id,
      userName: authUser.fullName,
      trainerName: nutritionist.fullName,
      slot,
    });

    if (success) {
      setIsBookingModalOpen(false);
    }
  };

  const handleCancelSession = async () => {
    await cancelBooking(authUser._id);
    setIsCancelModalOpen(false);
  };

  if (subscription.plan !== "VIP" || subscription.status !== "active") {
    return (
      <div className="text-center bg-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/10 p-12">
        <h3 className="text-2xl font-bold mb-4">Exclusive to VIP Members</h3>
        <p className="text-lg text-[#e5e5e5]/70 max-w-xl mx-auto mb-8">
          Nutrition consultations are an exclusive benefit for our VIP members.
          Upgrade your plan for access to expert dietitians.
        </p>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold transition-all duration-300 hover:bg-[#e5e5e5]/90"
        >
          View Plans
        </button>
      </div>
    );
  }

  // Check if the user's booking is with a known nutritionist
  const isNutritionistBooking =
    bookedSession &&
    nutritionists.some((n) => n.fullName === bookedSession.trainerName);

  return (
    <>
      <NutritionBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        nutritionists={nutritionists}
        onBook={handleBookSession}
      />
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelSession}
        title="Cancel Consultation?"
        message="Are you sure you want to cancel your upcoming nutrition consultation?"
        confirmText="Yes, Cancel"
        variant="danger"
      />
      <section>
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">
            Nutrition Consultation
          </h2>
          <p className="text-lg text-[#e5e5e5]/70 max-w-3xl">
            Book a one-on-one session with our certified nutritionists to create
            a personalized diet plan.
          </p>
        </div>

        <div className="bg-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/10 p-8">
          <h3 className="text-2xl font-bold mb-6">Your Next Consultation</h3>
          {isNutritionistBooking ? (
            <div className="p-6 rounded-lg bg-[#e5e5e5]/10 border border-green-400/30">
              <div className="flex items-center gap-3 text-green-400 font-bold text-lg mb-4">
                <CheckCircle className="w-6 h-6" />
                <span>Consultation Confirmed!</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#e5e5e5]/50" />
                  <span>
                    Nutritionist: <strong>{bookedSession.trainerName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#e5e5e5]/50" />
                  <span>
                    Time: <strong>{bookedSession.slot}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-6 py-2 bg-red-600/10 text-red-400 border-2 border-transparent rounded-lg font-bold transition-all duration-300 hover:bg-red-600/20 hover:border-red-500/30"
              >
                Cancel Consultation
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="flex-1 text-[#e5e5e5]/70 text-lg">
                {bookedSession
                  ? "You have a session booked with a Personal Trainer."
                  : "You have no upcoming nutrition consultations."}
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                disabled={!!bookedSession || isLoading}
                className="w-full md:w-auto px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold transition-all duration-300 hover:bg-[#e5e5e5]/90 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Schedule a Consultation"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NutritionView;
