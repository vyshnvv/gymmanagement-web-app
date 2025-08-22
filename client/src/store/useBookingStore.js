

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const useBookingStore = create((set, get) => ({
  bookings: [],
  isLoading: false,

  fetchBookings: async () => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get("/bookings");
      // Filter to only show active bookings
      const activeBookings = res.data.filter(
        (booking) => booking.status === "active"
      );
      set({ bookings: activeBookings, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      set({ isLoading: false });
    }
  },

  addBooking: async ({ userId, userName, trainerName, slot }) => {
    try {
      const res = await axiosInstance.post("/bookings/create", {
        userId,
        userName,
        trainerName,
        slot,
      });

      // Only add if it's active (should be by default)
      if (res.data.status === "active") {
        set((state) => ({
          bookings: [...state.bookings, res.data],
        }));
      }

      toast.success(`Session with ${trainerName} booked!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed.");
      return false;
    }
  },

  cancelBooking: async (userId) => {
    try {
      await axiosInstance.delete(`/bookings/cancel/${userId}`);

      // Remove the cancelled booking from the store
      set((state) => ({
        bookings: state.bookings.filter((b) => b.userId !== userId),
      }));

      toast.error("Your training session has been cancelled.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    }
  },

  // Get user's active booking
  getUserBooking: (userId) => {
    return get().bookings.find((booking) => booking.userId === userId);
  },

  // Get booking for a specific trainer and slot (only active bookings)
  getBookingForSlot: (trainerName, slot) => {
    return get().bookings.find(
      (b) => b.trainerName === trainerName && b.slot === slot
    );
  },
}));

export default useBookingStore;
