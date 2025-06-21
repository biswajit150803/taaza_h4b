import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useWallet } from "../context/WalletContext";
import {
  User,
  Wallet,
  Package,
  Heart,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Gift,
  Award,
  Clock,
} from "lucide-react";
import WalletConnect from "../components/WalletConnect";

const ProfilePage = () => {
  const { userData, idToken } = useContext(AppContext);
  const { walletAddress } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [stats, setStats] = useState({
    totalDonations: 0,
    itemsDonated: 0,
    rewardsEarned: 0,
    inventoryItems: 0,
  });

  useEffect(() => {
    if (userData) {
      setEditForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });

      // Calculate stats
      const inventoryCount = userData.products?.length || 0;
      const donationHistory = userData.donations || [];
      const totalDonations = donationHistory.length;
      const itemsDonated = donationHistory.reduce(
        (sum, donation) => sum + (donation.items?.length || 0),
        0
      );

      setStats({
        totalDonations,
        itemsDonated,
        rewardsEarned: totalDonations * 0.01, // Assuming 0.01 APT per donation
        inventoryItems: inventoryCount,
      });
    }
  }, [userData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    }
  };

  const handleSave = async () => {
    // Here you would typically make an API call to update user data
    console.log("Saving profile:", editForm);
    // For now, just toggle edit mode
    setIsEditing(false);
    // You can add actual save logic here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0)
      return { status: "expired", color: "text-red-600", bg: "bg-red-50" };
    if (daysLeft <= 3)
      return {
        status: "expiring",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    return { status: "fresh", color: "text-green-600", bg: "bg-green-50" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData?.name || "User Profile"}
                </h1>
                <p className="text-gray-600 mb-2">
                  Member since {formatDate(userData?.createdAt || new Date())}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <WalletConnect />
                  {/* <Wallet className="w-4 h-4" /> 
                   <span className="font-mono">
                    {walletAddress
                      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(
                          -4
                        )}`
                      : "Not connected"}
                  </span> */}
                </div>
              </div>
            </div>

            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalDonations}
                </p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Items Donated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.itemsDonated}
                </p>
              </div>
              <Gift className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rewards Earned</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.rewardsEarned} APT
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inventory Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.inventoryItems}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Information
              </h2>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {userData?.name || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {userData?.email || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {editForm.phone || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {editForm.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Inventory */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Current Inventory
            </h2>

            {userData?.products?.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.products.map((product, index) => {
                  const expiryInfo = getExpiryStatus(product.expiryDate);
                  return (
                    <div
                      key={index}
                      className={`${expiryInfo.bg} border border-gray-200 rounded-lg p-4`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.productImage ||
                            "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                          }
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://cdn-icons-png.flaticon.com/512/1046/1046784.png";
                          }}
                        />
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900">
                            {product.productName}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Qty: {product.quantity}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(product.expiryDate)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${expiryInfo.color} bg-white`}
                        >
                          {expiryInfo.status === "expired"
                            ? "Expired"
                            : expiryInfo.status === "expiring"
                            ? "Expiring Soon"
                            : "Fresh"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Items in Inventory
                </h3>
                <p className="text-gray-500">
                  Start adding items to track your food inventory!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Donation History */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Donation History
          </h2>

          {userData?.donations?.length > 0 ? (
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-4 pr-2">
                {userData.donations.slice(0, 5).map((donation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {donation.ngoName}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(donation.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {donation.items?.length || 0} items donated
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          +0.01 APT
                        </p>
                      </div>
                    </div>

                    {donation.items && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {donation.items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {item.name} ({item.quantity} {item.unit})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Donations Yet
              </h3>
              <p className="text-gray-500">
                Start donating to make a difference in your community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
