import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const EditPlanModal = ({ isOpen, onClose, plan, onSave, isProcessing }) => {
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState([]);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    if (plan) {
      setPrice(plan.price.toString());
      setFeatures(plan.features || []);
      setIsPopular(plan.isPopular || false);
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (index) =>
    setFeatures(features.filter((_, i) => i !== index));

  const handleSave = () => {
    onSave({
      ...plan,
      price: parseFloat(price),
      features,
      isPopular,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Edit '{plan.name}' Plan</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2">
              Price ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#e5e5e5]/10 p-3 rounded-lg border-2 border-transparent focus:border-[#e5e5e5]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2">Features</label>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-grow bg-[#e5e5e5]/10 p-3 rounded-lg border-2 border-transparent focus:border-[#e5e5e5]/50 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddFeature}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#e5e5e5]/10 rounded-lg hover:bg-[#e5e5e5]/20"
            >
              <Plus className="w-4 h-4" /> Add Feature
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold">
              'Most Popular' Badge
            </label>
            <button
              onClick={() => setIsPopular(!isPopular)}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                isPopular
                  ? "bg-green-500/20 text-green-400"
                  : "bg-[#e5e5e5]/10 text-[#e5e5e5]/70"
              }`}
            >
              {isPopular ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#e5e5e5]/10">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 border-2 border-[#e5e5e5]/30 rounded-lg font-bold hover:border-[#e5e5e5] hover:bg-[#e5e5e5]/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg font-bold disabled:opacity-50 bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#e5e5e5]/90"
          >
            {isProcessing ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPlanModal;
