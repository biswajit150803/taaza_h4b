import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./connection/db.js";
import userRouter from "./routes/userRoutes.js";
import LlamaExpiryDetectRouter from "./routes/LlamaExpiryDetectRoute.js";
import connectCloudinary from "./connection/cloudinary.js";
import donationRouter from "./routes/donationRoutes.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import userModel from "./models/userModel.js";
import recipeRouter from "./routes/recipeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/user/profile", async (req, res) => {
  try {
    console.log("Inside userProf", req.headers.token);
    const token = req.headers.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token format" });
    }

    let user = await userModel.findOne({ civicId: decoded.sub });

    if (!user) {
      // Create new user if doesn't exist
      console.log("🆕 Creating new user in database");
      user = new userModel({
        civicId: decoded.sub,
        name: decoded.name || "NA",
        email: decoded.email || "not_provided",
        picture: decoded.picture || null,
        products: [],
        donations: [],
        savedRecipes: [],
      });
      await user.save();
      console.log("✅ New user created:", user);
    }

    const userData = {
      id: user.civicId, 
      name: user.name, 
      email: user.email, 
      picture: user.picture, 
      products: user.products || [], 
      donations: user.donations || [], 
      createdAt: user.createdAt || new Date().toISOString(),
      savedRecipes: user.savedRecipes || [],
    };

    console.log("✅ Complete user data:", {
      id: userData.id,
      productsCount: userData.products.length,
      donationsCount: userData.donations.length,
    });

    return res.json({ success: true, userData });
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

app.use("/api/user", userRouter);
app.use("/api", LlamaExpiryDetectRouter);
app.use("/api", donationRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
