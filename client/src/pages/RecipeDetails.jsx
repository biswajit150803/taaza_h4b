import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken } = useContext(AppContext);


  useEffect(() => {
    // Don't fetch if id is undefined
    if (!id) {
      setError("Recipe ID is missing from URL");
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/recipes/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: idToken,
            },
          }
        );
        
        console.log("API Response:", res.data);
        
        // Fix: Use res.data.recipe instead of res.data.recipes
        setRecipe(res.data.recipe);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, idToken]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading recipe...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6 text-center text-gray-600">Recipe not found</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
      <h1 className="text-3xl font-bold text-green-700 mb-4">{recipe.title}</h1>
      <img
        src={
          recipe.image ||
          "https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
        }
        alt={recipe.title}
        className="w-full max-h-60 object-contain mb-4 rounded"
      />
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
        <ul className="list-disc pl-6 text-gray-700">
          {recipe.ingredients?.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>
      <h3 className="text-xl font-semibold mb-2">Steps:</h3>
      <p className="text-gray-600 mb-2">{recipe.content}</p>
      <p className="text-lg text-black-500">Estimated Time: {recipe.time}</p>
      {recipe.instructions && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {recipe.instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;