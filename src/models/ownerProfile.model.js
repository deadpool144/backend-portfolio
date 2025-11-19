import mongoose from "mongoose";

const ownerProfileSchema = new mongoose.Schema(
  {
    // BASIC INFO
    fullName: {
      type: String,
      required: true,
    },

    headline: {
      type: String,  // Example: "Full Stack Developer | MERN | AI/ML"
      default: "",
    },

    shortBio: {
      type: String,  // Small paragraph for homepage
      default: "",
    },

    aboutMe: {
      type: String,  // Long description for About page
      default: "",
    },

    // PROFILE PHOTO
    profilePhoto: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // RESUME DOWNLOAD LINK
    resumeUrl: {
      type: String,
      default: "",
    },

    // SKILLS (Unlimited & Editable)
    skills: {
      type: [String],
      default: [],
    },

    // ⭐ UNLIMITED FLEXIBLE SOCIAL LINKS
    socialLinks: [
      {
        label: { type: String, required: true }, // "GitHub", "LinkedIn", etc.
        url: { type: String, required: true },
        icon: { type: String, default: "" },     // Optional icon name
      }
    ],

    // EXPERIENCE (Optional & Editable)
    experience: [
      {
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
        description: String,
      }
    ],

    // EDUCATION (Optional & Editable)
    education: [
      {
        school: String,
        degree: String,
        startDate: Date,
        endDate: Date,
      }
    ],

    // ⭐ FLEXIBLE EXTRA SECTIONS (Add Anything)
    customSections: [
      {
        sectionTitle: String,   // "Certificates", "Awards", "Courses", etc.
        items: [String],        // ["AWS Certified", "GDSC Speaker", ...]
      }
    ],

    // CONTACT INFO
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("OwnerProfile", ownerProfileSchema);
