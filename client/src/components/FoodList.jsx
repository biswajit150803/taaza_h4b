import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const statusColors = {
  danger: 'bg-red-100 text-red-600',
  expired: 'bg-gray-200 text-gray-700',
  fresh: 'bg-green-100 text-green-700',
  good: 'bg-lime-100 text-lime-700',
};

export default function FoodList() {
  const { userData } = useContext(AppContext);
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const today = new Date();

    if (userData?.products?.length > 0) {
      const computedFoods = userData.products.map((item) => {
        const expiry = new Date(item.expiryDate);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let status = "fresh";
        if (expiry < today) {
          status = "expired";
        } else if (daysLeft <= 2) {
          status = "danger";
        } else if (daysLeft <= 5) {
          status = "good";
        }

        return {
          name: item.productName,
          date: expiry.toLocaleDateString(),
          status,
        };
      });

      setFoods(computedFoods);
    }
  }, [userData]);

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full lg:w-2/3">
      <h2 className="text-xl font-bold text-green-700 mb-4">Food Items</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-green-800">
            <th className="pb-2">Food</th>
            <th className="pb-2">Expiry Date</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((item, i) => (
            <tr key={i} className="border-t border-green-100">
              <td className="py-2 capitalize">{item.name}</td>
              <td className="py-2">{item.date}</td>
              <td className="py-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
