/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { CheckCircle, FileText, ArrowLeft, Download } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import { axiosInstance } from "../lib/axios.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MyPlanView = ({ setCurrentView }) => {
  const { authUser, updateSubscription } = useAuthStore();
  const { subscription } = authUser;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);


  const [planDetails, setPlanDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (subscription.plan === "none" || subscription.status !== "active") {
      setIsLoading(false);
      return;
    }

    const fetchPlanDetails = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/plans");
        const allPlans = res.data;

        const currentPlan = allPlans.find((p) => p.name === subscription.plan);

        if (currentPlan) {
          setPlanDetails(currentPlan);
        } else {

          toast.error(
            `Could not find details for your '${subscription.plan}' plan.`
          );
        }
      } catch (error) {
        toast.error("Failed to fetch plan details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanDetails();
  }, [subscription.plan, subscription.status]); 

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelSubscription = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await axiosInstance.post("/users/cancel-subscription");
      if (res.data) {
        updateSubscription(res.data.subscription);
        toast.success("Your subscription has been cancelled.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription."
      );
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!planDetails) return; 
    const doc = new jsPDF();
    const transactionId = `sub_${authUser._id.slice(-12)}`;
    const paymentDate = formatDate(subscription.startDate);


    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GymFlow", 20, 30);
    doc.setFontSize(16);
    doc.text("Payment Receipt", 20, 40);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Bill To:", 20, 60);
    doc.text(authUser.fullName, 20, 66);
    doc.text(authUser.email, 20, 72);


    autoTable(doc, {
      startY: 90,
      head: [["Item", "Details"]],
      body: [
        ["Transaction ID", transactionId],
        ["Payment Date", paymentDate],
        ["Payment Method", "Card ending in **** 1234"],
        ["Plan", `${subscription.plan} Plan`],
      ],
      theme: "striped",
      headStyles: { fillColor: [22, 22, 22] },
    });


    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 130, finalY + 15);
    doc.text(`$${planDetails.price}`, 170, finalY + 15); // Use dynamic price


    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "Thank you for your payment! If you have any questions, please contact support.",
      20,
      doc.internal.pageSize.height - 20
    );


    doc.save(`receipt-gymflow-${paymentDate.replace(/ /g, "-")}.pdf`);
  };


  if (isLoading) {
    return <div className="text-center p-12">Loading your plan details...</div>;
  }


  if (
    subscription.plan === "none" ||
    subscription.status !== "active" ||
    !planDetails
  ) {
    return (
      <div className="text-center bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-12">
        <h2 className="text-2xl font-bold mb-4">No Active Subscription</h2>
        <p className="text-[#e5e5e5]/70 mb-6">
          You are not subscribed to any plan. Please choose a plan to get
          started.
        </p>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="group px-8 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold hover:bg-[#e5e5e5]/90 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Choose a Plan
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Subscription?"
        message="Are you sure? Your plan benefits will be revoked immediately. This action cannot be undone."
        confirmText="Yes, Cancel"
        isProcessing={isCancelling}
        variant="danger"
      />
      <div className="space-y-12">

        <section>
          <h2 className="text-3xl font-bold mb-6">Your Current Plan</h2>
          <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
              <div>
                <h3 className="text-4xl font-bold mb-2 capitalize">
                  {subscription.plan}
                </h3>
                <p className="text-2xl font-semibold text-[#e5e5e5]/80">
                  ${planDetails.price}
                  <span className="text-lg text-[#e5e5e5]/60">/month</span>
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-left md:text-right">
                <p className="font-bold text-green-400 capitalize">
                  Status: {subscription.status}
                </p>
                <p className="text-sm text-[#e5e5e5]/60">
                  Renews on: {formatDate(subscription.endDate)}
                </p>
              </div>
            </div>
            <div className="border-t border-[#e5e5e5]/10 pt-6">
              <h4 className="font-semibold text-lg mb-4">Plan Features:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-[#e5e5e5]/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Billing History</h2>
          <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-[#e5e5e5]/80" />
                <h3 className="text-2xl font-bold">Last Payment Receipt</h3>
              </div>
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-4 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold text-sm hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[#e5e5e5]/60">Transaction ID:</p>
                <p className="font-mono text-sm">
                  sub_{authUser._id.slice(-12)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#e5e5e5]/60">Payment Date:</p>
                <p>{formatDate(subscription.startDate)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#e5e5e5]/60">Payment Method:</p>
                <p>Card ending in **** 1234</p>
              </div>
              <div className="border-t border-[#e5e5e5]/10 my-4"></div>
              <div className="flex justify-between items-center font-bold text-lg">
                <p>Amount Paid:</p>
                <p>${planDetails.price}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="w-full px-6 py-3 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-bold hover:bg-[#e5e5e5]/90 transition-all duration-300"
          >
            Change Plan
          </button>
          <button
            onClick={handleCancelSubscription}
            className="w-full px-6 py-3 border-2 border-red-500/40 text-red-400 rounded-lg font-bold hover:border-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            Cancel Subscription
          </button>
        </section>
      </div>
    </>
  );
};

export default MyPlanView;
