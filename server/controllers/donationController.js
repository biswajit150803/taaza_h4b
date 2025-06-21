import userModel from "../models/userModel.js";
import { sendRewardToUser } from "../utils/aptosRewardUtils.js";
import jwt from "jsonwebtoken";
export const submitDonation = async (req, res) => {
  try {
    const { ngoId, items, date, walletAddress } = req.body;
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    // Find user by Civic ID (sub from token)
    const user = await userModel.findOne({ civicId: decoded.sub })

    if (!token || !ngoId || !items || !Array.isArray(items) || items.length === 0 || !date || !walletAddress) {
      return res.status(400).json({ message: "Missing required donation data" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // Send APT reward and get transaction hash
    let txHash = null;
    try {
      txHash = await sendRewardToUser(walletAddress);
    } catch (e) {
      console.error("⚠️ Reward transfer failed but donation will be saved.");
    }

    const newDonation = {
      ngoId,
      items,
      date: new Date(date),
      createdAt: new Date(),
      rewardTransactionHash: txHash || null, // ✅ Save in DB
    };

    user.donations.push(newDonation);
    await user.save();

    res.status(201).json({
      message: "Donation successfully submitted",
      donation: newDonation,
      rewardTransactionHash: txHash || "Reward not sent",
    });
  } catch (error) {
    console.error("Donation submission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//fetch donations controller
export const getUserDonations = async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.decode(token);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.sub) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    // Find user by Civic ID (sub from token)
    const user = await userModel.findOne({ civicId: decoded.sub }).select("donations");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedDonations = [...user.donations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ donations: sortedDonations });
  } catch (error) {
    console.error("Fetch donations error:", error);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};
