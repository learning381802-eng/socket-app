// Mock users data for discovery
export interface User {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
  bio?: string
  status: 'online' | 'idle' | 'offline'
  joinedDate: string
  problemsSolved: number
  streak: number
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    displayName: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'Math enthusiast | Love solving calculus problems',
    status: 'online',
    joinedDate: 'January 2025',
    problemsSolved: 342,
    streak: 15,
  },
  {
    id: '2',
    displayName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    bio: 'CS student @ MIT | Algebra is my jam',
    status: 'online',
    joinedDate: 'February 2025',
    problemsSolved: 218,
    streak: 8,
  },
  {
    id: '3',
    displayName: 'Marcus Williams',
    email: 'marcus.w@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    bio: 'Learning math one problem at a time',
    status: 'idle',
    joinedDate: 'December 2024',
    problemsSolved: 567,
    streak: 23,
  },
  {
    id: '4',
    displayName: 'Emily Davis',
    email: 'emily.d@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    bio: 'Geometry lover | Teaching assistant',
    status: 'offline',
    joinedDate: 'March 2025',
    problemsSolved: 189,
    streak: 5,
  },
  {
    id: '5',
    displayName: 'James Wilson',
    email: 'james.w@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    bio: 'Competitive programmer | Math Olympiad participant',
    status: 'online',
    joinedDate: 'November 2024',
    problemsSolved: 891,
    streak: 45,
  },
  {
    id: '6',
    displayName: 'Olivia Brown',
    email: 'olivia.b@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
    bio: 'Physics major | Proofs are beautiful',
    status: 'idle',
    joinedDate: 'January 2025',
    problemsSolved: 423,
    streak: 12,
  },
  {
    id: '7',
    displayName: 'Daniel Lee',
    email: 'daniel.l@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel',
    bio: 'High school teacher | Making math fun',
    status: 'offline',
    joinedDate: 'October 2024',
    problemsSolved: 1205,
    streak: 67,
  },
  {
    id: '8',
    displayName: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    bio: 'Data science aspirant | Statistics nerd',
    status: 'online',
    joinedDate: 'February 2025',
    problemsSolved: 156,
    streak: 3,
  },
  {
    id: '9',
    displayName: 'Ryan Taylor',
    email: 'ryan.t@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
    bio: 'Engineering student | Calculus II survivor',
    status: 'online',
    joinedDate: 'December 2024',
    problemsSolved: 378,
    streak: 19,
  },
  {
    id: '10',
    displayName: 'Isabella Garcia',
    email: 'isabella.g@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella',
    bio: 'Math tutor | Helping others learn',
    status: 'idle',
    joinedDate: 'September 2024',
    problemsSolved: 756,
    streak: 34,
  },
  {
    id: '11',
    displayName: 'Nathan Anderson',
    email: 'nathan.a@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nathan',
    bio: 'Self-taught programmer | Math is everywhere',
    status: 'offline',
    joinedDate: 'January 2025',
    problemsSolved: 234,
    streak: 7,
  },
  {
    id: '12',
    displayName: 'Mia Thompson',
    email: 'mia.t@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
    bio: 'PhD candidate | Research in applied math',
    status: 'online',
    joinedDate: 'August 2024',
    problemsSolved: 1432,
    streak: 89,
  },
]

export const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  idle: '#f59e0b',
  offline: '#6b7280',
}
