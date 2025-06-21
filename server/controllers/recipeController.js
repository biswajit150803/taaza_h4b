import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const saveRecipe = async (req, res) => {
  try {
    const token = req.headers.token;
    const { title, content, time, ingredients } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    if (!title || !content || !time || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ success: false, message: "Missing required recipe data" });
    }

    // Find user by Civic ID (sub from token)
    const user = await userModel.findOne({ civicId: decoded.sub });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newRecipe = {
      title,
      content,
      time,
      ingredients,
      savedAt: new Date(),
    };

    user.savedRecipes.push(newRecipe);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Recipe saved successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRecentRecipes = async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.decode(token);
    if (!decoded?.sub) return res.status(400).json({ success: false, message: "Invalid token" });

    const user = await userModel.findOne({ civicId: decoded.sub });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const recentRecipes = user.savedRecipes
      .slice(-3) // Get last 3
      .reverse(); // Newest first

    res.status(200).json({ success: true, recipes: recentRecipes });
  } catch (error) {
    console.error("Fetch recent recipes error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const token = req.headers.token;
    const { id } = req.params;

    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.decode(token);
    if (!decoded?.sub) return res.status(400).json({ success: false, message: "Invalid token" });

    const user = await userModel.findOne({ civicId: decoded.sub });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const recipe = user.savedRecipes.id(id); // .id() finds subdocument by _id

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.status(200).json({ success: true, recipe });
  } catch (error) {
    console.error("Fetch recipe by ID error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};