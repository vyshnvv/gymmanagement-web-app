import { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Dumbbell,
  User,
  Target,
  Users,
  Calendar,
  Phone,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Country codes data
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" },
  { code: "+45", country: "DK", flag: "🇩🇰" },
  { code: "+358", country: "FI", flag: "🇫🇮" },
];

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "+91",
  });

  const { signUp, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (formData.phoneNumber && !/^\d{10,15}$/.test(formData.phoneNumber))
      return toast.error("Please enter a valid phone number (10-15 digits)");
    return true;
  };

  const isFormValid = useMemo(() => {
    const phoneValid =
      !formData.phoneNumber || /^\d{10,15}$/.test(formData.phoneNumber);
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      formData.password.length >= 6 &&
      phoneValid
    );
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      // Combine country code and phone number with a space
      const submitData = {
        ...formData,
        phoneNumber: formData.phoneNumber
          ? `${formData.countryCode} ${formData.phoneNumber}`
          : "",
      };
      signUp(submitData);
    }
  };

  const selectedCountry = countryCodes.find(
    (country) => country.code === formData.countryCode
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 text-[#e5e5e5]">
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side - Marketing Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-[#e5e5e5]" />
            <h1 className="text-4xl font-bold">GymFlow</h1>
          </div>
          <h2 className="text-5xl font-light leading-tight">
            Design your future,{" "}
            <span className="font-medium">sculpt your life</span>.
          </h2>
          <p className="text-lg text-[#e5e5e5]/70">
            The ultimate platform to track progress, schedule sessions, and
            connect with your fitness community.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#e5e5e5]/10 rounded-full flex items-center justify-center border border-[#e5e5e5]/20">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-[#e5e5e5]/90">Personalized training plans</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#e5e5e5]/10 rounded-full flex items-center justify-center border border-[#e5e5e5]/20">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-[#e5e5e5]/90">Energizing group classes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#e5e5e5]/10 rounded-full flex items-center justify-center border border-[#e5e5e5]/20">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-[#e5e5e5]/90">Flexible scheduling</p>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#e5e5e5]/5 p-8 rounded-xl border border-[#e5e5e5]/10 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-[#e5e5e5]">
                Create Account
              </h2>
              <p className="text-[#e5e5e5]/60 mt-2">Join us today!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-[#e5e5e5]/80 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full py-2 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Phone Number Field with Country Code Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-[#e5e5e5]/80 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Phone Number (Optional)
                </label>
                <div className="flex gap-0">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 bg-[#e5e5e5]/5 border-b-2 border-[#e5e5e5]/30 hover:border-[#e5e5e5]/50 focus:border-[#e5e5e5] focus:outline-none"
                      onClick={() =>
                        setShowCountryDropdown(!showCountryDropdown)
                      }
                    >
                      <span className="text-sm">{selectedCountry?.flag}</span>
                      <span className="text-sm">{formData.countryCode}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 z-10 w-48 bg-[#2a2a2a] border border-[#e5e5e5]/20 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
                        {countryCodes.map((country, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-[#e5e5e5]/10 flex items-center gap-3 text-sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                countryCode: country.code,
                              });
                              setShowCountryDropdown(false);
                            }}
                          >
                            <span>{country.flag}</span>
                            <span>{country.country}</span>
                            <span className="text-[#e5e5e5]/60">
                              {country.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="1234567890"
                    className="flex-1 py-2 px-3 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phoneNumber: value });
                    }}
                    maxLength="15"
                  />
                </div>
                <p className="text-xs text-[#e5e5e5]/50">
                  Enter your phone number without the country code
                </p>
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
                    className="w-full py-2 bg-transparent border-b-2 border-[#e5e5e5]/30 focus:border-[#e5e5e5] focus:outline-none pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-0 text-[#e5e5e5]/60 hover:text-[#e5e5e5]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-[#e5e5e5] text-[#1a1a1a] font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
                disabled={isSigningUp || !isFormValid}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="text-center pt-6 mt-6 border-t border-[#e5e5e5]/10">
              <p className="text-[#e5e5e5]/60 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#e5e5e5] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
