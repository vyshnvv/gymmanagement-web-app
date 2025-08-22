import Plan from "../models/plan.model.js";



export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.status(200).json(plans);
  } catch (error) {
    console.log("Error in getPlans controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updatePlan = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }


    const { id } = req.params;
    const { price, features, isPopular } = req.body;


    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }


    if (isPopular === true) {

      await Plan.updateMany({ _id: { $ne: id } }, { isPopular: false });
    }


    plan.price = price;
    plan.features = features;
    plan.isPopular = isPopular;


    const updatedPlan = await plan.save();
    res.status(200).json(updatedPlan);
  } catch (error) {
    console.log("Error in updatePlan controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
