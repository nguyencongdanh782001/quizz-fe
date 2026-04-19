export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | null;
  avatarUrl?: string;
  createdAt: string;
}
