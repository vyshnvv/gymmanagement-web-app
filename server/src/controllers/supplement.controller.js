import Supplement from "../models/supplement.model.js";


export const getSupplements = async (req, res) => {
  try {
    const supplements = await Supplement.find({});
    res.status(200).json(supplements);
  } catch (error) {
    console.log("Error in getSupplements controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const createSupplement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }
    const newSupplement = new Supplement(req.body);
    await newSupplement.save();
    res.status(201).json(newSupplement);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log("Error in createSupplement controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateSupplement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }
    const { id } = req.params;
    const updatedSupplement = await Supplement.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSupplement) {
      return res.status(404).json({ message: "Supplement not found." });
    }
    res.status(200).json(updatedSupplement);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log("Error in updateSupplement controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteSupplement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }
    const { id } = req.params;
    const deletedSupplement = await Supplement.findByIdAndDelete(id);

    if (!deletedSupplement) {
      return res.status(404).json({ message: "Supplement not found." });
    }
    res.status(200).json({ message: "Supplement deleted successfully." });
  } catch (error) {
    console.log("Error in deleteSupplement controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
