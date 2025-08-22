import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  UserCircle,
  Shield,
  CheckCircle,
  UserCheck,
  Star,
  Utensils,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import MyPlanView from "../components/MyPlanView.jsx";
import ClassesView from "../components/ClassesView.jsx";
import PersonalTrainingView from "../components/PersonalTrainingView.jsx";
import NutritionView from "../components/NutritionView.jsx";
import ProfileView from "../components/ProfileView.jsx";
import SupplementStoreView from "../components/SupplementStoreView.jsx";
import { useNavigate } from "react-router-dom";

// --- DYNAMIC DASHBOARD VIEW SUB-COMPONENT ---
const DashboardView = ({ handleSubscribeClick }) => {
  const { authUser } = useAuthStore();
  const { subscription } = authUser;

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/plans");
        const sortedPlans = res.data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      } catch (error) {
        toast.error("Failed to load subscription plans.");
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section>
      <div className="text-left mb-10">
        <h2 className="text-3xl lg:text-4xl font-bold mb-3">
          {subscription.status === "active"
            ? "Change Your Plan"
            : "Choose Your Plan"}
        </h2>
        <p className="text-lg text-[#e5e5e5]/70 max-w-3xl">
          Unlock more benefits and accelerate your fitness journey.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="text-center col-span-3 text-lg text-[#e5e5e5]/70">
            Loading available plans...
          </div>
        ) : (
          plans.map((plan) => {
            const isCurrentActivePlan =
              subscription.plan === plan.name &&
              subscription.status === "active";

            return (
              <div
                key={plan.name}
                className={`flex flex-col p-8 rounded-2xl border ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-[#e5e5e5]/15 to-[#e5e5e5]/5 border-2 border-[#e5e5e5]/30"
                    : "bg-[#e5e5e5]/5 border-[#e5e5e5]/10"
                } relative`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#e5e5e5] text-[#1a1a1a] px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div
                  className={`text-center mb-8 ${plan.isPopular ? "mt-4" : ""}`}
                >
                  <h3 className="text-2xl font-bold mb-2 capitalize">
                    {plan.name}
                  </h3>
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
                  onClick={() => handleSubscribeClick(plan.name)}
                  disabled={isCurrentActivePlan}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.isPopular
                      ? "bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
                      : "border-2 border-[#e5e5e5]/30 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10"
                  }`}
                >
                  {isCurrentActivePlan ? "Current Plan" : "Select Plan"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

// --- MAIN USER DASHBOARD COMPONENT ---
const UserDashboard = () => {
  const { authUser, updateSubscription, logout, isLoggingOut } = useAuthStore();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const navigate = useNavigate();

  const [adminContact, setAdminContact] = useState({
    email: "Loading...",
    phoneNumber: "Loading...",
    isLoading: true,
    hasError: false,
  });

  const formatPhoneNumber = (phone) => {
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return "Not available";
    }

    if (phone.includes(" ")) return phone;

    // Format +91 numbers
    if (phone.startsWith("+91")) {
      const numberPart = phone.substring(3);
      if (!isNaN(numberPart) && numberPart.length === 10) {
        return `+91 ${numberPart.substring(0, 5)} ${numberPart.substring(5)}`;
      }
    }

    // Generic international number formatting
    const match = phone.match(/^(\+\d{1,3})(\d+)$/);
    if (match) return `${match[1]} ${match[2]}`;

    // Fallback for any other format
    return phone;
  };

  useEffect(() => {
    const fetchAdminContact = async () => {
      try {
        setAdminContact((prev) => ({
          ...prev,
          isLoading: true,
          hasError: false,
        }));

        const res = await axiosInstance.get("/users/admin-contact");

        if (res.data) {
          setAdminContact({
            email: res.data.email || "Not available",
            phoneNumber: formatPhoneNumber(res.data.phoneNumber),
            isLoading: false,
            hasError: false,
          });
        } else {
          throw new Error("No data received");
        }
      } catch (error) {
        console.error("Failed to fetch admin contact:", error);
        setAdminContact({
          email: "Not available",
          phoneNumber: "Not available",
          isLoading: false,
          hasError: true,
        });
      }
    };

    fetchAdminContact();
  }, []);

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5] flex items-center justify-center">
        Loading user data...
      </div>
    );
  }

  const { subscription } = authUser;

  const handleSubscribeClick = (planName) => {
    if (subscription.plan !== "none" && subscription.status === "active") {
      setIsUpgrade(true);
    } else {
      setIsUpgrade(false);
    }
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isUpdating) return;
    setIsModalOpen(false);
    setSelectedPlan(null);
    setIsUpgrade(false);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    setIsUpdating(true);
    try {
      const res = await axiosInstance.post("/users/subscribe", {
        plan: selectedPlan,
      });
      if (res.data) {
        updateSubscription(res.data.subscription);
        toast.success(`Successfully switched to the ${selectedPlan} plan!`);
        setCurrentView("my-plan");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Subscription update failed."
      );
    } finally {
      setIsUpdating(false);
      handleCloseModal();
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    if (isLoggingOut) return;
    setIsLogoutModalOpen(false);
  };

  const handleConfirmLogout = async () => {
    await logout(navigate);
    setIsLogoutModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasPremiumAccess =
    subscription.status === "active" &&
    (subscription.plan === "Premium" || subscription.plan === "VIP");
  const hasVipAccess =
    subscription.status === "active" && subscription.plan === "VIP";

  const modalTitle = isUpgrade
    ? `Change to ${selectedPlan}?`
    : `Confirm Your ${selectedPlan} Plan`;

  const modalMessage = isUpgrade
    ? `You are about to change your plan from ${subscription.plan} to ${selectedPlan}. Are you sure you want to proceed?`
    : `You have selected the ${selectedPlan} plan. Please confirm to start your subscription.`;

  const modalConfirmText = isUpgrade
    ? "Confirm Change"
    : "Confirm Subscription";

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalConfirmText}
        isProcessing={isUpdating}
      />

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the login page."
        confirmText="Yes, Logout"
        isProcessing={isLoggingOut}
        variant="danger"
      />

      <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5] flex">
        <aside className="w-64 bg-[#111]/50 border-r border-[#e5e5e5]/10 flex-col hidden md:flex">
          <div className="flex items-center gap-3 p-6 border-b border-[#e5e5e5]/10">
            <Dumbbell className="w-8 h-8 text-[#e5e5e5]" />
            <span className="text-2xl font-bold">GymFlow</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${
                currentView === "dashboard"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView("my-plan")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${
                currentView === "my-plan"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>My Plan</span>
            </button>
            <button
              onClick={() => setCurrentView("classes")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${
                currentView === "classes"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Classes</span>
            </button>
            <button
              onClick={() => setCurrentView("personal-training")}
              className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg w-full text-left ${
                currentView === "personal-training"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5" />
                <span>Personal Training</span>
              </div>
              {!hasPremiumAccess && (
                <span className="bg-blue-400/10 text-blue-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Premium
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView("nutrition")}
              className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg w-full text-left ${
                currentView === "nutrition"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5" />
                <span>Nutrition</span>
              </div>
              {!hasVipAccess && (
                <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  VIP
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView("supplements")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left transition-all duration-200 ${
                currentView === "supplements"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Supplements</span>
            </button>
          </nav>

          {/* --- ADMIN CONTACT DETAILS SECTION --- */}
          <div className="p-4 border-t border-[#e5e5e5]/10">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#e5e5e5]/60 mb-2">
                Admin Contact
              </h3>
              <div className="space-y-2 text-sm">
                {adminContact.isLoading ? (
                  <div className="text-[#e5e5e5]/50">
                    <div className="animate-pulse">Loading contact...</div>
                  </div>
                ) : adminContact.hasError ? (
                  <div className="text-red-400/70">
                    <div>Contact unavailable</div>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs text-[#e5e5e5]/60 hover:text-[#e5e5e5] underline mt-1"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="text-[#e5e5e5]/80">
                    <div className="break-all">{adminContact.email}</div>
                    <div className="mt-1">{adminContact.phoneNumber}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#e5e5e5]/10">
            <button
              onClick={() => setCurrentView("profile")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left mb-2 ${
                currentView === "profile"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left hover:bg-red-500/10 text-[#e5e5e5]/70 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Welcome, {authUser.fullName}</h1>
            <p className="text-[#e5e5e5]/60">
              Ready to conquer your fitness goals today?
            </p>
          </header>

          {currentView === "dashboard" && (
            <>
              <section className="mb-12">
                <div className="bg-gradient-to-r from-[#e5e5e5]/10 to-[#e5e5e5]/5 rounded-2xl border border-[#e5e5e5]/20 p-8">
                  <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
                  {subscription.status === "active" ? (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <span
                          className={`inline-block px-4 py-1 text-lg font-semibold rounded-full mb-3 capitalize ${
                            subscription.plan === "VIP"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : subscription.plan === "Premium"
                              ? "bg-blue-400/10 text-blue-400"
                              : "bg-gray-400/10 text-gray-400"
                          }`}
                        >
                          {subscription.plan} Plan
                        </span>
                        <p className="text-[#e5e5e5]/70">
                          Renews on: {formatDate(subscription.endDate)}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentView("my-plan")}
                        className="mt-4 md:mt-0 px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300"
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg text-[#e5e5e5]/80">
                        {subscription.status === "cancelled"
                          ? "Your subscription has been cancelled."
                          : "You are not subscribed to any plan."}
                      </p>
                      <p className="text-[#e5e5e5]/60">
                        Choose a plan below to unlock your potential!
                      </p>
                    </div>
                  )}
                </div>
              </section>
              <DashboardView handleSubscribeClick={handleSubscribeClick} />
            </>
          )}

          {currentView === "my-plan" && (
            <MyPlanView setCurrentView={setCurrentView} />
          )}
          {currentView === "classes" && (
            <ClassesView setCurrentView={setCurrentView} />
          )}
          {currentView === "personal-training" && (
            <PersonalTrainingView setCurrentView={setCurrentView} />
          )}
          {currentView === "nutrition" && (
            <NutritionView setCurrentView={setCurrentView} />
          )}
          {currentView === "supplements" && (
            <SupplementStoreView setCurrentView={setCurrentView} />
          )}
          {currentView === "profile" && <ProfileView />}
        </main>
      </div>
    </>
  );
};

export default UserDashboard;
