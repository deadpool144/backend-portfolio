import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allowed origins
const allowedOrigins = [
  "https://personel-project.vercel.app",
  "http://localhost:3000",
];

// CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Allow fixed origins OR any *.vercel.app
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

//import routes
import authRoutes from "./routes/auth.route.js";
import ownerProfileRoutes from "./routes/ownerProfile.route.js";
import projectRoutes from "./routes/project.route.js";
import adminRoutes from "./routes/admin.route.js";
import contactRoutes from "./routes/contact.route.js";


//use routes
app.use("/auth", authRoutes);
app.use("/owner-profile", ownerProfileRoutes);
app.use("/projects", projectRoutes);
app.use("/admin", adminRoutes);
app.use("/contact", contactRoutes);



export { app };
