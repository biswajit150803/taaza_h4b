import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
    const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-donations`, {
        headers: {
            token: token,
        },
    });
      setDonations(res.data.donations || []);
    } catch (err) {
      console.error("Failed to fetch donations:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4 max-h-80 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-green-700">Your Food Donations</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : donations.length === 0 ? (
        <p className="text-gray-500">No donations found.</p>
      ) : (
        <ul className="space-y-3">
          {donations.map((donation, i) => (
            <li key={i} className="border-b pb-2">
              <div className="font-semibold text-green-800">
                {donation.ngoId?.name || "NGO"}
              </div>
              <div className="text-sm text-gray-600">
                {donation.items.map((item, j) => (
                  <div key={j}>
                    • {item.name} — {item.quantity} {item.unit}
                  </div>
                ))}
                <div className="text-xs text-gray-500 mt-1">
                  📅 {new Date(donation.date).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
