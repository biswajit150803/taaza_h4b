import React from 'react';

export default function ReminderCard() {
  return (
    <div className="w-full lg:w-1/3 bg-green-100 p-4 rounded-xl shadow flex items-center justify-center relative">
      <img src="/chef.png" alt="Reminder" className="w-24 h-24 mr-4" />
      <div>
        <h3 className="text-lg font-bold text-green-800">Don't waste food!</h3>
        <p className="text-sm text-green-700">Be conscious of your kitchen habits.</p>
      </div>
    </div>
  );
}
