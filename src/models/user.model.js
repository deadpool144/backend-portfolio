import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

    // ⭐ For OTP Verification (to add later)
    isVerified: {
      type: Boolean,
      default: false,     // Will become true after OTP verification
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },


    otp: {
     type: String,
     default: null,
    },
    otpExpires: {
     type: Date,
     default: null,
    },

    // ⭐ For Forgot Password (to add later)
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only hash if password is modified or on new user
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
