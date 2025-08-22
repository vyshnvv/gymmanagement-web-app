import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // --- SUBSCRIPTION HISTORY ---
    subscriptionHistory: [
      {
        plan: {
          type: String,
          enum: ["none", "Basic", "Premium", "VIP"],
          default: "none",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["active", "inactive", "cancelled", "upgraded"],
          required: true,
        },
      },
    ],
    // --- SUPPLEMENT ORDERS ---
    supplementOrders: [
      {
        items: [
          {
            supplementId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Supplement",
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
            },
          },
        ],
        totalAmount: {
          type: Number,
          required: true,
        },
        orderDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
