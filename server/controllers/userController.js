import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from 'jsonwebtoken';

const getExpiredProducts = (products) =>
  products.filter(p => new Date(p.expiryDate) < new Date());

const getExpiringSoonProducts = (products) =>
  products.filter(p => {
    const now = new Date();
    const expiry = new Date(p.expiryDate);
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  });

const getFreshProducts = (products) =>
  products.filter(p => new Date(p.expiryDate) > new Date() && p.freshness === "Fresh");


const saveScannedProd = async (req, res) => {
  try {
    // Get and decode the token properly
    const token = req.headers.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Decode the JWT token to get user info
    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    // Find user by civicId
    const user = await userModel.findOne({ civicId: decoded.sub });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { productName, expiryDate, productImage, freshness, confidence, transactionHash } = req.body;

    if (!productName || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Product name and expiry date are required" 
      });
    }

    let imageUrl = productImage;

    // Upload to Cloudinary if it's a base64 image
    if (productImage && productImage.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(productImage, {
          folder: "food-inventory",
          transformation: [
            { width: 400, height: 400, crop: "fill" }, 
            { quality: "auto" }
          ]
        });
        imageUrl = uploadRes.secure_url;
        console.log("✅ Image uploaded to Cloudinary:", imageUrl);
      } catch (uploadError) {
        console.warn("⚠️ Cloudinary upload failed:", uploadError.message);
      }
    }

    // Create new product object matching your schema
    const newProduct = {
      productName: productName.toLowerCase(),
      productImage: imageUrl || "https://via.placeholder.com/400",
      expiryDate: new Date(expiryDate),
      isExpired: new Date(expiryDate) < new Date(), 
      addedDate: new Date(),
      freshness: freshness || "Unknown",
      confidence: confidence || "N/A",
      transactionHash: transactionHash || null,
    };

    // Add product to user's products array
    user.products.push(newProduct);
    await user.save();

    console.log("✅ Product saved successfully for user:", user.civicId);

    res.status(200).json({
      success: true,
      message: "Product saved successfully",
      product: newProduct
    });

  } catch (error) {
    console.error("❌ Error saving product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save product",
      error: error.message 
    });
  }
};

// 📊 Get all products, optionally filtered
const getUserProducts = async (req, res) => {
  try {
    const token = req.headers.token;
     const { filter } = req.query;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Decode the JWT token to get user info
    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    // Find user by civicId
    const user = await userModel.findOne({ civicId: decoded.sub });
  

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let products = user.products || [];

    switch (filter) {
      case "expired":
        products = getExpiredProducts(products);
        break;
      case "expiring":
        products = getExpiringSoonProducts(products);
        break;
      case "fresh":
        products = getFreshProducts(products);
        break;
    }

    products.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    res.status(200).json({
      success: true,
      products,
      summary: {
        total: user.products.length,
        expired: getExpiredProducts(user.products).length,
        expiring: getExpiringSoonProducts(user.products).length,
        fresh: getFreshProducts(user.products).length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

export { saveScannedProd, getUserProducts };
