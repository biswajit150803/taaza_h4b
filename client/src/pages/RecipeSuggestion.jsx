import React, { useContext, useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const RecipeSuggestion = () => {
  const { userData,idToken } = useContext(AppContext);
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.products?.length > 0) {
      const sorted = [...userData.products].sort((a, b) => {
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });

      const grouped = sorted.reduce((acc, item) => {
        const date = new Date(item.expiryDate).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {});

      setInventory(grouped); // grouped object by expiry date
    }
  }, [userData]);

  const handleCheckboxChange = (productName) => {
    setSelectedItems((prev) =>
      prev.includes(productName)
        ? prev.filter((item) => item !== productName)
        : [...prev, productName]
    );
  };

  const fetchRecipes = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Give me 3 simple Indian recipes I can make using only these ingredients: ${selectedItems.join(
        ", "
      )}. Include the following fields for each recipe: Title, Ingredients, Steps, Estimated Time, and a valid YouTube video link. Format them clearly as:
Title: ...
Ingredients:
- ...
Steps:
1. ...
Time: ...
YouTube: https://www.youtube.com/watch?v=...
Separate each recipe with two new lines.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const recipeBlocks = text
  .split(/(?=Title:\s)/i)
  .map((block) => block.trim())
  .filter((block) => block.length > 0);

const parsedRecipes = recipeBlocks
  .map((block) => {
    const titleMatch = block.match(/Title:\s*(.*)/i);
    const timeMatch = block.match(/Time:\s*(.*)/i);
    const videoMatch = block.match(/YouTube:\s*(https:\/\/www\.youtube\.com\/watch\?v=[\w-]+)/i);

    const ingredientsMatch = block.match(/Ingredients:/i);
    const stepsMatch = block.match(/Steps:/i);

    // Skip non-recipe introductions
    if (!ingredientsMatch && !stepsMatch) return null;

    return {
      title: titleMatch?.[1] || "Indian Recipe",
      time: timeMatch?.[1] || "Unknown",
      video: videoMatch?.[1] || null,
      content: block
        .replace(titleMatch?.[0], "")
        .replace(timeMatch?.[0], "")
        .replace(videoMatch?.[0], "")
        .trim(),
    };
  })
  .filter(Boolean);


      setRecipes(parsedRecipes);
    } catch (err) {
      console.error("Error generating recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipeToDB = async (recipe) => {
    if (!userData?.id) {
      alert("User not logged in.");
      return;
    }

    try {
      const payload = {
        userId: userData.id,
        title: recipe.title,
        content: recipe.content,
        time: recipe.time,
        video: recipe.video,
        ingredients: selectedItems,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/recipes/save`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            token:idToken,
          },
        }
      );
      if (res.data.success) {
        toast.success("✅ Recipe saved successfully!");
        setTimeout(() => {
        window.location.reload(); // OR navigate(0) if using React Router 6
      }, 1000); 
      } else {
        toast.error("❌ Failed to save recipe.");
      }
    } catch (err) {
      console.error("Save recipe error:", err);
      toast.error("An error occurred while saving the recipe.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f8ed] px-4 py-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar Inventory */}
        <div className="md:w-1/4 w-full bg-white rounded-3xl shadow-md p-6 h-fit">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            🧺 Your Inventory
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {Object.entries(inventory).map(([date, items]) => (
              <div key={date} className="mb-4">
                <h3 className="text-sm font-semibold text-green-700 mb-2">
                  {date}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <label key={item._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.productName)}
                        onChange={() => handleCheckboxChange(item.productName)}
                      />
                      <span className="text-gray-800 capitalize cursor-pointer">
                        {item.productName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-green-800 mb-6 text-center">
            🍛 AI-Powered Recipe Suggestions
          </h1>

          <div className="bg-[#e2eccd] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-800 font-medium text-center md:text-left">
              Selected ingredients:{" "}
              <span className="text-green-900 font-semibold">
                {selectedItems.join(", ") || "None"}
              </span>
            </p>
            <button
              onClick={fetchRecipes}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-all cursor-pointer"
            >
              {loading ? "Generating..." : "Suggest Recipes"}
            </button>
          </div>

          {loading && (
            <div className="flex justify-center mt-6">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <div className="space-y-8 mt-10">
            {recipes.map((recipe, index) => (
              <div
                key={index}
                className="bg-[#f9fdf4] border border-[#dbeac4] rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-green-800 mb-2">
                    {recipe.title}
                  </h2>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 mb-3">
                    {recipe.content}
                  </pre>
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-sm text-gray-600">
                      ⏱ Estimated Time:{" "}
                      <span className="font-medium text-green-800">
                        {recipe.time}
                      </span>
                    </p>
                    <button
                      onClick={() => saveRecipeToDB(recipe)}
                      className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm transition"
                    >
                      Save Recipe
                    </button>
                  </div>
                </div>

                {/* <div className="w-full md:w-80 h-48 md:h-40 flex-shrink-0">
                  {recipe.video ? (
                    <iframe
                      src={recipe.video.replace("watch?v=", "embed/")}
                      title={recipe.title}
                      allowFullScreen
                      className="w-full h-full rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl text-sm text-gray-500">
                      No video available
                    </div>
                  )}
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestion;
