export interface FAQ {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
  is_active: boolean;
}

export interface ChatMessage {
  id: number;
  sender_type: 'user' | 'bot' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatItem {
  id: number;
  user_id: number;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  admin_id?: number;
  admin_name?: string;
  user_phone?: string;
  user_name?: string;
  unread_count: number;
  is_guest?: boolean;
  guest_id?: string;
}

export interface ArchivedChat {
  id: number;
  chat_id: number;
  user_name: string;
  user_phone?: string;
  admin_name?: string;
  closed_at: string;
  messages_json: string;
}

export const SUPPORT_CHAT_URL = 'https://functions.poehali.dev/98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d';
