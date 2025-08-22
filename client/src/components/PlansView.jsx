/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Edit, CheckCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import EditPlanModal from "../components/EditPlanModal";

const PlansView = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/plans");
        setPlans(res.data);
      } catch (error) {
        toast.error("Failed to fetch subscription plans.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSaveChanges = async (updatedPlan) => {
    setIsProcessing(true);
    try {
      const res = await axiosInstance.put(
        `/plans/${updatedPlan._id}`,
        updatedPlan
      );
      setPlans(plans.map((p) => (p._id === updatedPlan._id ? res.data : p)));
      toast.success(`'${updatedPlan.name}' plan updated successfully!`);
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update plan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-12">Loading plans...</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/10 p-8 flex flex-col relative ${
              plan.isPopular ? "border-2 border-[#e5e5e5]/30" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#e5e5e5] text-[#1a1a1a] px-6 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
              </div>
            )}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-[#e5e5e5]/60">/month</span>
              </div>
            </div>
            <div className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-[#e5e5e5]/80">{feature}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleEditClick(plan)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#e5e5e5]/30 rounded-lg font-bold transition-all duration-300 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10"
            >
              <Edit className="w-4 h-4" />
              Edit Plan
            </button>
          </div>
        ))}
      </div>
      <EditPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        onSave={handleSaveChanges}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default PlansView;
