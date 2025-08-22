import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx"; 

const LogoutPage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(navigate);
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-[#e5e5e5]">
      <Loader className="size-10 animate-spin" />
      <span className="ml-2">Logging out...</span>
    </div>
  );
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-[#e5e5e5]">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Routes>

        <Route
          path="/"
          element={!authUser ? <LandingPage /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={
            authUser && authUser.role === "user" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            authUser && authUser.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : authUser.role === "admin" ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/logout"
          element={authUser ? <LogoutPage /> : <Navigate to="/" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
