import Razorpay from "razorpay";

// Safely check if env vars are present
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay API keys are missing in environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid or missing amount." });
  }

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    console.log("🔧 Creating Razorpay order with:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

    res.status(200).json({ order });
  } catch (error) {
    console.error("❌ Razorpay error:", error?.message || error);
    res.status(500).json({ error: "Unable to create Razorpay order" });
  }
};
