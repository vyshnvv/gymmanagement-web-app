import User from "../models/user.model.js";
import Supplement from "../models/supplement.model.js";


export const createSupplementOrder = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user._id; 

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    if (!user.supplementOrders) {
      user.supplementOrders = [];
    }

    let totalAmount = 0;
    const orderItems = [];


    for (const item of cartItems) {
      const supplement = await Supplement.findById(item._id);
      if (!supplement) {
        return res
          .status(404)
          .json({ message: `Supplement '${item.name}' not found.` });
      }
      if (!supplement.inStock) {
        return res
          .status(400)
          .json({ message: `'${supplement.name}' is out of stock.` });
      }

      totalAmount += supplement.price * item.quantity;
      orderItems.push({
        supplementId: supplement._id,
        name: supplement.name,
        price: supplement.price, 
        quantity: item.quantity,
      });
    }


    const newOrder = {
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      orderDate: new Date(),
      status: "processing", 
    };

    user.supplementOrders.push(newOrder);
    await user.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.log("Error in createSupplementOrder controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
