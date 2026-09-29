import { InvestmentTier, Task, User, Transaction, BroadcastNotification, ChatMessage } from '../types';

export const INITIAL_TIERS: InvestmentTier[] = [
  {
    id: 'tier-5000',
    tierAmount: 5000,
    title: 'Tier 1 Starter Product',
    dailyProfit: 350,
    durationDays: 30,
    totalReturnPercent: 210,
    description: 'Earn 350 RWF every day for 30 days. Initial price: 5,000 RWF.'
  },
  {
    id: 'tier-10000',
    tierAmount: 10000,
    title: 'Tier 2 Bronze Product',
    dailyProfit: 750,
    durationDays: 30,
    totalReturnPercent: 225,
    description: 'Earn 750 RWF every day for 30 days. Initial price: 10,000 RWF.'
  },
  {
    id: 'tier-15000',
    tierAmount: 15000,
    title: 'Tier 3 Silver Product',
    dailyProfit: 1200,
    durationDays: 30,
    totalReturnPercent: 240,
    description: 'Earn 1,200 RWF every day for 30 days. Initial price: 15,000 RWF.'
  },
  {
    id: 'tier-20000',
    tierAmount: 20000,
    title: 'Tier 4 Gold Product',
    dailyProfit: 1650,
    durationDays: 30,
    totalReturnPercent: 248,
    description: 'Earn 1,650 RWF every day for 30 days. Initial price: 20,000 RWF.'
  },
  {
    id: 'tier-30000',
    tierAmount: 30000,
    title: 'Tier 5 Emerald Product',
    dailyProfit: 2600,
    durationDays: 30,
    totalReturnPercent: 260,
    description: 'Earn 2,600 RWF every day for 30 days. Initial price: 30,000 RWF.'
  },
  {
    id: 'tier-40000',
    tierAmount: 40000,
    title: 'Tier 6 Diamond Product',
    dailyProfit: 3600,
    durationDays: 30,
    totalReturnPercent: 270,
    description: 'Earn 3,600 RWF every day for 30 days. Initial price: 40,000 RWF.'
  },
  {
    id: 'tier-50000',
    tierAmount: 50000,
    title: 'Tier 7 VIP Platinum Product',
    dailyProfit: 4700,
    durationDays: 30,
    totalReturnPercent: 282,
    description: 'Earn 4,700 RWF every day for 30 days. Initial price: 50,000 RWF.'
  }
];

export const RWANDA_DISTRICTS = [
  'Gasabo (Kigali)',
  'Kicukiro (Kigali)',
  'Nyarugenge (Kigali)',
  'Bugesera',
  'Gatsibo',
  'Kayonza',
  'Kirehe',
  'Ngoma',
  'Nyagatare',
  'Rwamagana',
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Musanze',
  'Rulindo',
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Muhanga',
  'Nyamagabe',
  'Nyanza',
  'Nyaruguru',
  'Ruhango',
  'Karongi',
  'Ngororero',
  'Nyabihu',
  'Nyamasheke',
  'Rubavu',
  'Rusizi',
  'Rutsiro'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Uwimana Jean Claude (Admin)',
    email: 'admin@umurimo.rw',
    phone: '0788123456',
    district: 'Gasabo (Kigali)',
    birthDate: '1992-05-14',
    avatar: '/src/assets/images/avatar_admin_rw_1790691595686.jpg',
    role: 'admin',
    isBlocked: false,
    balance: 850000,
    registrationBonus: 2500,
    hasBoughtProduct: true,
    totalEarned: 1250000,
    totalWithdrawn: 400000,
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'user-demo-1',
    name: 'Mugisha Patrick',
    email: 'mugisha@umurimo.rw',
    phone: '0789456123',
    district: 'Nyarugenge (Kigali)',
    birthDate: '2001-08-20',
    avatar: '/src/assets/images/avatar_user_rw_1790691607872.jpg',
    role: 'user',
    isBlocked: false,
    balance: 7850,
    registrationBonus: 2500,
    hasBoughtProduct: true,
    totalEarned: 14500,
    totalWithdrawn: 6650,
    createdAt: '2026-02-15T10:30:00.000Z'
  },
  {
    id: 'user-new-1',
    name: 'Iradukunda Alice',
    email: 'alice@umurimo.rw',
    phone: '0738129045',
    district: 'Kicukiro (Kigali)',
    birthDate: '2003-11-04',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    isBlocked: false,
    balance: 2500, // Just registered, has bonus only, cannot withdraw yet!
    registrationBonus: 2500,
    hasBoughtProduct: false,
    totalEarned: 2500,
    totalWithdrawn: 0,
    createdAt: '2026-03-01T12:00:00.000Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-yt-1',
    creatorId: 'user-admin-1',
    creatorName: 'Ishema Media Group',
    title: 'Subscribe to Ishema News YouTube Channel',
    type: 'youtube_subscribe',
    description: 'Open the YouTube channel link, click Subscribe, turn on the bell notification, and take a screenshot as proof.',
    instructions: [
      'Click on "Open Link / Start Task"',
      'Click Subscribe on the YouTube Channel',
      'Turn on the bell notification',
      'Take a screenshot showing that you subscribed',
      'Upload your screenshot here and submit'
    ],
    targetUrl: 'https://www.youtube.com/@RwandaUpdatesTV',
    rewardPerTask: 250,
    totalBudget: 25000,
    totalSlots: 100,
    completedSlots: 42,
    requiresProof: true,
    proofRequirementText: 'Upload a clear screenshot showing you subscribed to the channel',
    paymentUssd: '*182*8*1*1880554*25000#',
    status: 'published',
    createdAt: '2026-03-10T09:00:00.000Z'
  },
  {
    id: 'task-yt-2',
    creatorId: 'user-admin-1',
    creatorName: 'Kigali Tech Innovations',
    title: 'Watch YouTube Video (2 Minutes) & Like',
    type: 'youtube_watch',
    description: 'Watch this short video about digital technology growth in Rwanda, like it, and take a screenshot showing 2 minutes played.',
    instructions: [
      'Open the video on YouTube',
      'Watch at least 2 minutes of the video',
      'Click the Like button',
      'Take a screenshot showing 2 minutes played',
      'Upload the screenshot to receive payment'
    ],
    targetUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rewardPerTask: 200,
    totalBudget: 20000,
    totalSlots: 100,
    completedSlots: 68,
    requiresProof: true,
    proofRequirementText: 'Screenshot showing 2 minutes watched and a like',
    paymentUssd: '*182*8*1*1880554*20000#',
    status: 'published',
    createdAt: '2026-03-12T11:00:00.000Z'
  },
  {
    id: 'task-short-1',
    creatorId: 'user-admin-1',
    creatorName: 'Rwanda Fashion Hub',
    title: 'Like and Comment on Short Video',
    type: 'short_video',
    description: 'Watch this 30-second fashion showcase video, leave a positive comment, and confirm your completion.',
    instructions: [
      'Click the link to view the 30-second short video',
      'Leave a like and positive comment',
      'Return here and confirm your task'
    ],
    targetUrl: 'https://youtube.com/shorts/fashionrwanda',
    rewardPerTask: 150,
    totalBudget: 15000,
    totalSlots: 100,
    completedSlots: 55,
    requiresProof: false,
    paymentUssd: '*182*8*1*1880554*15000#',
    status: 'published',
    createdAt: '2026-03-15T14:20:00.000Z'
  },
  {
    id: 'task-survey-1',
    creatorId: 'user-admin-1',
    creatorName: 'Rwanda Consumer Research',
    title: 'Quick Survey: Mobile Money Usage in Rwanda',
    type: 'survey',
    description: 'Answer 3 simple questions about how you use Mobile Money for everyday payments to get paid instantly.',
    instructions: [
      'Answer all questions honestly',
      'Select the option that best fits you',
      'Submit the survey and get paid instantly to your wallet'
    ],
    targetUrl: 'https://forms.gle/rwanda-survey-sample',
    rewardPerTask: 300,
    totalBudget: 30000,
    totalSlots: 100,
    completedSlots: 89,
    requiresProof: false,
    paymentUssd: '*182*8*1*1880554*30000#',
    status: 'published',
    createdAt: '2026-03-18T16:00:00.000Z'
  },
  {
    id: 'task-general-1',
    creatorId: 'user-admin-1',
    creatorName: 'Kigali Artisan Marketplace',
    title: 'Visit Made in Rwanda Online Shop',
    type: 'general',
    description: 'Visit our online crafts store, browse items for at least 45 seconds, and earn instant money.',
    instructions: [
      'Click the link to visit the website',
      'Browse through products for at least 45 seconds',
      'Return here and claim your reward'
    ],
    targetUrl: 'https://visitrwanda.com',
    rewardPerTask: 120,
    totalBudget: 12000,
    totalSlots: 100,
    completedSlots: 73,
    requiresProof: false,
    paymentUssd: '*182*8*1*1880554*12000#',
    status: 'published',
    createdAt: '2026-03-20T10:00:00.000Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'bonus',
    amount: 2500,
    direction: 'in',
    description: 'New Account Welcome Registration Bonus',
    status: 'completed',
    date: '2026-02-15T10:30:00.000Z'
  },
  {
    id: 'tx-2',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'deposit_product',
    amount: 10000,
    direction: 'in',
    description: 'Purchased Tier 2 Bronze Product (MTN MoMo)',
    status: 'completed',
    date: '2026-02-16T09:15:00.000Z'
  },
  {
    id: 'tx-3',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'daily_profit',
    amount: 750,
    direction: 'in',
    description: 'Daily Profit from 10,000 RWF Product',
    status: 'completed',
    date: '2026-02-17T08:00:00.000Z'
  },
  {
    id: 'tx-4',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'task_earning',
    amount: 250,
    direction: 'in',
    description: 'Reward: Subscribed to Ishema News YouTube Channel',
    status: 'completed',
    date: '2026-02-18T14:30:00.000Z'
  },
  {
    id: 'tx-5',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'withdrawal',
    amount: 9500,
    direction: 'out',
    description: 'Withdrawal to MTN Mobile Money (0789456123)',
    status: 'completed',
    notes: 'Approved by Administrator. Sent to MTN MoMo.',
    date: '2026-02-25T16:00:00.000Z'
  },
  {
    id: 'tx-6',
    userId: 'user-demo-1',
    userName: 'Mugisha Patrick',
    type: 'withdrawal_fee',
    amount: 2850,
    direction: 'out',
    description: '30% Platform Withdrawal Fee on 9,500 RWF',
    status: 'completed',
    date: '2026-02-25T16:00:00.000Z'
  }
];

export const INITIAL_BROADCASTS: BroadcastNotification[] = [
  {
    id: 'bc-1',
    senderName: 'Umurimo Rwanda Administration',
    title: 'Welcome to our Daily Earnings & Task Marketplace!',
    message: 'Welcome everyone! You can now purchase products starting from 5,000 RWF to earn daily profits automatically. Follow the easy USSD codes for MTN and Airtel Mobile Money.',
    createdAt: '2026-03-25T08:30:00.000Z',
    type: 'broadcast',
    targetUserId: 'ALL'
  },
  {
    id: 'bc-2',
    senderName: 'Security Advisory',
    title: 'Protect Your Mobile Money Account',
    message: 'Important Notice: No staff member from Umurimo Rwanda will ever ask for your Mobile Money secret PIN or account password. Only use the official dial codes provided in the system.',
    createdAt: '2026-03-27T10:00:00.000Z',
    type: 'broadcast',
    targetUserId: 'ALL'
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'chat-1',
    senderId: 'user-demo-1',
    senderName: 'Mugisha Patrick',
    senderRole: 'user',
    receiverId: 'admin',
    message: 'Hello Support! How are daily profits calculated and when can I claim them?',
    timestamp: '2026-03-28T09:20:00.000Z',
    isRead: true
  },
  {
    id: 'chat-2',
    senderId: 'user-admin-1',
    senderName: 'Support Team (Admin)',
    senderRole: 'admin',
    receiverId: 'user-demo-1',
    message: 'Hello Patrick! Daily profit is accumulated every 24 hours. Just click "Claim Today\'s Profit" on your dashboard and funds are added instantly to your wallet. Thank you!',
    timestamp: '2026-03-28T09:35:00.000Z',
    isRead: true
  }
];
