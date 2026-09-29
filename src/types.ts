export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string; // Location / Akarere
  birthDate: string; // Date of birth
  avatar: string;
  role: UserRole;
  isBlocked: boolean;
  balance: number; // Available withdrawable balance (RWF)
  pendingBalance?: number; // Reserved or pending approval balance
  registrationBonus: number; // 2,500 RWF bonus
  hasBoughtProduct: boolean; // Required to unlock bonus withdrawal
  totalEarned: number;
  totalDeposited?: number;
  totalInvested?: number;
  totalWithdrawn: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface InvestmentTier {
  id: string;
  tierAmount: number; // 5000, 10000, 15000, 20000, 30000, 40000, 50000
  title: string;
  dailyProfit: number;
  durationDays: number;
  totalReturnPercent: number;
  description: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductPurchase {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  tierAmount: number;
  paymentMethod: 'MTN' | 'AIRTEL_TIGO';
  ussdCode: string;
  senderPhone: string;
  transactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  dailyProfitAmount: number;
  createdAt: string;
  approvedAt?: string;
  lastProfitClaimedAt?: string;
  totalProfitEarned: number;
  expiresAt?: string;
}

export type TaskType = 'youtube_subscribe' | 'youtube_watch' | 'short_video' | 'survey' | 'general';

export interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  type: TaskType;
  description: string;
  instructions: string[];
  targetUrl: string;
  rewardPerTask: number; // RWF per completion
  totalBudget: number;
  totalSlots: number;
  completedSlots: number;
  requiresProof: boolean;
  proofRequirementText?: string;
  paymentUssd: string; // *182*8*1*1880554*amount#
  paymentProofUrl?: string;
  transactionId?: string;
  status: 'pending_payment' | 'published' | 'unpublished';
  createdAt: string;
  deadline?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  userId: string;
  userName: string;
  userPhone: string;
  reward: number;
  proofPhotoUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ShortVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
  reward: number;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

export interface VideoViewRecord {
  id: string;
  videoId: string;
  userId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  viewedAt: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  reward: number;
  estimatedMinutes: number;
  questions: SurveyQuestion[];
  isPublished: boolean;
  completedCount: number;
  maxCompletions?: number;
  createdAt: string;
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  surveyTitle: string;
  userId: string;
  userName: string;
  reward: number;
  answers: Record<string, string>;
  status: 'approved' | 'rejected' | 'pending';
  submittedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number; // Min 5,000 Frw
  fee: number; // 30% fee
  netAmount: number; // 70% to receive
  method: 'MTN' | 'AIRTEL_TIGO';
  recipientPhone: string; // 078/079 for MTN, 072/073 for Airtel/Tigo
  recipientName: string; // Registered full name on MoMo
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type TransactionType =
  | 'bonus'
  | 'deposit_product'
  | 'daily_profit'
  | 'task_earning'
  | 'video_earning'
  | 'survey_earning'
  | 'withdrawal'
  | 'withdrawal_fee'
  | 'withdrawal_refund'
  | 'task_creation';

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: TransactionType;
  amount: number;
  direction: 'in' | 'out'; // 'in' = credits, 'out' = debits
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  notes?: string;
  date: string;
  relatedEntityId?: string;
}

export interface BroadcastNotification {
  id: string;
  senderName: string;
  title: string;
  message: string;
  createdAt: string;
  type: 'broadcast' | 'system' | 'withdrawal' | 'task' | 'alert' | 'success' | 'info';
  targetUserId?: string; // 'ALL' or specific userId
  read?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string; // 'admin' or specific userId
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  targetUserId?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PlatformSettings {
  minWithdrawal: number;
  withdrawalFeePercent: number;
  registrationBonus: number;
  requireProductForBonusWithdrawal: boolean;
  depositUssdMtn: string;
  depositUssdTigo: string;
  taskPaymentUssd: string;
}
