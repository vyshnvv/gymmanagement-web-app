import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  LogIn,
  Dumbbell,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      login(formData);
    }
  };

  return (
    // Main container with the dark background color
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4 text-[#e5e5e5]">
      <div className="w-full max-w-sm">
        <div className="bg-[#1a1a1a] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e5e5e5]/10 rounded-full mb-4">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-semibold">Welcome Back</h2>
            <p className="text-[#e5e5e5]/60 mt-2">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Fields */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#e5e5e5]/80 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full py-2 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#e5e5e5]/80 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full py-2 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-0 text-[#e5e5e5]/60 hover:text-[#e5e5e5]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium text-[#e5e5e5]/80 flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" />
                Role
              </label>
              <select
                id="role"
                className="w-full py-2 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#e5e5e5] text-[#1a1a1a] font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-[#e5e5e5]/10">
            <p className="text-[#e5e5e5]/60 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#e5e5e5] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
