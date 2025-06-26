# H4B
## Problem Statement: Optimizing techniques to prevent wastage of food using Image Classification algorithms
# 🍏 taaza

taaza is a smart food freshness and donation platform that combines AI, Blockchain, and Civic Auth to fight food waste and drive social impact.

Users can:
- Scan fruits or vegetables to check freshness
- Get AI-generated recipes based on scanned food
- Donate edible items to NGOs or old-age homes
- Earn cryptocurrency-based micro-rewards via the Aptos blockchain

---

## 🚀 Features

- 🧠 Gemini AI Integration: Suggests recipes based solely on the scanned fruit or vegetable.
- 🍅 Freshness Detection:
  - Detects whether a food item is Fresh or Rotten
  - Displays a confidence percentage
  - Predicts expected expiry date
  - Built using CNN (Convolutional Neural Network) and a classification algorithm
- 🏥 NGO Recommendations:
  - Suggests NGOs, old-age homes, and charitable organizations
  - Locations visualized using the Leaflet Map API
- 🔐 Civic Auth:
  - Authenticates users and stores user data securely in the database
- ⛓️ Aptos Blockchain:
  - Every donation is logged on-chain
  - Users receive cryptocurrency-based rewards
- 💾 MongoDB:
  - Stores food item logs, user profiles, freshness predictions, and donation history

---

## 🛠️ Tech Stack

| Tech               | Role                                                         |
|--------------------|--------------------------------------------------------------|
| Civic Auth     | Decentralized authentication + user onboarding               |
| Aptos Blockchain| Donation logging + crypto reward issuance                   |
| Gemini AI API  | Recipe generation from scanned items                         |
| CNN Model      | Fresh/rotten classification and expiry prediction            |
| Leaflet Map API| Visual NGO/charity mapping                                   |             
| MongoDB Atlas  | NoSQL DB for food items, users, logs                         |
| Node.js / Express | Backend server and API                                    |
| React / React Native | Frontend (web/mobile interface)                        |

---

## 🧩 Architecture Overview

[ User App]
↓
[Civic Auth] ←→ [MongoDB Atlas]
↓
[Gemini AI] ←→ [AI Recipes]
↓
[CNN Model] ←→ [Freshness Prediction + Expiry]
↓
[Leaflet Map API] ←→ [NGO/Charity Location Display]
↓
[Aptos Smart Contract] ← Logs donation & issues reward

## 📦 How to Run Locally

1. Clone the repo  
   `bash
   git clone https://github.com/biswajit150803/taaza_h4b.git
   cd taaza
Install dependencies

bash
Copy
Edit
npm install
Set up .env file
Add your API keys and Mongo URI:

ini
Copy
Edit
GEMINI_API_KEY=your_gemini_key
CIVIC_APP_ID=your_civic_app_id
APTOS_PRIVATE_KEY=your_wallet_key
MONGODB_URI=your_mongo_uri
Run the server

bash
Copy
Edit
npm start
🔐 Authentication with Civic
Civic Auth is used for verifying user identity and managing login.

User data is securely saved in MongoDB after successful authentication.

Offers a decentralized, privacy-first login experience.

📚 Docs: https://www.civic.com

⛓️ Donations on Aptos
Donations are recorded immutably via smart contracts on Aptos

Users earn cryptocurrency rewards for each donation

Built using Move, Aptos’s smart contract language

📚 Docs: https://aptos.dev

🌐 AI with Gemini
Gemini is used to:

Analyze scanned food items

Generate recipe suggestions based on detected item name

📚 Docs: https://ai.google.dev/gemini

🧠 Food Freshness Prediction
Model: CNN (Convolutional Neural Network)

Output:

Freshness label: Fresh / Rotten

Confidence score (e.g., 92%)

Estimated expiry date

Classification powered by trained machine learning dataset of fruits/vegetables

📍 NGO and Charity Mapping
Map rendered using Leaflet.js

Locations of nearby NGOs, food banks, and old-age homes

Integrated with app via geolocation and donation preferences

📚 Docs: https://leafletjs.com

📊 MongoDB Schema Overview
json
Copy
Edit
User {
  _id: ObjectId,
  civic_id: String,
  name: String,
  donations: [Donation],
  food_items: [FoodItem]
}

FoodItem {
  name: String,
  freshness: "Fresh" | "Rotten",
  confidence: Number,
  expiry_estimate: Date,
  scanned_on: Date
}

Donation {
  org_name: String,
  location: String,
  date: Date,
  items_donated: [String],
  tx_hash: String
}
🌱 Future Scope
Real-time expiry tracking via fridge IoT integration

Expand CNN model to include meats/dairy

Gamify rewards and build donor leaderboard

Auto-schedule donation pickups with NGOs

🤝 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss.

📜 License
MIT License © 2025 taaza Team