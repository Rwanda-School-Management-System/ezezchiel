import fs from 'fs';
import path from 'path';
import {
  User,
  InvestmentTier,
  ProductPurchase,
  Task,
  TaskSubmission,
  ShortVideo,
  VideoViewRecord,
  Survey,
  SurveySubmission,
  WithdrawalRequest,
  Transaction,
  BroadcastNotification,
  ChatMessage,
  AdminAuditLog,
  PlatformSettings
} from '../src/types';
import {
  INITIAL_TIERS,
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_BROADCASTS,
  INITIAL_CHATS
} from '../src/data/mockData';

export interface DatabaseSchema {
  users: User[];
  products: InvestmentTier[];
  productPurchases: ProductPurchase[];
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  shortVideos: ShortVideo[];
  videoViews: VideoViewRecord[];
  surveys: Survey[];
  surveySubmissions: SurveySubmission[];
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  notifications: BroadcastNotification[];
  messages: ChatMessage[];
  auditLogs: AdminAuditLog[];
  platformSettings: PlatformSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_SHORT_VIDEOS: ShortVideo[] = [
  {
    id: 'vid-1',
    title: 'Digital Entrepreneurship & Online Jobs in Rwanda',
    description: 'Learn how young creators and freelancers in Rwanda are making daily income using technology and smartphones.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-43527-large.mp4',
    durationSeconds: 15,
    reward: 150,
    category: 'Business',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid-2',
    title: 'Mobile Money Security Tips: Protect Your Secret PIN',
    description: 'Essential rules for safeguarding your Mobile Money account and avoiding fraudulent calls or fake SMS messages.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-typing-on-a-laptop-at-home-43524-large.mp4',
    durationSeconds: 20,
    reward: 200,
    category: 'Security',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid-3',
    title: 'How Daily Profit Products Work: Simple Guide',
    description: 'A quick visual walkthrough of buying a product and receiving daily earnings directly into your wallet balance.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-portrait-of-a-woman-in-a-business-suit-43306-large.mp4',
    durationSeconds: 15,
    reward: 180,
    category: 'Earnings',
    isPublished: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'surv-1',
    title: 'Youth Smartphone & Online Work Survey',
    description: 'Answer 3 quick questions about your internet and Mobile Money usage to earn 300 RWF instantly.',
    reward: 300,
    estimatedMinutes: 2,
    isPublished: true,
    completedCount: 38,
    maxCompletions: 200,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'Which Mobile Money service do you use most often in Rwanda?',
        options: ['MTN Mobile Money (*182#)', 'Airtel Money (*182#)', 'I use both MTN and Airtel regularly'],
        required: true
      },
      {
        id: 'q2',
        question: 'What time of day do you prefer doing quick online tasks?',
        options: ['Morning (8:00 AM - 12:00 PM)', 'Afternoon (1:00 PM - 5:00 PM)', 'Evening & Night (6:00 PM onwards)'],
        required: true
      },
      {
        id: 'q3',
        question: 'Have you ever purchased a daily profit earning product before?',
        options: ['Yes, multiple times', 'Yes, this is my first time', 'No, but I am excited to start today'],
        required: true
      }
    ]
  },
  {
    id: 'surv-2',
    title: 'Marketplace Earning Preferences Survey',
    description: 'Help us learn what types of tasks you enjoy doing most so we can bring higher paying opportunities.',
    reward: 250,
    estimatedMinutes: 2,
    isPublished: true,
    completedCount: 64,
    maxCompletions: 150,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'sq1',
        question: 'Which micro-task type is your favorite to complete?',
        options: ['YouTube Subscribe & Video Watch', 'Watching 15-second Short Videos', 'Answering 2-minute Surveys', 'Liking and commenting on posts'],
        required: true
      },
      {
        id: 'sq2',
        question: 'What is your preferred withdrawal telecom provider?',
        options: ['MTN Mobile Money (078/079)', 'Airtel Money (072/073)', 'Either one is great'],
        required: true
      }
    ]
  }
];

const INITIAL_SETTINGS: PlatformSettings = {
  minWithdrawal: 5000,
  withdrawalFeePercent: 30,
  registrationBonus: 2500,
  requireProductForBonusWithdrawal: true,
  depositUssdMtn: '*182*1*2*0738514596*AMOUNT#',
  depositUssdTigo: '*182*1*1*0738514596*AMOUNT#',
  taskPaymentUssd: '*182*8*1*1880554*AMOUNT#'
};

class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, initializing with fresh schema:', e);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS.map(u => ({
        ...u,
        pendingBalance: 0,
        totalDeposited: u.hasBoughtProduct ? 10000 : 0,
        totalInvested: u.hasBoughtProduct ? 10000 : 0
      })),
      products: INITIAL_TIERS.map(t => ({ ...t, isActive: true })),
      productPurchases: [
        {
          id: 'pur-1',
          userId: 'user-demo-1',
          userName: 'Mugisha Patrick',
          userPhone: '0789456123',
          tierAmount: 10000,
          paymentMethod: 'MTN',
          ussdCode: '*182*1*2*0738514596*10000#',
          senderPhone: '0789456123',
          transactionId: 'MP260216091512',
          screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
          status: 'approved',
          dailyProfitAmount: 750,
          createdAt: '2026-02-16T09:15:00.000Z',
          approvedAt: '2026-02-16T09:30:00.000Z',
          lastProfitClaimedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          totalProfitEarned: 3750
        }
      ],
      tasks: INITIAL_TASKS,
      taskSubmissions: [
        {
          id: 'sub-sample-1',
          taskId: 'task-yt-1',
          taskTitle: 'Subscribe to Ishema News YouTube Channel',
          taskType: 'youtube_subscribe',
          userId: 'user-demo-1',
          userName: 'Mugisha Patrick',
          userPhone: '0789456123',
          reward: 250,
          proofPhotoUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
          notes: 'Subscribed to channel and turned on notifications bell.',
          status: 'approved',
          submittedAt: '2026-02-18T14:00:00.000Z',
          reviewedAt: '2026-02-18T14:30:00.000Z'
        }
      ],
      shortVideos: INITIAL_SHORT_VIDEOS,
      videoViews: [],
      surveys: INITIAL_SURVEYS,
      surveySubmissions: [],
      withdrawals: [
        {
          id: 'wd-1',
          userId: 'user-demo-1',
          userName: 'Mugisha Patrick',
          userPhone: '0789456123',
          amount: 9500,
          fee: 2850,
          netAmount: 6650,
          method: 'MTN',
          recipientPhone: '0789456123',
          recipientName: 'Mugisha Patrick',
          status: 'approved',
          createdAt: '2026-02-25T15:30:00.000Z',
          reviewedAt: '2026-02-25T16:00:00.000Z'
        }
      ],
      transactions: INITIAL_TRANSACTIONS,
      notifications: INITIAL_BROADCASTS,
      messages: INITIAL_CHATS,
      auditLogs: [
        {
          id: 'log-1',
          adminId: 'user-admin-1',
          adminName: 'Uwimana Jean Claude (Admin)',
          action: 'SYSTEM_BOOT',
          details: 'Umurimo Rwanda Enterprise Database System initialized successfully.',
          timestamp: new Date().toISOString()
        }
      ],
      platformSettings: INITIAL_SETTINGS
    };

    this.persistSync(initialData);
    return initialData;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  public save() {
    this.persistSync(this.data);
  }

  // --- QUERY ACCESSORS ---
  public get users() { return this.data.users; }
  public get products() { return this.data.products; }
  public get productPurchases() { return this.data.productPurchases; }
  public get tasks() { return this.data.tasks; }
  public get taskSubmissions() { return this.data.taskSubmissions; }
  public get shortVideos() { return this.data.shortVideos; }
  public get videoViews() { return this.data.videoViews; }
  public get surveys() { return this.data.surveys; }
  public get surveySubmissions() { return this.data.surveySubmissions; }
  public get withdrawals() { return this.data.withdrawals; }
  public get transactions() { return this.data.transactions; }
  public get notifications() { return this.data.notifications; }
  public get messages() { return this.data.messages; }
  public get auditLogs() { return this.data.auditLogs; }
  public get platformSettings() { return this.data.platformSettings; }

  // Record immutable transaction
  public recordTransaction(tx: Omit<Transaction, 'id' | 'date'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      date: new Date().toISOString()
    };
    this.data.transactions.unshift(newTx);
    this.save();
    return newTx;
  }

  // Record audit log
  public logAudit(adminId: string, adminName: string, action: string, details: string, targetUserId?: string) {
    const entry: AdminAuditLog = {
      id: 'audit-' + Date.now(),
      adminId,
      adminName,
      action,
      details,
      targetUserId,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    this.save();
  }

  // Create notification
  public createNotification(data: Omit<BroadcastNotification, 'id' | 'createdAt'>): BroadcastNotification {
    const notif: BroadcastNotification = {
      ...data,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      read: false
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }
}

export const db = new RelationalDatabase();
