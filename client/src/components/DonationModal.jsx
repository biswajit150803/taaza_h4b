import React, { useContext } from "react";
import axios from "axios";
import { useWallet } from "../context/WalletContext";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const DonationModal = ({
  isModalOpen,
  selectedNGO,
  donationDetails,
  setDonationDetails,
  setIsModalOpen,
}) => {
  if (!isModalOpen) return null;

  const { walletAddress, connectWallet } = useWallet();
  const {idToken,userData} = useContext(AppContext);

   const inventoryItems = userData?.products || [];

  const ensureWalletConnection = async () => {
    if (!walletAddress) {
      const newAddress = await connectWallet();
      return newAddress;
    }
    return walletAddress;
  };

  const handleAddItem = () => {
    setDonationDetails((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "", unit: "kg" }],
    }));
  };

  const handleRemoveLastItem = () => {
    setDonationDetails((prev) => {
      const updated = [...prev.items];
      updated.pop();
      return { ...prev, items: updated };
    });
  };

  const handleItemChange = (index, field, value) => {
    setDonationDetails((prev) => {
      const updated = [...prev.items];
      updated[index][field] = value;
      return { ...prev, items: updated };
    });
  };

  const handleDateChange = (e) => {
    setDonationDetails((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  const handleDonationSubmit = async () => {
  try {

    const address = await ensureWalletConnection();
    if (!address) {
      toast.error("Please connect your Petra wallet to receive the reward.");
      return;
    }

    const payload = {
      ngoId: selectedNGO.id,
      items: donationDetails.items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
      })),
      date: new Date(donationDetails.date),
      walletAddress: address,
    };

    console.log("Final wallet address used:", address);

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/donate`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          token:idToken,
        },
      }
    );

    const rewardTxn = response.data?.rewardTransactionHash;

    toast.success(
      `Donation successful! ${
        rewardTxn && rewardTxn !== "Reward not sent"
          ? `0.01 APT sent`
          : `But reward transaction failed.`
      }`
    );

    setIsModalOpen(false);
  } catch (err) {
    console.error("Donation error:", err.response?.data || err.message);
    toast.error("Failed to submit donation.");
  }
};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm bg-white/30"
        onClick={() => setIsModalOpen(false)}
      ></div>

      <div className="relative z-10 bg-white rounded-xl shadow-2xl p-6 w-80 md:w-[32rem] max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
          Donate to {selectedNGO?.name}
        </h3>

        <div className="space-y-4">
          {donationDetails.items.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-600">Item</label>
                <select
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select an item</option>
                  {inventoryItems.map((product, idx) => (
                    <option key={idx} value={product.productName}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="pieces">pieces</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleAddItem}
              className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
            >
              + Add More
            </button>
            {donationDetails.items.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveLastItem}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                - Remove Last
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600">Donation Date</label>
            <input
              type="date"
              value={donationDetails.date}
              onChange={handleDateChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {inventoryItems.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                No items in your inventory. Please add items to your inventory first.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDonationSubmit}
            disabled={inventoryItems.length === 0}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

