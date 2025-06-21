import React from 'react';

const stats = [
  { label: 'Expiring Soon', value: '10', note: '+5% since yesterday', color: 'bg-lime-100', text: 'text-lime-700' },
  { label: 'Waste Prevented', value: '750 kg', note: '+3% since last week', color: 'bg-emerald-100', text: 'text-emerald-700' },
  { label: 'Impact', value: '1,200 kg', note: 'CO₂ emissions', color: 'bg-teal-100', text: 'text-teal-700' },
  { label: 'Money Saved', value: '₹10,000', note: '+5% than last month', color: 'bg-green-100', text: 'text-green-700' },
];

export default function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className={`rounded-xl p-4 ${s.color} shadow`}>
          <h3 className={`text-lg font-semibold ${s.text}`}>{s.label}</h3>
          <p className="text-2xl font-bold mt-1">{s.value}</p>
          <p className="text-sm text-gray-600 mt-1">{s.note}</p>
        </div>
      ))}
    </div>
  );
}
