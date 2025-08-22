import React, { useState } from "react";
import { User, Mail, Lock, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import ConfirmationModal from "./ConfirmationModal";

const ProfileView = () => {

  const { authUser, updateUserProfile, logout } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (formData.fullName === authUser.fullName) return;

    setIsUpdatingProfile(true);
    try {
      const res = await axiosInstance.put("/users/profile", {
        fullName: formData.fullName,
      });
    
      if (res.data && res.data.user) {
        updateUserProfile(res.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await axiosInstance.post("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/users/${authUser._id}`);
      toast.success("Account deleted successfully.");
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Profile Details Card */}
        <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl">
          <form onSubmit={handleProfileUpdate}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#e5e5e5]/70 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e5e5e5]/50" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-[#111] border border-[#e5e5e5]/20 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#e5e5e5]/50 focus:border-[#e5e5e5]/50 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e5e5e5]/70 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e5e5e5]/50" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-[#111] border border-[#e5e5e5]/20 rounded-lg py-2 pl-10 pr-4 text-[#e5e5e5]/60 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#e5e5e5]/5 border-t border-[#e5e5e5]/10 rounded-b-xl flex justify-end">
              <button
                type="submit"
                disabled={
                  isUpdatingProfile || formData.fullName === authUser.fullName
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#e5e5e5]/10 rounded-lg hover:bg-[#e5e5e5]/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>


        <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl">
          <form onSubmit={handlePasswordUpdate}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e5e5e5]/70 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#111] border border-[#e5e5e5]/20 rounded-lg py-2 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e5e5e5]/70 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#111] border border-[#e5e5e5]/20 rounded-lg py-2 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e5e5e5]/70 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#111] border border-[#e5e5e5]/20 rounded-lg py-2 px-4"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#e5e5e5]/5 border-t border-[#e5e5e5]/10 rounded-b-xl flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#e5e5e5]/10 rounded-lg hover:bg-[#e5e5e5]/20 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>


        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-red-400/70 mb-4">
            Deleting your account is a permanent action and cannot be undone.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 text-sm font-bold text-red-400 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="inline w-4 h-4 mr-2" />
            Delete My Account
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All of your data will be removed."
        confirmText="Yes, Delete My Account"
        isProcessing={isDeleting}
        variant="danger"
      />
    </>
  );
};

export default ProfileView;
