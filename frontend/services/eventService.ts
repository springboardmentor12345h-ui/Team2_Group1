
import { Event, Registration, RegistrationStatus, Feedback } from '../types';

const API_BASE = 'http://localhost:5000/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
};

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const data = await handleResponse(res);
      return data.map((e: any) => ({ ...e, id: e._id }));
    } catch (err) {
      console.error('Event fetch failed:', err);
      throw err;
    }
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    const events = await eventService.getEvents();
    return events.find(e => e.id === id);
  },

  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const data = await handleResponse(res);
    return { ...data, id: data._id };
  },

  getRegistrations: async (userId?: string): Promise<Registration[]> => {
    const url = userId ? `${API_BASE}/registrations/${userId}` : `${API_BASE}/registrations`;
    const res = await fetch(url);
    const data = await handleResponse(res);
    return data.map((r: any) => ({ ...r, id: r._id }));
  },

  registerForEvent: async (eventId: string, userId: string): Promise<Registration> => {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, user_id: userId })
    });
    const data = await handleResponse(res);
    return { ...data, id: data._id };
  },

  updateRegistrationStatus: async (regId: string, status: RegistrationStatus) => {
    // Note: For a real production app, you'd add a PATCH /api/registrations/:id endpoint.
    console.log(`Update ${regId} status locally to ${status}`);
  },

  getFeedback: async (eventId: string): Promise<Feedback[]> => {
    return []; // Future enhancement
  },

  addFeedback: async (feedback: Omit<Feedback, 'id' | 'timestamp'>) => {
    console.log('Feedback tracking:', feedback);
  }
};
