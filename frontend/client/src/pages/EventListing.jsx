import React, { useState } from 'react';
import EventCard from '../components/EventCard';

const EventListing = () => {
  const [events] = useState([
    { id: 1, title: 'Hackathon 2024', category: 'Hackathon', college: 'QIS College' },
    { id: 2, title: 'Sports Meet', category: 'Sports', college: 'JNTU' }
  ]);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Upcoming Inter-College Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventListing;