import express from "express";
import { getRecentRecipes, getRecipeById, saveRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/save", saveRecipe);
router.get("/recent", getRecentRecipes);
router.get("/:id", getRecipeById );

export default router;
