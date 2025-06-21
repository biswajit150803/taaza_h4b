import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    productImage: { type: String, required: true },  // Cloudinary link
    recipes: [{ type: String }] ,// Optional by default
    freshness: { type: String, enum: ['Fresh', 'Rotten', 'Unknown'], default: 'Unknown' },
    confidence: { type: String }, // Confidence percentage from ML model
    dateAdded: { type: Date, default: Date.now },
    isExpired: { 
        type: Boolean, 
        default: function() {
            return this.expiryDate < new Date();
        }
    },
    transactionHash: { type: String },
}, { timestamps: true }, // Automatically adds createdAt and updatedAt fields
{ _id: false });

const donationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ["kg", "g", "pieces", "liters"], default: "kg" },
}, { _id: false });

const donationSchema = new mongoose.Schema({
  ngoId: { type: Number, required: true },
  items: [donationItemSchema],
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  rewardTransactionHash: { type: String }, // ✅ NEW
}, { _id: false });

const savedRecipeSchema = new mongoose.Schema({
  title: String,
  content: String,
  time: String,
  video: String,
  ingredients: [String],
  savedAt: { type: Date, default: Date.now }
},);

const userSchema = new mongoose.Schema({
  civicId: { type: String, required: true, unique: true }, // From Civic token
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String }, // profile picture from Civic
  products: [productSchema],
  donations: [donationSchema],
  savedRecipes: [savedRecipeSchema]
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;