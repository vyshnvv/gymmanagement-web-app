import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const StaffFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  staffMember,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "trainer",
    designation: "Personal Trainer",
    specialty: "",
    bio: "",
    experienceYears: 0,
    availabilitySlots: "", 
  });

  // Designation options based on role
  const getDesignationOptions = (role) => {
    if (role === "trainer") {
      return [
        "Personal Trainer",
        "Head Trainer",
        "Strength & Conditioning Coach",
        "Fitness Specialist",
      ];
    } else if (role === "nutritionist") {
      return ["Clinical Nutritionist", "Sports Nutritionist"];
    }
    return [];
  };

  useEffect(() => {
    if (staffMember) {
      setFormData({
        ...staffMember,
        availabilitySlots: staffMember.availabilitySlots.join(", "),
      });
    } else {
      // Reset form for new entry
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "trainer",
        designation: "Personal Trainer",
        specialty: "",
        bio: "",
        experienceYears: 0,
        availabilitySlots: "",
      });
    }
  }, [staffMember, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If role changes, update designation to first option of new role
    if (name === "role") {
      const designationOptions = getDesignationOptions(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        designation: designationOptions[0] || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      availabilitySlots: formData.availabilitySlots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experienceYears: Number(formData.experienceYears),
    };
    onSubmit(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 max-h-screen overflow-y-auto">
      <div className="bg-[#1e1e1e] border border-[#e5e5e5]/10 rounded-xl p-6 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {staffMember ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-full hover:bg-[#e5e5e5]/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="bg-[#e5e5e5]/5 p-2 rounded-lg text-white"
            >
              <option className="text-gray-800" value="trainer">
                Trainer
              </option>
              <option className="text-gray-800" value="nutritionist">
                Nutritionist
              </option>
            </select>
          </div>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            className="w-full bg-[#e5e5e5]/5 p-2 rounded-lg text-white "
          >
            {getDesignationOptions(formData.role).map((designation) => (
              <option
                key={designation}
                value={designation}
                className="text-gray-800"
              >
                {designation}
              </option>
            ))}
          </select>
          <input
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            placeholder="Specialty (e.g., Strength & Conditioning)"
            required
            className="w-full bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
          />
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            rows="3"
            className="w-full bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
          />
          <input
            name="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={handleChange}
            placeholder="Years of Experience"
            className="w-full bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
          />
          <textarea
            name="availabilitySlots"
            value={formData.availabilitySlots}
            onChange={handleChange}
            placeholder="Availability Slots (comma-separated, e.g., Mon 10am, Tue 2pm)"
            rows="2"
            className="w-full bg-[#e5e5e5]/5 p-2 rounded-lg text-white placeholder-gray-400"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-[#e5e5e5]/10 hover:bg-[#e5e5e5]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-[#e5e5e5] text-[#111] hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing
                ? "Saving..."
                : staffMember
                ? "Save Changes"
                : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
