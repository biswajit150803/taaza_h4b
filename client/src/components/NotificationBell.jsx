import React, { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../context/AppContext";
import { Bell, X, AlertTriangle, Calendar, Package } from "lucide-react";

const NotificationBell = () => {
  const { userData } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!userData || !userData.products) return;

    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const expiringSoon = userData.products.filter((product) => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate > today && expiryDate <= threeDaysLater;
    });

    const formatted = expiringSoon.map((item) => {
      const expiryDate = new Date(item.expiryDate);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        name: item.productName,
        expiryDate: expiryDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        daysLeft: daysLeft,
        image: item.productImage || "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
        urgency: daysLeft <= 1 ? 'critical' : daysLeft <= 2 ? 'warning' : 'notice'
      };
    });

    // Sort by urgency (most urgent first)
    formatted.sort((a, b) => a.daysLeft - b.daysLeft);
    setNotifications(formatted);
  }, [userData]);

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          accent: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          accent: 'bg-yellow-500'
        };
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer" 
        onClick={() => setModalOpen(true)}
      >
        <Bell className="text-gray-700 w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Modal Overlay - Using Portal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-white/30"
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="relative z-10 bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all border border-gray-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Expiring Soon</h2>
                  <p className="text-white/90 text-sm">
                    {notifications.length} item{notifications.length !== 1 ? 's' : ''} need{notifications.length === 1 ? 's' : ''} your attention
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">All Good!</h3>
                  <p className="text-gray-600">No items are expiring in the next 3 days 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((item, i) => {
                    const styles = getUrgencyStyles(item.urgency);
                    return (
                      <div
                        key={i}
                        className={`${styles.bg} ${styles.border} border-2 rounded-xl p-4 hover:shadow-md transition-all duration-200`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.src = "https://cdn-icons-png.flaticon.com/512/1046/1046784.png";
                              }}
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-grow">
                            <h4 className={`font-semibold text-lg ${styles.text} mb-1`}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Expires: {item.expiryDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Urgency Badge */}
                          <div className="flex-shrink-0">
                            <div className={`${styles.accent} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                              {item.daysLeft === 1 ? '1 day left' : 
                               item.daysLeft === 0 ? 'Expires today' : 
                               `${item.daysLeft} days left`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  💡 Consider using these items soon or donating them to nearby centers
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;