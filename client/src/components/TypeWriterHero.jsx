import React, { useState, useEffect } from "react";
import { Shield, Camera, ChefHat, Sparkles } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const TypewriterHero = () => {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Taaza: Where AI Meets Freshness";
  const { userData, idToken } = React.useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        // Reset to start over
        currentIndex = 0;
        setTimeout(() => {
          // Optional: brief pause before restarting
        }, 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullText]);

  const handleStartScanning = () => {
    if (userData && idToken) {
      navigate("/food-detection");
    } else {
      navigate("/login");
    }
  };

  // Handler for Browse Recipes button
  const handleBrowseRecipes = () => {
    if (userData && idToken) {
      navigate("/recipe-suggestion");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-7 text-center">
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-3 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Food Freshness Detection
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-1 min-h-[120px] md:min-h-[100px]">
          <span className="bg-gradient-to-r from-green-500 via-green-700 to-black bg-clip-text text-transparent">
            {displayedText}
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Detect food freshness, track inventory, discover recipes, and donate
          to NGOs
          <br />
          while earning Aptos rewards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartScanning}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            Start Scanning
          </button>
          <button
            onClick={handleBrowseRecipes}
            className="border border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ChefHat className="w-5 h-5" />
            Browse Recipes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypewriterHero;
