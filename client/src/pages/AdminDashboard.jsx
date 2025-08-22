import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  UserCircle,
  UserCheck,
  DollarSign,
  Shield,
  Download,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import TrainersView from "../components/TrainersView.jsx";
import PlansView from "../components/PlansView.jsx";
import useBookingStore from "../store/useBookingStore.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProfileView from "../components/ProfileView.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";
import SupplementsView from "../components/SupplementsView.jsx";
import SupplementOrdersView from "../components/SupplementOrdersView.jsx";

// --- STATIC DATA CONFIGURATION (FOR DASHBOARD UI ONLY) ---

const initialStats = [
  {
    title: "Total Members",
    value: "...",
    change: "",
    icon: Users,
  },
  {
    title: "Active Staff",
    value: "...",
    change: "",
    icon: Dumbbell,
  },
  {
    title: "Booked Sessions",
    value: "...",
    change: "Personal Training",
    icon: UserCheck,
  },
  {
    title: "Monthly Revenue",
    value: "$45,890",
    change: "+8.5%",
    icon: DollarSign,
  },
];

const upcomingClasses = [
  { name: "Morning Yoga", time: "9:00 AM", trainer: "Anna Lee", attendees: 18 },
  { name: "HIIT", time: "12:00 PM", trainer: "Mark R.", attendees: 25 },
  { name: "Spin Class", time: "5:00 PM", trainer: "Sarah K.", attendees: 22 },
];

const getCurrentSubscription = (history = []) => {
  if (!history || history.length === 0) {
    return { plan: "none", status: "inactive" };
  }
  const activeSub = history.find((sub) => sub.status === "active");
  if (activeSub) {
    return activeSub;
  }
  return history[history.length - 1];
};

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [staff, setStaff] = useState([]); // State for staff members
  const [isLoadingStaff, setIsLoadingStaff] = useState(true); // Loading state for staff
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statsData, setStatsData] = useState(initialStats);
  const [isExporting, setIsExporting] = useState(false);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout, isLoggingOut } = useAuthStore();
  const navigate = useNavigate();

  const bookings = useBookingStore((state) => state.bookings);
  const getUserBooking = useBookingStore((state) => state.getUserBooking);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const response = await axiosInstance.get("/users");
        setMembers(response.data);
      } catch (error) {
        toast.error("Could not fetch members.");
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    const fetchStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const response = await axiosInstance.get("/staff");
        setStaff(response.data);
      } catch (error) {
        toast.error("Could not fetch staff.");
        console.error("Failed to fetch staff:", error);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchMembers();
    fetchStaff();
  }, []);

  useEffect(() => {
    setStatsData((prevStats) =>
      prevStats.map((stat) => {
        if (stat.title === "Total Members") {
          return { ...stat, value: members.length.toString() };
        }
        if (stat.title === "Active Staff") {
          const trainersCount = staff.filter(
            (s) => s.role === "trainer"
          ).length;
          const nutritionistsCount = staff.filter(
            (s) => s.role === "nutritionist"
          ).length;
          return {
            ...stat,
            value: staff.length.toString(),
            change: `${trainersCount} trainers, ${nutritionistsCount} nutritionists`,
          };
        }
        if (stat.title === "Booked Sessions") {
          return { ...stat, value: bookings.length.toString() };
        }
        return stat;
      })
    );
  }, [members, bookings, staff]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const response = await axiosInstance.post(
        `/users/admin/cancel-subscription/${selectedUser._id}`
      );
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member._id === selectedUser._id) {
            const newHistory = member.subscriptionHistory.map((sub) => {
              if (sub.status === "active") {
                return { ...sub, status: "cancelled", endDate: new Date() };
              }
              return sub;
            });
            return { ...member, subscriptionHistory: newHistory };
          }
          return member;
        })
      );


      await fetchBookings();

      toast.success(response.data.message || "Action completed successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    toast.loading("Generating your report...");

    try {
      const response = await axiosInstance.get("/users/reports/monthly");
      const reportData = response.data;

      const doc = new jsPDF();
      const month = new Date().toLocaleString("default", { month: "long" });
      const year = new Date().getFullYear();

      doc.setFontSize(18);
      doc.text(`Monthly Subscription Events - ${month} ${year}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = [
        "Member Name",
        "Email",
        "Description",
        "Event",
        "Date",
        "Fee ($)",
      ];
      const tableRows = reportData.map((item) => Object.values(item));

      autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [22, 22, 22] },
      });

      doc.save(`monthly-subscription-events-${month}-${year}.pdf`);

      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export the report.");
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
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

  const formatPhoneNumber = (phone) => {
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return "N/A";
    }
    if (phone.includes(" ")) {
      return phone;
    }
    if (phone.startsWith("+91")) {
      const numberPart = phone.substring(3);
      if (!isNaN(numberPart)) {
        return `+91 ${numberPart}`;
      }
    }
    const match = phone.match(/^(\+\d{1,3})(\d+)$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return phone;
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[#e5e5e5]/70">{stat.title}</p>
                    <stat.icon className="w-6 h-6 text-[#e5e5e5]/50" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{stat.value}</h2>
                  <p className="text-sm text-green-400/70">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
              <div className="space-y-4">
                {upcomingClasses.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#e5e5e5]/10 rounded-lg flex items-center justify-center font-bold text-sm">
                      {item.time.split(" ")[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-[#e5e5e5]/60">
                        {item.trainer} • {item.attendees} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case "members":
        return (
          <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manage Members</h3>
              <button
                onClick={handleExportReport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#e5e5e5]/10 rounded-lg hover:bg-[#e5e5e5]/20 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export Report"}
              </button>
            </div>
            <div className="overflow-x-auto">
              {isLoadingMembers ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading members...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]/10 text-sm text-[#e5e5e5]/60">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Plan</th>
                      <th className="py-2 px-3">Contact</th>
                      <th className="py-2 px-3">Scheduled Session</th>
                      <th className="py-2 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const currentSubscription = getCurrentSubscription(
                        member.subscriptionHistory
                      );
                      const booking = getUserBooking(member._id);
                      return (
                        <tr
                          key={member._id}
                          className="border-b border-[#e5e5e5]/5"
                        >
                          <td className="py-3 px-3">{member.fullName}</td>
                          <td className="py-3 px-3 text-[#e5e5e5]/70">
                            {member.email}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                currentSubscription.status === "active"
                                  ? "bg-green-400/10 text-green-400"
                                  : "bg-zinc-600/20 text-zinc-400"
                              }`}
                            >
                              {currentSubscription.status === "active"
                                ? currentSubscription.plan
                                : currentSubscription.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#e5e5e5]/70">
                            {formatPhoneNumber(member.phoneNumber)}
                          </td>
                          <td className="py-3 px-3">
                            {booking ? (
                              <div>
                                <p className="font-semibold text-sm">
                                  {booking.trainerName}
                                </p>
                                <p className="text-xs text-[#e5e5e5]/60">
                                  {booking.slot}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-[#e5e5e5]/50">
                                None
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {currentSubscription.status === "active" && (
                              <button
                                onClick={() => handleOpenModal(member)}
                                className="px-3 py-1 text-xs font-bold text-red-400 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                              >
                                Cancel Plan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case "trainers":
        return (
          <TrainersView
            staff={staff}
            isLoading={isLoadingStaff}
            setStaff={setStaff}
          />
        );
      case "plans":
        return <PlansView />;
      case "supplements":
        return <SupplementsView />;
      case "orders":
        return (
          <SupplementOrdersView
            members={members}
            isLoading={isLoadingMembers}
          />
        );
      case "profile":
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5] flex">
        <aside className="w-64 bg-[#111]/50 border-r border-[#e5e5e5]/10 flex flex-col">
          <div className="flex items-center gap-3 p-6 border-b border-[#e5e5e5]/10">
            <Dumbbell className="w-8 h-8 text-[#e5e5e5]" />
            <span className="text-2xl font-bold">GymFlow</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "dashboard"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView("members")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "members"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Members</span>
            </button>
            <button
              onClick={() => setCurrentView("trainers")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "trainers"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <Dumbbell className="w-5 h-5" />
              <span>Trainers</span>
            </button>
            <button
              onClick={() => setCurrentView("plans")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "plans"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Plans</span>
            </button>
            <button
              onClick={() => setCurrentView("supplements")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "supplements"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Supplements</span>
            </button>
            <button
              onClick={() => setCurrentView("orders")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                currentView === "orders"
                  ? "bg-[#e5e5e5]/10 text-white font-semibold"
                  : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Orders</span>
            </button>
          </nav>
          <div className="p-4 border-t border-[#e5e5e5]/10">
            <button
              onClick={() => setCurrentView("profile")}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 mb-2 ${
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

        <main className="flex-1 p-8 overflow-y-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold capitalize">{currentView}</h1>
              <p className="text-[#e5e5e5]/60">
                Welcome back, Admin. Here's a summary of your gym.
              </p>
            </div>
          </header>
          {renderContent()}
        </main>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel the subscription for ${selectedUser?.fullName}? This action cannot be undone.`}
        confirmText="Yes, Cancel Subscription"
        isProcessing={isProcessing}
        variant="danger"
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
    </>
  );
};

export default AdminDashboard;
