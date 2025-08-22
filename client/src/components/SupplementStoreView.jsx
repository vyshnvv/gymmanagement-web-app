import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Filter,
  Search,
  Package,
  Dumbbell,
  Heart,
  Zap,
  Moon,
  Shield,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

const SupplementStoreView = () => {
  const [supplements, setSupplements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");


  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching supplements...");
        const res = await axiosInstance.get("/supplements");
        console.log("API Response:", res);
        console.log("Supplements data:", res.data);
        console.log("Number of supplements:", res.data?.length);
        setSupplements(res.data || []);
      } catch (err) {
        console.error("Failed to fetch supplements:", err);
        console.error("Error details:", err.response?.data);
        console.error("Error status:", err.response?.status);
        setError("Could not load supplements. Please try again later.");
        toast.error("Failed to load supplements.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupplements();
  }, []);

  const categories = [
    { id: "all", name: "All Products", icon: Package },
    { id: "whey-protein", name: "Whey Protein", icon: Dumbbell },
    { id: "casein-protein", name: "Casein Protein", icon: Moon },
    { id: "creatine", name: "Creatine", icon: Zap },
    { id: "pre-workout", name: "Pre-Workout", icon: Heart },
    { id: "multivitamins", name: "Multivitamins", icon: Shield },
    { id: "fish-oil", name: "Fish Oil", icon: Package },
  ];

  const filteredSupplements = supplements.filter((supplement) => {
    const matchesCategory =
      selectedCategory === "all" || supplement.category === selectedCategory;
    const matchesSearch =
      supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  console.log("All supplements:", supplements);
  console.log("Filtered supplements:", filteredSupplements);
  console.log("Selected category:", selectedCategory);
  console.log("Search term:", searchTerm);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);

  const addToCart = (supplement) => {
    const existingItem = cart.find((item) => item._id === supplement._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === supplement._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...supplement, quantity: 1 }]);
    }
    toast.success(`Added ${supplement.name} to cart`);
  };

  const removeFromCart = (supplementId) => {
    const existingItem = cart.find((item) => item._id === supplementId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item._id === supplementId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item._id !== supplementId));
    }
  };

  const getCartQuantity = (supplementId) => {
    const item = cart.find((item) => item._id === supplementId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    if (isProcessingOrder) return;
    setIsCheckoutModalOpen(false);
  };

  const handleConfirmCheckout = async () => {
    setIsProcessingOrder(true);
    try {
      await axiosInstance.post("/orders/supplements", { cartItems: cart });
      toast.success("Order placed successfully!");
      setCart([]);
      handleCloseCheckoutModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-[#e5e5e5]/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 col-span-full">
          <LoaderCircle className="w-12 h-12 text-[#e5e5e5]/30 animate-spin mb-4" />
          <h3 className="text-xl font-semibold">Loading Supplements</h3>
          <p className="text-[#e5e5e5]/60">Please wait a moment...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 col-span-full bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-400">
            An Error Occurred
          </h3>
          <p className="text-[#e5e5e5]/60">{error}</p>
        </div>
      );
    }

    if (filteredSupplements.length === 0) {
      return (
        <div className="text-center py-12 col-span-full">
          <Package className="w-16 h-16 text-[#e5e5e5]/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-[#e5e5e5]/60">
            Try adjusting your search or category filter.
          </p>
        </div>
      );
    }

    return filteredSupplements.map((supplement) => {
      const cartQuantity = getCartQuantity(supplement._id);
      return (
        <div
          key={supplement._id}
          className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl overflow-hidden hover:border-[#e5e5e5]/20 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        >

          <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-[#e5e5e5]/10 flex items-center justify-center">
            <Package className="w-16 h-16 text-[#e5e5e5]/30" />
          </div>


          <div className="p-6 flex flex-col flex-1">

            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem]">
                {supplement.name}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                {renderStarRating(supplement.rating)}
                <span className="text-sm text-[#e5e5e5]/60">
                  ({supplement.reviews})
                </span>
              </div>


              <div className="flex items-baseline justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-400">
                    ${supplement.price}
                  </span>
                  <span className="text-sm text-[#e5e5e5]/60">
                    (${(supplement.price / supplement.servings).toFixed(2)}
                    /serving)
                  </span>
                </div>
              </div>
            </div>


            <div className="mb-4 flex-1">
              <p className="text-[#e5e5e5]/70 text-sm leading-relaxed line-clamp-3">
                {supplement.description}
              </p>
            </div>


            <div className="mb-6">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between py-2 px-3 bg-[#e5e5e5]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-[#e5e5e5]/80">Servings</span>
                  </div>
                  <span className="font-medium">{supplement.servings}</span>
                </div>

                {supplement.flavor !== "N/A" && (
                  <div className="flex items-center justify-between py-2 px-3 bg-[#e5e5e5]/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-[#e5e5e5]/80">Flavor</span>
                    </div>
                    <span className="font-medium">{supplement.flavor}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 px-3 bg-[#e5e5e5]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-[#e5e5e5]/80">Status</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      supplement.inStock
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {supplement.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>


            <div className="mt-auto">
              {cartQuantity === 0 ? (
                <button
                  onClick={() => addToCart(supplement)}
                  disabled={!supplement.inStock}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-all duration-200 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4 bg-[#e5e5e5]/5 rounded-lg py-3">
                    <button
                      onClick={() => removeFromCart(supplement._id)}
                      className="flex items-center justify-center w-10 h-10 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <div className="text-sm text-[#e5e5e5]/60">Quantity</div>
                      <div className="text-xl font-bold">{cartQuantity}</div>
                    </div>
                    <button
                      onClick={() => addToCart(supplement)}
                      className="flex items-center justify-center w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-[#e5e5e5]/60">Subtotal:</span>
                    <span className="font-bold text-blue-400 ml-1">
                      ${(supplement.price * cartQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Supplement Store</h1>
            <p className="text-[#e5e5e5]/60">
              Premium supplements to fuel your fitness journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e5e5e5]/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search supplements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-lg focus:outline-none focus:border-[#e5e5e5]/30 text-white placeholder-[#e5e5e5]/40"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6">

          <div className="w-64 flex-shrink-0">
            <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "hover:bg-[#e5e5e5]/5 text-[#e5e5e5]/70 hover:text-white"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>


          <div className="flex-1">
            <div className="mb-4">
              {!isLoading && !error && (
                <p className="text-[#e5e5e5]/60">
                  Showing {filteredSupplements.length} products
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderContent()}
            </div>
          </div>
        </div>


        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-sm border-t border-[#e5e5e5]/10 p-4 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
                <div>
                  <span className="font-semibold">{totalItems} items</span>
                  <span className="text-[#e5e5e5]/60 ml-2">
                    • Total: ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>


      <ConfirmationModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseCheckoutModal}
        onConfirm={handleConfirmCheckout}
        title="Confirm Your Purchase"
        message={`You are about to purchase ${totalItems} item(s) for a total of $${totalPrice.toFixed(
          2
        )}. Do you want to proceed?`}
        confirmText="Yes, Place Order"
        isProcessing={isProcessingOrder}
      />
    </>
  );
};

export default SupplementStoreView;
