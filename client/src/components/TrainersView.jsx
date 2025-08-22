import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  CheckCircle,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import useBookingStore from "../store/useBookingStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";
import StaffFormModal from "./StaffFormModal";

const TrainersView = ({ staff, isLoading, setStaff }) => {
  const { getBookingForSlot, fetchBookings } = useBookingStore();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openFormModal = (staffMember = null) => {
    setSelectedStaff(staffMember);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (isProcessing) return;
    setIsFormModalOpen(false);
    setSelectedStaff(null);
  };

  const openDeleteModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isProcessing) return;
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsProcessing(true);
    try {
      if (selectedStaff) {
        // Update existing staff
        const response = await axiosInstance.put(
          `/staff/${selectedStaff._id}`,
          formData
        );
        setStaff((prev) =>
          prev.map((s) => (s._id === selectedStaff._id ? response.data : s))
        );
        toast.success("Staff member updated successfully!");
      } else {
        // Create new staff
        const response = await axiosInstance.post("/staff", formData);
        setStaff((prev) => [response.data, ...prev]);
        toast.success("Staff member created successfully!");
      }
      closeFormModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    setIsProcessing(true);
    try {
      await axiosInstance.delete(`/staff/${selectedStaff._id}`);
      setStaff((prev) => prev.filter((s) => s._id !== selectedStaff._id));
      toast.success("Staff member deleted successfully!");
      closeDeleteModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete staff member."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const trainers = staff.filter((s) => s.role === "trainer");
  const nutritionists = staff.filter((s) => s.role === "nutritionist");

  const StaffCard = ({ person }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <div className="bg-[#e5e5e5]/5 p-5 rounded-xl border border-transparent hover:border-[#e5e5e5]/20 transition-all duration-300 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#111] p-3 rounded-full">
              {person.role === "trainer" ? (
                <User className="w-6 h-6 text-[#e5e5e5]" />
              ) : (
                <Shield className="w-6 h-6 text-[#e5e5e5]" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-lg">{person.fullName}</h4>
              <p className="text-sm text-[#e5e5e5]/60">{person.specialty}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 rounded-full hover:bg-[#e5e5e5]/10"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#2a2a2a] border border-[#e5e5e5]/10 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    openFormModal(person);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#e5e5e5]/5"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    openDeleteModal(person);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 text-[#e5e5e5]/80">
            Available Slots:
          </p>
          <div className="flex flex-col gap-2">
            {person.availabilitySlots?.length > 0 ? (
              person.availabilitySlots.map((slot) => {
                const booking = getBookingForSlot(person.fullName, slot);
                return booking ? (
                  <div
                    key={slot}
                    className="w-full text-xs bg-green-500/10 text-green-400 p-2 rounded-md border border-green-500/20"
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {slot} - Booked
                    </p>
                    <p className="pl-[22px] text-green-400/80">
                      by {booking.userName}
                    </p>
                  </div>
                ) : (
                  <span
                    key={slot}
                    className="text-xs bg-[#e5e5e5]/10 px-2 py-1 rounded-md self-start"
                  >
                    {slot}
                  </span>
                );
              })
            ) : (
              <p className="text-xs text-[#e5e5e5]/50">No slots specified.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading staff information...</div>;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Staff Management</h2>
          <button
            onClick={() => openFormModal()}
            className="flex items-center gap-2 px-4 py-2 font-bold bg-[#e5e5e5]/10 rounded-lg hover:bg-[#e5e5e5]/20"
          >
            <Plus className="w-5 h-5" />
            Add Staff
          </button>
        </div>
        <div className="space-y-10">
          <div>
            <h3 className="text-2xl font-semibold mb-4 border-b border-[#e5e5e5]/10 pb-2">
              Personal Trainers ({trainers.length})
            </h3>
            {trainers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map((trainer) => (
                  <StaffCard key={trainer._id} person={trainer} />
                ))}
              </div>
            ) : (
              <p className="text-[#e5e5e5]/60">No trainers found.</p>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4 border-b border-[#e5e5e5]/10 pb-2">
              Nutritionists ({nutritionists.length})
            </h3>
            {nutritionists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionists.map((nutritionist) => (
                  <StaffCard key={nutritionist._id} person={nutritionist} />
                ))}
              </div>
            ) : (
              <p className="text-[#e5e5e5]/60">No nutritionists found.</p>
            )}
          </div>
        </div>
      </div>

      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        isProcessing={isProcessing}
        staffMember={selectedStaff}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedStaff?.fullName}? This action is permanent.`}
        confirmText="Yes, Delete"
        isProcessing={isProcessing}
        variant="danger"
      />
    </>
  );
};

export default TrainersView;
