
import { User, UserRole } from '../types';

const USERS_KEY = 'campus_event_hub_users';
const CURRENT_USER_KEY = 'campus_event_hub_active';

export const mockAuthService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Super Admin', email: 'admin@ceh.com', password: 'password123', college: 'Central Authority', role: UserRole.SUPER_ADMIN },
      { id: '2', name: 'John Doe', email: 'john@uni.edu', password: 'password123', college: 'Tech University', role: UserRole.STUDENT },
      { id: '3', name: 'Sarah Wilson', email: 'sarah@arts.edu', password: 'password123', college: 'Arts College', role: UserRole.COLLEGE_ADMIN },
    ];
  },

  register: (userData: Partial<User>): User => {
    const users = mockAuthService.getUsers();
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: userData.role || UserRole.STUDENT
    } as User;
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, pass: string): User | null => {
    const users = mockAuthService.getUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }
};
