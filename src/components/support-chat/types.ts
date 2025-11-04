export const SUPPORT_CHAT_URL = 'https://functions.poehali.dev/98c69bc9-5dec-4d0e-b5d8-8abc20d4db4d';

export interface Message {
  id: number;
  sender_type: 'user' | 'bot' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface Chat {
  id: number;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  admin_id?: number;
  admin_name?: string;
}
