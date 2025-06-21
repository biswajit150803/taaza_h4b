import React, { useRef, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Camera, Square, Search, Sparkles, Save, Zap } from 'lucide-react';
import { toast } from "react-toastify";
import { useWallet } from "../context/WalletContext";

const FoodDetection = () => {
  const { backendUrl, idToken, userData } = useContext(AppContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [prediction, setPrediction] = useState({
    fruit: "--",
    label: "--",
    confidence: "--",
  });

  const [saveStatus, setSaveStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { walletAddress, connectWallet } = useWallet();
  
    const ensureWalletConnection = async () => {
      if (!walletAddress) {
        const newAddress = await connectWallet();
        return newAddress;
      }
      return walletAddress;
    };

  const toggleCamera = async () => {
  if (!streaming) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      console.error("Camera access error:", err);
    }
  } else {
    // Stop all tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      
      // Clear the srcObject - This is the missing part!
      videoRef.current.srcObject = null;
    }
    
    setStreaming(false);
  }
};
  const scanImage = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/jpeg");

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL }),
      });

      const result = await response.json();
      setPrediction({
        fruit: result.fruit,
        label: result.label,
        confidence: (result.confidence * 100).toFixed(2) + "%",
      });
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  const chargeInventoryUser = async () => {
  try {
    const userAddress = await ensureWalletConnection(); // ensure it's connected

    if (!userAddress) {
      toast.error("Please connect your wallet to proceed.");
      return null;
    }

    const txPayload = {
      type: "entry_function_payload",
      function: `${import.meta.env.VITE_REWARD_MODULE_ADDRESS}::donation_reward::charge_inventory_user`,
      arguments: [import.meta.env.VITE_REWARD_ADMIN_ADDRESS],
      type_arguments: [],
    };

    // Sign and submit with Petra
    const txResponse = await window.aptos.signAndSubmitTransaction(txPayload);
    console.log("🔁 TX submitted:", txResponse.hash);

    // Optional: small wait for confirmation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return txResponse.hash;
  } catch (error) {
    console.error("❌ APT payment failed:", error);
    toast.error("APT charge failed. Please try again.");
    return null;
  }
};

  const handleRazorpayPayment = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { amount: 1 }, // You can dynamically set this
        {
          headers: {
            "Content-Type": "application/json",
            token: idToken,
          },
        }
      );

      const orderData = response.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Food Inventory",
        description: "Food Freshness Detection",
        order_id: orderData.id,
        handler: async function (response) {
          toast.success("Payment successful via Razorpay!");
          await saveToDatabase("razorpay", response.razorpay_payment_id);
        },
        prefill: {
          name: userData.name,
          email: userData.email,
        },
        theme: {
          color: "#22c55e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error.response?.data || error);
      toast.error("Payment Failed via Razorpay");
    }
  };

  const saveToDatabase = async (method = "aptos", paymentId = "") => {
    if (prediction.fruit === "--" || !userData.id) {
      alert("Please scan a food item first and ensure you are logged in.");
      return;
    }
    const txHash = await chargeInventoryUser();
    if (!txHash) return; // Cancel if failed

    setSaveStatus("Saving...");

    const expiryMapping = {
      apple: { fresh: 5, rotten: 1 },
      banana: { fresh: 4, rotten: 1 },
      tomato: { fresh: 3, rotten: 1 },
      cucumber: { fresh: 4, rotten: 1 },
      mango: { fresh: 6, rotten: 2 },
      orange: { fresh: 7, rotten: 2 },
      potato: { fresh: 15, rotten: 4 },
    };

    try {
      // Get the current image from canvas
      const canvas = canvasRef.current;
      const imageDataURL = canvas.toDataURL("image/jpeg");

      // Calculate expiry date based on freshness (you can adjust this logic)
      const currentDate = new Date();
      let expiryDate = new Date();

      const fruit = prediction.fruit.toLowerCase();
      const freshness = prediction.label.toLowerCase().includes("fresh")
        ? "fresh"
        : "rotten";
      // Using confidence to adjust expiry days
      const confidenceStr = prediction.confidence.replace("%", "").trim();
      const confidence = parseFloat(confidenceStr);

      let baseDays = expiryMapping[fruit]?.[freshness]
        ? expiryMapping[fruit][freshness]
        : 1;

      if (confidence < 60) {
        baseDays = Math.max(1, baseDays - 2);
      } else if (confidence < 85) {
        baseDays = Math.max(1, baseDays - 1);
      }
      expiryDate.setDate(currentDate.getDate() + baseDays);

      const productData = {
        paymentMethod: method,
        paymentId, // either Razorpay payment_id or blockchain txn hash
        userId: userData.id,
        productName: prediction.fruit,
        expiryDate: expiryDate.toISOString(),
        productImage: imageDataURL,
        freshness: prediction.label,
        confidence: prediction.confidence,
        transactionHash: txHash,
      };

      console.log("Product data to save:", productData);
      const response = await axios.post(
        backendUrl + "/api/user/save-product",
        productData,
        {
          headers: {
            "Content-Type": "application/json",
            token: idToken,
          },
        }
      );

      console.log(response);

      const result = await response.data;

      if (result.success) {
        setSaveStatus("✅ Saved successfully!");
        toast.success("Product saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("❌ Failed to save");
        toast.error(result.message || "Failed to save product.");
        console.error("Save error:", result.message);
      }
    } catch (error) {
      setSaveStatus("❌ Error saving");
      toast.error("Error saving product. Please try again.");
      console.error("Save to database error:", error);
    }
  };

  return (
     <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Food Analysis
        </div>
        <h1 className="text-4xl font-bold text-green-900 mb-4">
          Detect Food Freshness
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Use your camera to scan fruits and vegetables. Our Model will analyze the freshness and provide detailed insights.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Camera Scanner Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Camera Scanner</h2>
              <p className="text-gray-600">Position your food item in the camera view</p>
            </div>
          </div>

          {/* Camera View */}
          <div className="relative mb-6">
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden border-4 border-dashed border-gray-300 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${streaming ? 'block' : 'hidden'}`}
              />
              
              {!streaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">Camera not active</p>
                    <button
                      onClick={toggleCamera}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                      Start Camera
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {streaming && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br-lg"></div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex gap-4">
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                streaming
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {streaming ? <Square className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              {streaming ? "Stop Camera" : "Start Camera"}
            </button>

            <button
              onClick={scanImage}
              disabled={!streaming}
              className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                streaming
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Search className="w-5 h-5" />
              Scan Food
            </button>
          </div>
        </div>

        {/* Analysis Results Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-gray-600">AI-powered freshness detection results</p>
            </div>
          </div>

          {prediction.fruit === '--' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Scan a food item to see results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Display */}
              <div className="grid gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🍎</span>
                    <span className="text-sm font-medium text-green-700">DETECTED FRUIT</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">{prediction.fruit}</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-emerald-700">FRESHNESS STATUS</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-900">{prediction.label}</p>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-medium text-teal-700">CONFIDENCE LEVEL</span>
                  </div>
                  <p className="text-xl font-bold text-teal-900">{prediction.confidence}</p>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={async () => {
                  if (!paymentMethod) {
                    toast.error("Please select a payment method.");
                    return;
                  }
                  if (paymentMethod === "aptos") {
                    await saveToDatabase("aptos");
                  } else {
                    await handleRazorpayPayment();
                  }
                }}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Save to Inventory
              </button>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Payment Method</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod("aptos")}
                    className={`px-4 py-2 rounded-md border ${paymentMethod === "aptos" ? "bg-green-600 text-white" : "bg-white text-gray-700"}`}
                  >
                    APTOS
                  </button>
                  <button
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`px-4 py-2 rounded-md border ${paymentMethod === "razorpay" ? "bg-green-600 text-white" : "bg-white text-gray-700"}`}
                  >
                    Razorpay
                  </button>
                </div>
              </div>


              {saveStatus && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium text-center">{saveStatus}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-12 pb-8">
        <p className="text-gray-500">
          Powered by advanced AI technology to help reduce food waste and ensure optimal freshness.
        </p>
      </div>
    </div>
  );
};

export default FoodDetection;