import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  ArrowRight,
  Calendar,
  Target,
  Users,
  Trophy,
  Clock,
  CheckCircle,
  Star,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // Adjust path if needed

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const LandingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch plan details from the backend when the component loads
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/plans");
        // Sort plans by price to ensure a consistent order (e.g., Basic, Premium, VIP)
        const sortedPlans = res.data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast.error("Could not load membership plans right now.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []); 

  // Navigation handlers
  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  const handleNavigateToSignUp = () => {
    navigate("/signup");
  };

  // Map position
  const position = [9.979, 76.281]; 

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-[#e5e5e5]/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-[#e5e5e5]" />
              <span className="text-2xl font-bold">GymFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleNavigateToLogin}
                className="px-4 py-2 text-[#e5e5e5]/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleNavigateToSignUp}
                className="px-6 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-lg font-medium hover:bg-[#e5e5e5]/90 transition-colors"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto min-h-[600px] flex flex-col justify-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e5e5e5]/10 rounded-full border border-[#e5e5e5]/20">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    #1 Fitness Platform
                  </span>
                </div>
                <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
                  Your Fitness
                  <br />
                  <span className="text-transparent bg-gradient-to-r from-[#e5e5e5] to-[#e5e5e5]/60 bg-clip-text">
                    Journey Starts Here
                  </span>
                </h1>
                <p className="text-2xl lg:text-3xl text-[#e5e5e5]/70 leading-relaxed max-w-4xl mx-auto">
                  Transform your body, elevate your mind, and join a community
                  of champions. Experience fitness like never before with
                  personalized training and cutting-edge facilities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleNavigateToSignUp}
                  className="group px-12 py-6 bg-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold text-xl hover:bg-[#e5e5e5]/90 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  Join Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleNavigateToSignUp}
                  className="group px-12 py-6 border-2 border-[#e5e5e5]/30 rounded-xl font-bold text-xl hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Calendar className="w-6 h-6" />
                  Book a Class
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section - DYNAMIC */}
      <section
        id="plans"
        className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#e5e5e5]/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-[#e5e5e5]/70 max-w-2xl mx-auto">
              Select the perfect membership plan that fits your fitness goals
              and lifestyle.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center col-span-3 text-lg text-[#e5e5e5]/70">
                Loading plans...
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 flex flex-col hover:transform hover:scale-105 transition-all duration-300 relative ${
                    plan.isPopular
                      ? "bg-gradient-to-b from-[#e5e5e5]/15 to-[#e5e5e5]/5 border-2 border-[#e5e5e5]/30"
                      : "bg-[#e5e5e5]/5 border-[#e5e5e5]/10 hover:bg-[#e5e5e5]/10"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#e5e5e5] text-[#1a1a1a] px-6 py-2 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  <div
                    className={`text-center mb-8 ${
                      plan.isPopular ? "mt-4" : ""
                    }`}
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
                    onClick={handleNavigateToSignUp}
                    className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                      plan.isPopular
                        ? "bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
                        : "border-2 border-[#e5e5e5]/30 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10"
                    }`}
                  >
                    {plan.isPopular ? "Buy Plan" : "Subscribe"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#e5e5e5]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Contact & Location
            </h2>
            <p className="text-xl text-[#e5e5e5]/70 max-w-2xl mx-auto">
              We're here to help and answer any question you might have. We look
              forward to hearing from you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="w-6 h-6 text-[#e5e5e5]/70" />
                    <a
                      href="mailto:contact@gymflow.com"
                      className="text-lg hover:text-[#e5e5e5]"
                    >
                      contact@gymflow.com
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-[#e5e5e5]/70" />
                    <a
                      href="tel:+919876543210"
                      className="text-lg hover:text-[#e5e5e5]"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-[#e5e5e5]/70" />
                    <p className="text-lg">
                      Marine Drive, Kochi, Kerala 682011, India
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Follow Us</h3>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-[#e5e5e5]/70 hover:text-[#e5e5e5] transition-colors"
                  >
                    <Facebook className="w-8 h-8" />
                  </a>
                  <a
                    href="#"
                    className="text-[#e5e5e5]/70 hover:text-[#e5e5e5] transition-colors"
                  >
                    <Twitter className="w-8 h-8" />
                  </a>
                  <a
                    href="#"
                    className="text-[#e5e5e5]/70 hover:text-[#e5e5e5] transition-colors"
                  >
                    <Instagram className="w-8 h-8" />
                  </a>
                </div>
              </div>
            </div>
            <div className="h-96 w-full rounded-2xl border border-[#e5e5e5]/20 overflow-hidden">
              <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={position}>
                  <Popup>
                    GymFlow - Marine Drive <br /> Kochi, Kerala.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#e5e5e5]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Dumbbell className="w-6 h-6" />
              <span className="text-xl font-bold">GymFlow</span>
            </div>
            <div className="text-[#e5e5e5]/60 text-sm">
              © 2025 GymFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
