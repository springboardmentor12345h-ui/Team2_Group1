import React from 'react';

const EventCard = ({ event }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-2xl transition-shadow">
    <div className="text-xs font-bold text-indigo-600 uppercase mb-2">{event.category}</div>
    <h3 className="text-xl font-bold mb-4">{event.title}</h3>
    <p className="text-gray-600 text-sm mb-6">{event.college}</p>
    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
      View Details
    </button>
  </div>
);

export default EventCard;