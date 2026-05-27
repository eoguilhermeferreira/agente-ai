export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isLoading: boolean;
}

export interface WhatsappInstance {
  id: string;
  instanceName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'QR_CODE';
  qrCode?: string;
}

export interface Conversation {
  id: string;
  clientName?: string;
  clientPhone: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: string;
  aiEnabled: boolean;
  needsHuman?: boolean;
}

export interface Message {
  id: string;
  content: string;
  fromMe: boolean;
  type: string;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  totalConversations: number;
  openConversations: number;
  todayMessages: number;
  totalMessages: number;
  pendingConversations?: number;
}

export interface Settings {
  openaiKey?: string;
  openaiModel?: string;
  aiEnabled: boolean;
  autoReply: boolean;
  responseDelay: number;
  businessName?: string;
  businessHours?: string;
  businessAddress?: string;
  businessPhone?: string;
  systemPrompt?: string;
  products?: string;
  faq?: string;
  aiRules?: string;
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
}
