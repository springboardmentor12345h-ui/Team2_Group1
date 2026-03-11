
export enum UserRole {
  STUDENT = 'student',
  COLLEGE_ADMIN = 'college_admin',
  SUPER_ADMIN = 'super_admin'
}

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  college: string;
  role: UserRole;
}

export interface Event {
  id: string;
  college_id: string;
  college_name: string;
  title: string;
  description: string;
  category: 'sports' | 'hackathon' | 'cultural' | 'workshop';
  location: string;
  start_date: string;
  end_date: string;
  created_at: string;
  imageUrl?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  timestamp: string;
  user_name?: string;
  event_title?: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comments: string;
  timestamp: string;
}

export interface AdminLog {
  id: string;
  action: string;
  user_id: string;
  timestamp: string;
}
