import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { 
      type: String,
      required: true,
      trim: true 
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true 
    },

    shortDescription: {
      type: String,
      required: true
    },

    fullDescription: {
      type: String,
      required: true
    },

    techStack: {
      type: [String],
      required: true
    },

    category: {
      type: String,
      enum: ["web", "ml", "app", "game", "Not specified", "other"],
      default: "Not specified",
    },

    // ⭐ Main project thumbnail / hero image
    coverImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // Additional images (gallery)
    images: [
      {
        url: String,
        public_id: String,
      }
    ],

    githubLink: String,
    liveDemoLink: String,

    features: [String],
    tags: [String],

    isFeatured: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ⭐ FUTURE FEATURES
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  },
  { timestamps: true }
);

// Auto-generate slug
projectSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-");
  }
  next();
});

export default mongoose.model("Project", projectSchema);
