
import { Event, Registration, RegistrationStatus, Feedback, AdminLog } from '../types';

const EVENTS_KEY = 'ceh_events';
const REGS_KEY = 'ceh_registrations';
const FEEDBACK_KEY = 'ceh_feedback';

export const mockEventService = {
  getEvents: (): Event[] => {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [
      {
        id: 'e1',
        college_id: '3',
        college_name: 'Tech University',
        title: 'Inter-College Hackathon 2024',
        description: 'A 48-hour coding marathon bringing together the brightest minds from various colleges to solve real-world problems.',
        category: 'hackathon',
        location: 'Tech University Main Campus',
        start_date: '2024-02-15T09:00:00',
        end_date: '2024-02-17T17:00:00',
        created_at: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/hack/800/400'
      },
      {
        id: 'e2',
        college_id: '3',
        college_name: 'Arts College',
        title: 'Cultural Fest - Harmony 2024',
        description: 'Celebrate diversity and creativity through music, dance, drama, and art performances from colleges across the region.',
        category: 'cultural',
        location: 'City Cultural Center',
        start_date: '2024-02-20T10:00:00',
        end_date: '2024-02-22T22:00:00',
        created_at: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/dance/800/400'
      },
      {
        id: 'e3',
        college_id: '4',
        college_name: 'Sports Academy',
        title: 'Basketball Championship',
        description: 'Annual inter-college basketball tournament featuring teams from 16 colleges competing for the championship title.',
        category: 'sports',
        location: 'Sports Arena',
        start_date: '2024-02-10T08:00:00',
        end_date: '2024-02-12T18:00:00',
        created_at: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/sports/800/400'
      }
    ];
  },

  getEventById: (id: string): Event | undefined => {
    return mockEventService.getEvents().find(e => e.id === id);
  },

  createEvent: (eventData: Partial<Event>): Event => {
    const events = mockEventService.getEvents();
    const newEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    } as Event;
    events.push(newEvent);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  },

  getRegistrations: (): Registration[] => {
    const data = localStorage.getItem(REGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  registerForEvent: (eventId: string, userId: string): Registration => {
    const regs = mockEventService.getRegistrations();
    const existing = regs.find(r => r.event_id === eventId && r.user_id === userId);
    if (existing) return existing;

    const newReg: Registration = {
      id: Math.random().toString(36).substr(2, 9),
      event_id: eventId,
      user_id: userId,
      status: RegistrationStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    regs.push(newReg);
    localStorage.setItem(REGS_KEY, JSON.stringify(regs));
    return newReg;
  },

  updateRegistrationStatus: (regId: string, status: RegistrationStatus) => {
    const regs = mockEventService.getRegistrations();
    const index = regs.findIndex(r => r.id === regId);
    if (index > -1) {
      regs[index].status = status;
      localStorage.setItem(REGS_KEY, JSON.stringify(regs));
    }
  },

  getFeedback: (eventId: string): Feedback[] => {
    const data = localStorage.getItem(FEEDBACK_KEY);
    const allFeedback: Feedback[] = data ? JSON.parse(data) : [];
    return allFeedback.filter(f => f.event_id === eventId);
  },

  addFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp'>) => {
    const data = localStorage.getItem(FEEDBACK_KEY);
    const allFeedback: Feedback[] = data ? JSON.parse(data) : [];
    const newFeedback: Feedback = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    allFeedback.push(newFeedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  }
};
