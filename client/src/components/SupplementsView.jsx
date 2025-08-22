/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash,
  Package,
  LoaderCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal.jsx";


const SupplementFormModal = ({
  isOpen,
  onClose,
  onSave,
  supplement,
  isProcessing,
}) => {
  const initialState = {
    name: "",
    category: "whey-protein",
    price: "",
    description: "",
    servings: "",
    flavor: "",
    inStock: true,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (supplement) {
      setFormData({
        name: supplement.name || "",
        category: supplement.category || "whey-protein",
        price: supplement.price || "",
        description: supplement.description || "",
        servings: supplement.servings || "",
        flavor: supplement.flavor || "",
        inStock: supplement.inStock !== undefined ? supplement.inStock : true,
      });
    } else {
      setFormData(initialState);
    }
  }, [supplement, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#1a1a1a] border border-[#e5e5e5]/20 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {supplement ? "Edit Supplement" : "Add New Supplement"}
          </h2>
          <button onClick={onClose} disabled={isProcessing}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 bg-[#e5e5e5]/10 rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 bg-[#e5e5e5]/10 rounded"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 bg-[#e5e5e5]/10 rounded"
          >
            <option value="whey-protein">Whey Protein</option>
            <option value="casein-protein">Casein Protein</option>
            <option value="creatine">Creatine</option>
            <option value="pre-workout">Pre-Workout</option>
            <option value="multivitamins">Multivitamins</option>
            <option value="fish-oil">Fish Oil</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price ($)"
              className="w-full p-2 bg-[#e5e5e5]/10 rounded"
              required
            />
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              placeholder="Servings"
              className="w-full p-2 bg-[#e5e5e5]/10 rounded"
              required
            />
          </div>
          <input
            type="text"
            name="flavor"
            value={formData.flavor}
            onChange={handleChange}
            placeholder="Flavor"
            className="w-full p-2 bg-[#e5e5e5]/10 rounded"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              id="inStock"
            />
            <label htmlFor="inStock">In Stock</label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded bg-[#e5e5e5]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              {isProcessing ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SupplementsView = () => {
  const [supplements, setSupplements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSupplements = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/supplements");
      setSupplements(res.data);
    } catch (error) {
      toast.error("Failed to load supplements.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, []);

  const handleOpenFormModal = (supplement = null) => {
    setSelectedSupplement(supplement);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (supplement) => {
    setSelectedSupplement(supplement);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedSupplement(null);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleSaveSupplement = async (formData) => {
    setIsProcessing(true);
    try {
      if (selectedSupplement) {

        await axiosInstance.put(
          `/supplements/${selectedSupplement._id}`,
          formData
        );
        toast.success("Supplement updated successfully!");
      } else {

        await axiosInstance.post("/supplements", formData);
        toast.success("Supplement added successfully!");
      }
      fetchSupplements();
      handleCloseModals();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSupplement = async () => {
    setIsProcessing(true);
    try {
      await axiosInstance.delete(`/supplements/${selectedSupplement._id}`);
      toast.success("Supplement deleted successfully!");
      fetchSupplements();
      handleCloseModals();
    } catch (error) {
      toast.error("Failed to delete supplement.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Manage Supplements</h3>
          <button
            onClick={() => handleOpenFormModal()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Supplement
          </button>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]/10 text-sm text-[#e5e5e5]/60">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">In Stock</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplements.map((sup) => (
                  <tr key={sup._id} className="border-b border-[#e5e5e5]/5">
                    <td className="py-3 px-3">{sup.name}</td>
                    <td className="py-3 px-3 text-[#e5e5e5]/70 capitalize">
                      {sup.category.replace("-", " ")}
                    </td>
                    <td className="py-3 px-3 text-green-400">
                      ${sup.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sup.inStock
                            ? "bg-green-400/10 text-green-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {sup.inStock ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center space-x-2">
                      <button
                        onClick={() => handleOpenFormModal(sup)}
                        className="p-2 hover:bg-[#e5e5e5]/10 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(sup)}
                        className="p-2 hover:bg-[#e5e5e5]/10 rounded text-red-400"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>


      <SupplementFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveSupplement}
        supplement={selectedSupplement}
        isProcessing={isProcessing}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteSupplement}
        title="Delete Supplement"
        message={`Are you sure you want to delete ${selectedSupplement?.name}? This will permanently remove it from the store.`}
        confirmText="Yes, Delete"
        isProcessing={isProcessing}
        variant="danger"
      />
    </>
  );
};

export default SupplementsView;
