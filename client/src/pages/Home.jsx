import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { fetchNearbyNGOs } from "../utils/fetchNearbyNGOs";
import { useEffect, useState, useRef,useContext } from "react";
import axios from "axios";
import {
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Shield,
  ChefHat,
} from "lucide-react";
import TypewriterHero from "../components/TypeWriterHero";

const Home = () => {
  const { idToken, userData } = useContext(AppContext);
  const [expiryItems, setExpiryItems] = useState([]);
  const [freshCount, setFreshCount] = useState(0);
  const [rottenCount, setRottenCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [closestExpiringProduct, setClosestExpiringProduct] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const dashboardStats = [
    {
      label: "Expiring Soon",
      count: expiringSoonCount,
      bg: "bg-gradient-to-br from-amber-50 to-yellow-100",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: AlertTriangle,
      color: "text-amber-500",
    },
    {
      label: "Rotten",
      count: rottenCount,
      bg: "bg-gradient-to-br from-red-50 to-rose-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      label: "Fresh",
      count: freshCount,
      bg: "bg-gradient-to-br from-green-50 to-emerald-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/recipes/recent`,
          {
            headers: {
              token: idToken,
            },
          }
        );

        if (res.data.success) {
          setRecentRecipes(res.data.recipes);
        }
      } catch (err) {
        console.error("Failed to fetch recent recipes:", err);
      }
    };

    fetchRecent();
  }, [idToken]);

  const [donationCenters, setDonationCenters] = useState([]);
  const controllerRef = useRef(null);

  useEffect(() => {
    const getDonationCenters = async () => {
      try {
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
        const controller = new AbortController();
        controllerRef.current = controller;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };

            const nearbyNGOs = await fetchNearbyNGOs(coords, controller.signal);
            setDonationCenters(
              nearbyNGOs.filter(
                (center) =>
                  center.location &&
                  center.location.toLowerCase() !== "unknown" &&
                  center.location.toLowerCase() !== "n/a" &&
                  center.location.trim() !== ""
              )
            );
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to fetch location. Cannot load donation centers.");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } catch (err) {
        console.error("Error fetching donation centers:", err);
      }
    };

    getDonationCenters();
  }, []);

  useEffect(() => {
    const fetchExpiryItems = async () => {
      try {
        console.log("Fetching expiry items for user:", userData.id);
        if (!userData.id || !userData.products) {
          console.warn("User data or products not loaded yet.");
          return;
        }

        const products = userData.products;

        if (userData.products && userData.products.length > 0) {
          const sortedByExpiry = [...userData.products].sort((a, b) => {
            return new Date(a.expiryDate) - new Date(b.expiryDate);
          });

          setClosestExpiringProduct(sortedByExpiry[0]);
        }

        const now = new Date();

        let freshCount = 0;
        let rottenCount = 0;
        let expiringSoonCount = 0;

        const formattedItems = products.map((product) => {
          const status = product.freshness || "Unknown";
          const expiryDate = new Date(product.expiryDate);
          const diffInDays = Math.ceil(
            (expiryDate - now) / (1000 * 60 * 60 * 24)
          );

          if (status === "Rotten") {
            rottenCount++;
          } else if (status === "Fresh") {
            freshCount++;
            if (diffInDays <= 2) {
              expiringSoonCount++;
              freshCount--;
            }
          }

          return {
            productName: product.productName || "Unknown",
            status:
              status === "Rotten"
                ? "Rotten"
                : diffInDays <= 2
                ? "Expiring Soon"
                : "Fresh",
            icon:
              product.productImage ||
              "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
            bg:
              status === "Rotten"
                ? "bg-red-50"
                : diffInDays <= 2
                ? "bg-yellow-50"
                : "bg-green-50",
            text:
              status === "Rotten"
                ? "text-red-600"
                : diffInDays <= 2
                ? "text-yellow-700"
                : "text-green-600",
            daysLeft: diffInDays,
            uploadDate: product.uploadDate || product.createdAt, // Add upload date for sorting
          };
        });

        // Sort formatted items by upload date in descending order (most recent first)
        const sortedFormattedItems = formattedItems.sort((a, b) => {
          const dateA = new Date(a.uploadDate);
          const dateB = new Date(b.uploadDate);
          return dateB - dateA; // Descending order (newest first)
        });

        setExpiryItems(sortedFormattedItems);

        setFreshCount(freshCount);
        setExpiringSoonCount(expiringSoonCount);
        setRottenCount(rottenCount);
      } catch (error) {
        console.error("Error fetching expiry items:", error);
      }
    };

    fetchExpiryItems();
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <TypewriterHero />

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* AI-Powered Detection */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-4">
              AI-Powered Detection
            </h3>
            <p className="text-gray-600 mb-6">
              Scan any fruit or vegetable to instantly detect freshness with
              high accuracy
            </p>
          </div>

          {/* Inventory Tracking */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-4">
              Inventory Tracking
            </h3>
            <p className="text-gray-600 mb-6">
              Save scanned items to track expiration dates and reduce food waste
            </p>
          </div>

          {/* NGO Donations */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-4">
              NGO Donations
            </h3>
            <p className="text-gray-600 mb-6">
              Find nearby NGOs to donate excess food and earn Aptos rewards
            </p>
          </div>

          {/* AI Recipe Generator */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <ChefHat className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              AI Recipe Generator
            </h3>
            <p className="text-gray-600 mb-6">
              Generate personalized recipes based on your fresh ingredients
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Section - Hidden initially, shown when user is logged in */}
      {userData && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {dashboardStats.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={i}
                  className={`${item.bg} ${item.border} border-2 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`w-8 h-8 ${item.color}`} />
                    <span className={`text-3xl font-bold ${item.text}`}>
                      {item.count}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-lg ${item.text}`}>
                    {item.label}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Expiry Tracker & Donation Centers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Expiry Tracker */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Expiry Tracker
              </h2>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {expiryItems.map((item, i) => (
                  <div
                    key={i}
                    className={`${item.bg} p-4 rounded-xl border-l-4 ${
                      item.status === "Rotten"
                        ? "border-red-500"
                        : item.status === "Expiring Soon"
                        ? "border-yellow-500"
                        : "border-green-500"
                    } hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.icon}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <span className="font-semibold text-gray-800 text-lg">
                            {item.productName}
                          </span>
                          <p className="text-sm text-gray-600">
                            {item.daysLeft > 0
                              ? `${item.daysLeft} days left`
                              : "Expired"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`${item.text} font-bold px-4 py-2 rounded-full text-sm`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Centers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Donation Centers
              </h2>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {donationCenters.map((center, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100"
                  >
                    <h3 className="font-bold text-lg text-blue-800 mb-2">
                      {center.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <p className="text-sm">{center.location}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <p className="text-sm">{center.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recipes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-3xl shadow-lg border border-green-200 backdrop-blur-sm">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
      🤖 AI Recipes
    </h2>
    <p className="text-green-600 font-medium">Discover delicious recipes crafted by AI</p>
    <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mt-3"></div>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {recentRecipes.map((recipe, i) => {
      return (
        <Link to={`/recipes/${recipe._id}`} key={i}>
          <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer shadow-lg hover:bg-white/90 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-300/20 to-emerald-400/20 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="relative z-10 text-center">
              {/* Recipe Image */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-md">
                  <img
                    src={
                      recipe.image ||
                      "https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
                    }
                    alt={recipe.title}
                    className="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">✨</span>
                </div>
              </div>

              {/* Recipe Title */}
              <h3 className="font-bold text-gray-800 text-lg mb-4 group-hover:text-green-700 transition-colors leading-tight">
                {recipe.title}
              </h3>

              {/* Ingredients */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-green-100">
                <div className="text-sm text-gray-700 space-y-2 max-h-24 overflow-y-auto">
                  {recipe.ingredients?.slice(0, 4).map((ing, j) => (
                    <div key={j} className="flex items-center gap-2 text-left">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs leading-relaxed">{ing}</span>
                    </div>
                  ))}
                  {recipe.ingredients?.length > 4 && (
                    <div className="text-xs text-green-600 font-medium text-center pt-1">
                      +{recipe.ingredients.length - 4} more ingredients
                    </div>
                  )}
                </div>
              </div>

              {/* Time and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{recipe.time}</span>
                </div>
                
                <div className="flex items-center gap-1 text-green-600 group-hover:text-green-700 transition-colors">
                  <span className="text-xs font-medium">View Recipe</span>
                  <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/0 to-emerald-500/0 group-hover:from-green-400/5 group-hover:to-emerald-500/5 transition-all duration-500"></div>
          </div>
        </Link>
      );
    })}
  </div>
</div>
        </div>
      )}
    </div>
  );
};

export default Home;
