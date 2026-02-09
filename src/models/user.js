import mongoose from "mongoose";
import bcrypt from "bcrypt";

//user schemaaaaa omgggggggg
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name can not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [6, "Password must be at lease 6 characters"],
      select: false,
    },
    theme: {
      type: String,
      enum: {
        values: ["cosmic", "garden", "neon"],
        message: "{VALUE} is not a valid theme",
      },
      default: "cosmic",
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    savingsGoal: {
      type: Number,
      default: 0,
    },
    savingsProgress: {
      type: Number,
      default: 0,
    },
    savingsGoalName: {
      type: String,
      default: "My Savings Goal",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

//hashing password before adding to databasssse
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

//using methods to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//another cute method to get profile without sensitive data
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    theme: this.theme,
    balance: this.balance,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
