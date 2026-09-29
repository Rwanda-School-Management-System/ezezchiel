import {
  User,
  InvestmentTier,
  ProductPurchase,
  Task,
  TaskSubmission,
  WithdrawalRequest,
  Transaction,
  BroadcastNotification,
  ChatMessage
} from '../types';
import {
  INITIAL_TIERS,
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_BROADCASTS,
  INITIAL_CHATS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'umurimo_users_v3',
  CURRENT_USER: 'umurimo_current_user_v3',
  TIERS: 'umurimo_tiers_v3',
  PURCHASES: 'umurimo_purchases_v3',
  TASKS: 'umurimo_tasks_v3',
  SUBMISSIONS: 'umurimo_submissions_v3',
  WITHDRAWALS: 'umurimo_withdrawals_v3',
  TRANSACTIONS: 'umurimo_transactions_v3',
  BROADCASTS: 'umurimo_broadcasts_v3',
  CHATS: 'umurimo_chats_v3'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

class AppStore {
  private users: User[] = [];
  private currentUser: User | null = null;
  private tiers: InvestmentTier[] = [];
  private purchases: ProductPurchase[] = [];
  private tasks: Task[] = [];
  private submissions: TaskSubmission[] = [];
  private withdrawals: WithdrawalRequest[] = [];
  private transactions: Transaction[] = [];
  private broadcasts: BroadcastNotification[] = [];
  private chats: ChatMessage[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUser = loadStorage(STORAGE_KEYS.CURRENT_USER, this.users[1]); // Default to Mugisha demo user
    this.tiers = loadStorage(STORAGE_KEYS.TIERS, INITIAL_TIERS);
    this.purchases = loadStorage(STORAGE_KEYS.PURCHASES, [
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
    ]);
    this.tasks = loadStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.submissions = loadStorage(STORAGE_KEYS.SUBMISSIONS, [
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
        notes: 'Subscribed to channel and tapped bell icon!',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]);
    this.withdrawals = loadStorage(STORAGE_KEYS.WITHDRAWALS, [
      {
        id: 'wd-sample-1',
        userId: 'user-demo-1',
        userName: 'Mugisha Patrick',
        userPhone: '0789456123',
        amount: 5000,
        fee: 1500, // 30% fee
        netAmount: 3500,
        method: 'MTN',
        recipientPhone: '0789456123',
        recipientName: 'Mugisha Patrick',
        status: 'pending',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]);
    this.transactions = loadStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.broadcasts = loadStorage(STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS);
    this.chats = loadStorage(STORAGE_KEYS.CHATS, INITIAL_CHATS);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- GETTERS ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getTiers(): InvestmentTier[] {
    return [...this.tiers];
  }

  public getPurchases(): ProductPurchase[] {
    return [...this.purchases];
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getSubmissions(): TaskSubmission[] {
    return [...this.submissions];
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return [...this.withdrawals];
  }

  public getTransactions(userId?: string): Transaction[] {
    if (!userId) return [...this.transactions];
    return this.transactions.filter((tx) => tx.userId === userId);
  }

  public getBroadcasts(): BroadcastNotification[] {
    return [...this.broadcasts];
  }

  public getChats(userId: string): ChatMessage[] {
    return this.chats.filter(
      (c) => c.senderId === userId || c.receiverId === userId || c.receiverId === 'ALL'
    );
  }

  // --- AUTHENTICATION & SESSIONS ---
  public login(identifier: string, role: 'user' | 'admin' = 'user'): { success: boolean; message: string; user?: User } {
    const clean = identifier.trim().toLowerCase();
    const found = this.users.find(
      (u) =>
        (u.email.toLowerCase() === clean || u.phone === clean) &&
        (role === 'admin' ? u.role === 'admin' : true)
    );

    if (!found) {
      return {
        success: false,
        message: role === 'admin' ? 'Invalid administrator credentials.' : 'User account not found with this email or phone.'
      };
    }

    if (found.isBlocked) {
      return {
        success: false,
        message: 'Your account has been suspended by the administrator. Please contact support.'
      };
    }

    this.currentUser = found;
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
    return { success: true, message: 'Logged in successfully!', user: found };
  }

  public register(data: {
    name: string;
    email: string;
    phone: string;
    district: string;
    birthDate: string;
    avatar?: string;
  }): { success: boolean; message: string; user?: User } {
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim() || u.phone === data.phone.trim()
    );

    if (existing) {
      return {
        success: false,
        message: 'This email address or phone number is already registered.'
      };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      district: data.district || 'Gasabo (Kigali)',
      birthDate: data.birthDate || '2000-01-01',
      avatar: data.avatar || '/src/assets/images/avatar_user_rw_1790691607872.jpg',
      role: 'user',
      isBlocked: false,
      balance: 2500, // Immediate 2,500 RWF Registration Bonus!
      registrationBonus: 2500,
      hasBoughtProduct: false, // Must buy a product to withdraw this bonus!
      totalEarned: 2500,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);

    // Record Bonus Transaction
    const bonusTx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: newUser.id,
      userName: newUser.name,
      type: 'bonus',
      amount: 2500,
      direction: 'in',
      description: 'Welcome Registration Bonus: 2,500 RWF (Policy: Buy at least 1 product to unlock withdrawals)',
      status: 'completed',
      date: new Date().toISOString()
    };
    this.transactions.unshift(bonusTx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Welcome Notification
    this.addNotification({
      title: 'Welcome to Umurimo Rwanda! You received 2,500 RWF Bonus',
      message: 'We are excited to welcome you. Your account received 2,500 RWF immediately! Note: Purchase at least one daily profit product starting from 5,000 RWF to unlock your bonus and profits for withdrawal.',
      type: 'system',
      targetUserId: newUser.id
    });

    this.notify();
    return { success: true, message: 'Account registered successfully! 2,500 RWF bonus added to your wallet.', user: newUser };
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  public switchUser(user: User): void {
    this.currentUser = user;
    saveStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  // --- USER PROFILE & PASSWORD ---
  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'district' | 'birthDate' | 'avatar' | 'email'>>
  ): { success: boolean; message: string } {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates
    };

    this.users[userIndex] = updatedUser;
    if (this.currentUser?.id === userId) {
      this.currentUser = updatedUser;
      saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    saveStorage(STORAGE_KEYS.USERS, this.users);

    this.notify();
    return { success: true, message: 'Profile details saved and updated live to Admin dashboard!' };
  }

  public changePassword(userId: string, _oldPass: string, _newPass: string): { success: boolean; message: string } {
    return { success: true, message: 'Password changed successfully!' };
  }

  // --- ADMIN USER MANAGEMENT ---
  public toggleBlockUser(userId: string): { success: boolean; isBlocked: boolean; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, isBlocked: false, message: 'User not found' };

    user.isBlocked = !user.isBlocked;
    saveStorage(STORAGE_KEYS.USERS, this.users);

    if (this.currentUser?.id === userId && user.isBlocked) {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    this.notify();
    return {
      success: true,
      isBlocked: user.isBlocked,
      message: user.isBlocked ? 'User has been blocked!' : 'User has been unblocked!'
    };
  }

  public deleteUser(userId: string): { success: boolean; message: string } {
    this.users = this.users.filter((u) => u.id !== userId);
    this.transactions = this.transactions.filter((tx) => tx.userId !== userId);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    if (this.currentUser?.id === userId) {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    this.notify();
    return { success: true, message: 'User account deleted permanently from system.' };
  }

  // --- INVESTMENT PRODUCTS & DEPOSITS ---
  public buyProduct(data: {
    userId: string;
    tierAmount: number;
    paymentMethod: 'MTN' | 'AIRTEL_TIGO';
    senderPhone: string;
    transactionId: string;
    screenshotUrl: string;
  }): { success: boolean; message: string; purchase?: ProductPurchase } {
    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    const tier = this.tiers.find((t) => t.tierAmount === data.tierAmount);
    if (!tier) return { success: false, message: 'Selected product package does not exist.' };

    const ussdCode =
      data.paymentMethod === 'MTN'
        ? `*182*1*2*0738514596*${data.tierAmount}#`
        : `*182*1*1*0738514596*${data.tierAmount}#`;

    const newPurchase: ProductPurchase = {
      id: 'pur-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: data.senderPhone || user.phone,
      tierAmount: data.tierAmount,
      paymentMethod: data.paymentMethod,
      ussdCode,
      senderPhone: data.senderPhone || user.phone,
      transactionId: data.transactionId || 'MOMO-' + Math.floor(100000 + Math.random() * 900000),
      screenshotUrl: data.screenshotUrl,
      status: 'pending',
      dailyProfitAmount: tier.dailyProfit,
      createdAt: new Date().toISOString(),
      totalProfitEarned: 0
    };

    this.purchases.unshift(newPurchase);
    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);

    // Notify Admin
    this.addNotification({
      title: 'New Product Purchase Request!',
      message: `${user.name} submitted payment of ${data.tierAmount.toLocaleString()} RWF on ${data.paymentMethod}. Please inspect the screenshot and Approve.`,
      type: 'system',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: 'Product purchase request submitted! The administrator will review and approve shortly.',
      purchase: newPurchase
    };
  }

  public reviewProductPurchase(
    purchaseId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const purchase = this.purchases.find((p) => p.id === purchaseId);
    if (!purchase) return { success: false, message: 'Purchase request not found.' };

    const user = this.users.find((u) => u.id === purchase.userId);

    if (action === 'approve') {
      purchase.status = 'approved';
      purchase.approvedAt = new Date().toISOString();
      purchase.lastProfitClaimedAt = new Date().toISOString();

      if (user) {
        user.hasBoughtProduct = true; // User can now withdraw bonus!
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Record Deposit Transaction
        const tx: Transaction = {
          id: 'tx-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'deposit_product',
          amount: purchase.tierAmount,
          direction: 'in',
          description: `Product Purchase: ${purchase.tierAmount.toLocaleString()} RWF via ${purchase.paymentMethod} (Approved)`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(tx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Notify User
        this.addNotification({
          title: 'Your Product Purchase was Approved!',
          message: `Your ${purchase.tierAmount.toLocaleString()} RWF product was approved. You will earn +${purchase.dailyProfitAmount.toLocaleString()} RWF daily profit every 24h! Your 2,500 RWF registration bonus is now unlocked for withdrawal.`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      purchase.status = 'rejected';
      purchase.rejectionReason = rejectionReason || 'Screenshot does not match payment record.';

      if (user) {
        this.addNotification({
          title: 'Product Purchase Request Rejected',
          message: `Your request for ${purchase.tierAmount.toLocaleString()} RWF was rejected. Reason: ${purchase.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);
    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Product purchase Approved!' : 'Product purchase Rejected!'
    };
  }

  // Claim Daily Profit for approved products
  public claimDailyProfit(userId: string): { success: boolean; amount: number; message: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, amount: 0, message: 'User not found.' };

    const approvedPurchases = this.purchases.filter((p) => p.userId === userId && p.status === 'approved');
    if (approvedPurchases.length === 0) {
      return { success: false, amount: 0, message: 'You have no active approved products yet.' };
    }

    let totalClaimable = 0;
    const now = Date.now();

    approvedPurchases.forEach((p) => {
      const currentTier = this.tiers.find((t) => t.tierAmount === p.tierAmount);
      const profitRate = currentTier ? currentTier.dailyProfit : p.dailyProfitAmount;

      totalClaimable += profitRate;
      p.totalProfitEarned += profitRate;
      p.lastProfitClaimedAt = new Date(now).toISOString();
    });

    user.balance += totalClaimable;
    user.totalEarned += totalClaimable;

    // Record Transaction
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'daily_profit',
      amount: totalClaimable,
      direction: 'in',
      description: `Daily profit from ${approvedPurchases.length} product(s) (+${totalClaimable.toLocaleString()} RWF)`,
      status: 'completed',
      date: new Date().toISOString()
    };

    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.PURCHASES, this.purchases);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      amount: totalClaimable,
      message: `You claimed +${totalClaimable.toLocaleString()} RWF daily profit!`
    };
  }

  // --- ADMIN PROFIT SETTINGS PANEL ---
  public updateTierDailyProfit(tierId: string, newDailyProfit: number): { success: boolean; message: string } {
    const tier = this.tiers.find((t) => t.id === tierId);
    if (!tier) return { success: false, message: 'Product tier not found.' };

    tier.dailyProfit = newDailyProfit;
    tier.totalReturnPercent = Math.round(((newDailyProfit * tier.durationDays) / tier.tierAmount) * 100);
    tier.description = `Earn ${newDailyProfit.toLocaleString()} RWF daily for ${tier.durationDays} days. Price: ${tier.tierAmount.toLocaleString()} RWF.`;

    saveStorage(STORAGE_KEYS.TIERS, this.tiers);
    this.notify();
    return {
      success: true,
      message: `Daily profit for ${tier.tierAmount.toLocaleString()} RWF updated to ${newDailyProfit.toLocaleString()} RWF/day!`
    };
  }

  // --- TASKS SYSTEM & CREATION (ADVERTISER) ---
  public createTask(data: {
    creatorId: string;
    creatorName: string;
    title: string;
    type: Task['type'];
    description: string;
    instructions: string[];
    targetUrl: string;
    rewardPerTask: number;
    totalSlots: number;
    paymentProofUrl?: string;
    transactionId?: string;
  }): { success: boolean; message: string; task?: Task } {
    const totalBudget = data.rewardPerTask * data.totalSlots;
    const ussdCode = `*182*8*1*1880554*${totalBudget}#`;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      title: data.title,
      type: data.type,
      description: data.description,
      instructions: data.instructions,
      targetUrl: data.targetUrl,
      rewardPerTask: data.rewardPerTask,
      totalBudget,
      totalSlots: data.totalSlots,
      completedSlots: 0,
      requiresProof: data.type === 'youtube_subscribe' || data.type === 'youtube_watch',
      proofRequirementText:
        data.type === 'youtube_subscribe'
          ? 'Upload screenshot showing you subscribed to the channel'
          : data.type === 'youtube_watch'
          ? 'Upload screenshot showing you watched 2 minutes of the video'
          : undefined,
      paymentUssd: ussdCode,
      paymentProofUrl: data.paymentProofUrl,
      transactionId: data.transactionId || 'MOMO-' + Math.floor(100000 + Math.random() * 900000),
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);

    // Notify Admin of task awaiting payment approval
    this.addNotification({
      title: 'New Task Campaign Pending Approval',
      message: `${data.creatorName} submitted task: "${data.title}" with total budget ${totalBudget.toLocaleString()} RWF via MoMo (${ussdCode}).`,
      type: 'task',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: `Task campaign submitted! Once you dial ${ussdCode} and admin verifies payment, your task will be published to all users.`,
      task: newTask
    };
  }

  public adminManageTask(
    taskId: string,
    action: 'publish' | 'unpublish' | 'delete'
  ): { success: boolean; message: string } {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return { success: false, message: 'Task not found.' };

    if (action === 'delete') {
      this.tasks.splice(index, 1);
      saveStorage(STORAGE_KEYS.TASKS, this.tasks);
      this.notify();
      return { success: true, message: 'Task deleted successfully!' };
    }

    this.tasks[index].status = action === 'publish' ? 'published' : 'unpublished';
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    this.notify();
    return {
      success: true,
      message: action === 'publish' ? 'Task campaign Approved & Published!' : 'Task campaign Unpublished!'
    };
  }

  // Submit task completion
  public submitTask(data: {
    taskId: string;
    userId: string;
    proofPhotoUrl?: string;
    notes?: string;
  }): { success: boolean; message: string; instantReward?: number } {
    const task = this.tasks.find((t) => t.id === data.taskId);
    if (!task) return { success: false, message: 'Task not found.' };

    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    const existing = this.submissions.find((s) => s.taskId === data.taskId && s.userId === data.userId);
    if (existing) {
      return { success: false, message: 'You have already completed this task!' };
    }

    if (task.requiresProof && !data.proofPhotoUrl) {
      return { success: false, message: 'Please upload a screenshot proving you subscribed or watched the video.' };
    }

    // If task requires proof (YouTube), it goes to Admin Review
    if (task.requiresProof) {
      const submission: TaskSubmission = {
        id: 'sub-' + Date.now(),
        taskId: task.id,
        taskTitle: task.title,
        taskType: task.type,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        reward: task.rewardPerTask,
        proofPhotoUrl: data.proofPhotoUrl,
        notes: data.notes,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      this.submissions.unshift(submission);
      saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);

      // Notify Admin
      this.addNotification({
        title: 'New Task Proof Submission',
        message: `${user.name} submitted a screenshot proof for: "${task.title}". Please verify and approve.`,
        type: 'task',
        targetUserId: 'user-admin-1'
      });

      this.notify();
      return {
        success: true,
        message: 'Task proof submitted! The admin will review your screenshot and credit your wallet shortly.'
      };
    }

    // Instant approval for non-proof tasks (Survey, Short Video, General)
    task.completedSlots += 1;
    user.balance += task.rewardPerTask;
    user.totalEarned += task.rewardPerTask;

    const submission: TaskSubmission = {
      id: 'sub-' + Date.now(),
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.type,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      reward: task.rewardPerTask,
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString()
    };

    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'task_earning',
      amount: task.rewardPerTask,
      direction: 'in',
      description: `Task Reward: ${task.title}`,
      status: 'completed',
      date: new Date().toISOString()
    };

    this.submissions.unshift(submission);
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      instantReward: task.rewardPerTask,
      message: `Great job! Task completed and +${task.rewardPerTask.toLocaleString()} RWF added to your wallet!`
    };
  }

  // Admin reviews task submission
  public reviewTaskSubmission(
    submissionId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, message: 'Submission not found.' };

    const user = this.users.find((u) => u.id === sub.userId);
    const task = this.tasks.find((t) => t.id === sub.taskId);

    if (action === 'approve') {
      sub.status = 'approved';
      sub.reviewedAt = new Date().toISOString();

      if (task) task.completedSlots += 1;

      if (user) {
        user.balance += sub.reward;
        user.totalEarned += sub.reward;

        const tx: Transaction = {
          id: 'tx-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'task_earning',
          amount: sub.reward,
          direction: 'in',
          description: `Task Proof Approved: ${sub.taskTitle}`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(tx);

        this.addNotification({
          title: 'Your Task Proof was Approved!',
          message: `Your screenshot for "${sub.taskTitle}" was approved by Admin. You received +${sub.reward.toLocaleString()} RWF!`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      sub.status = 'rejected';
      sub.reviewedAt = new Date().toISOString();
      sub.rejectionReason = rejectionReason || 'Screenshot does not show subscription or video playback.';

      if (user) {
        this.addNotification({
          title: 'Task Proof was Not Approved',
          message: `Your screenshot for "${sub.taskTitle}" was rejected. Reason: ${sub.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.TASKS, this.tasks);
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Task proof approved and user credited!' : 'Task proof rejected!'
    };
  }

  // --- WITHDRAWALS ---
  public requestWithdrawal(data: {
    userId: string;
    amount: number;
    method: 'MTN' | 'AIRTEL_TIGO';
    recipientPhone: string;
    recipientName: string;
  }): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const user = this.users.find((u) => u.id === data.userId);
    if (!user) return { success: false, message: 'User not found.' };

    // Rule 1: Registration Bonus Lock - must buy a product first!
    if (!user.hasBoughtProduct) {
      return {
        success: false,
        message:
          'SECURITY POLICY: You cannot withdraw funds until you purchase at least one daily profit product starting from 5,000 RWF.'
      };
    }

    // Rule 2: Minimum withdrawal = 5,000 RWF
    if (data.amount < 5000) {
      return {
        success: false,
        message: 'Minimum withdrawal amount is 5,000 RWF.'
      };
    }

    // Rule 3: Balance check
    if (user.balance < data.amount) {
      return {
        success: false,
        message: `Your balance is only ${user.balance.toLocaleString()} RWF. You cannot withdraw ${data.amount.toLocaleString()} RWF.`
      };
    }

    // Rule 4: Phone prefix validation
    // MTN: 078 or 079
    // Airtel/Tigo: 072 or 073
    const phone = data.recipientPhone.trim().replace(/\s+/g, '');
    if (data.method === 'MTN') {
      if (!/^(078|079)\d{7}$/.test(phone)) {
        return {
          success: false,
          message: 'MTN phone numbers must start with 078 or 079 and contain 10 digits.'
        };
      }
    } else {
      if (!/^(072|073)\d{7}$/.test(phone)) {
        return {
          success: false,
          message: 'Airtel / Tigo phone numbers must start with 072 or 073 and contain 10 digits.'
        };
      }
    }

    // Rule 5: 30% Fee calculation
    const fee = Math.round(data.amount * 0.3); // 30% fee
    const netAmount = data.amount - fee;

    // Deduct total amount from user balance right now (reserved for payout)
    user.balance -= data.amount;
    saveStorage(STORAGE_KEYS.USERS, this.users);

    const withdrawal: WithdrawalRequest = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: data.amount,
      fee,
      netAmount,
      method: data.method,
      recipientPhone: phone,
      recipientName: data.recipientName.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.withdrawals.unshift(withdrawal);
    saveStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);

    // Record pending transaction
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'withdrawal',
      amount: data.amount,
      direction: 'out',
      description: `Withdrawal Request: ${data.amount.toLocaleString()} RWF via ${data.method} (${phone} - ${data.recipientName}) [30% Fee: ${fee.toLocaleString()} RWF]`,
      status: 'pending',
      date: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Notify Admin
    this.addNotification({
      title: 'New Withdrawal Request',
      message: `${user.name} requested withdrawal of ${data.amount.toLocaleString()} RWF (Payout: ${netAmount.toLocaleString()} RWF to ${data.method} - ${phone} / ${data.recipientName}).`,
      type: 'withdrawal',
      targetUserId: 'user-admin-1'
    });

    this.notify();
    return {
      success: true,
      message: `Withdrawal request for ${data.amount.toLocaleString()} RWF received! You will receive ${netAmount.toLocaleString()} RWF to ${phone}.`,
      withdrawal
    };
  }

  // Admin approves or rejects withdrawal
  public reviewWithdrawal(
    withdrawalId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const withdrawal = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return { success: false, message: 'Withdrawal request not found.' };

    const user = this.users.find((u) => u.id === withdrawal.userId);

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.reviewedAt = new Date().toISOString();

      if (user) {
        user.totalWithdrawn += withdrawal.netAmount;
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Update transaction status
        const tx = this.transactions.find(
          (t) => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'completed';
          tx.notes = `Approved by Admin. Net payout ${withdrawal.netAmount.toLocaleString()} RWF sent to ${withdrawal.recipientPhone} (${withdrawal.recipientName}).`;
        }

        // Add 30% Fee Transaction record
        const feeTx: Transaction = {
          id: 'tx-fee-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_fee',
          amount: withdrawal.fee,
          direction: 'out',
          description: `30% Withdrawal Fee on ${withdrawal.amount.toLocaleString()} RWF`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(feeTx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Notify user
        this.addNotification({
          title: 'Your Withdrawal Has Been Paid!',
          message: `Payout of ${withdrawal.netAmount.toLocaleString()} RWF has been successfully sent to your Mobile Money number ${withdrawal.recipientPhone} (${withdrawal.method}). Thank you!`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      withdrawal.status = 'rejected';
      withdrawal.reviewedAt = new Date().toISOString();
      withdrawal.rejectionReason = rejectionReason || 'Phone number or account name mismatch on Mobile Money.';

      // Refund the total amount back to user's balance!
      if (user) {
        user.balance += withdrawal.amount;
        saveStorage(STORAGE_KEYS.USERS, this.users);

        // Update transaction
        const tx = this.transactions.find(
          (t) => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'rejected';
          tx.notes = `Rejected by Admin. Reason: ${withdrawal.rejectionReason}. Full amount refunded to balance.`;
        }

        // Add refund transaction
        const refundTx: Transaction = {
          id: 'tx-ref-' + Date.now(),
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_refund',
          amount: withdrawal.amount,
          direction: 'in',
          description: `Refund: ${withdrawal.amount.toLocaleString()} RWF because withdrawal was rejected (${withdrawal.rejectionReason})`,
          status: 'completed',
          date: new Date().toISOString()
        };
        this.transactions.unshift(refundTx);
        saveStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

        // Notify User with clear reason
        this.addNotification({
          title: 'Withdrawal Request Rejected & Refunded',
          message: `Your withdrawal of ${withdrawal.amount.toLocaleString()} RWF was rejected. Reason: "${withdrawal.rejectionReason}". The entire amount was refunded to your wallet balance.`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    saveStorage(STORAGE_KEYS.WITHDRAWALS, this.withdrawals);
    this.notify();
    return {
      success: true,
      message: action === 'approve' ? 'Withdrawal Approved & Processed!' : 'Withdrawal Rejected & Funds Refunded!'
    };
  }

  // --- BROADCAST MESSAGING & NOTIFICATIONS ---
  public sendBroadcast(title: string, message: string): { success: boolean; message: string } {
    const newBroadcast: BroadcastNotification = {
      id: 'bc-' + Date.now(),
      senderName: 'Umurimo Rwanda Admin',
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      type: 'broadcast',
      targetUserId: 'ALL'
    };

    this.broadcasts.unshift(newBroadcast);
    saveStorage(STORAGE_KEYS.BROADCASTS, this.broadcasts);
    this.notify();
    return { success: true, message: 'Broadcast announcement sent to all members successfully!' };
  }

  public addNotification(data: {
    title: string;
    message: string;
    type: BroadcastNotification['type'];
    targetUserId: string;
  }): void {
    const notif: BroadcastNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      senderName: 'Umurimo Rwanda System',
      title: data.title,
      message: data.message,
      createdAt: new Date().toISOString(),
      type: data.type,
      targetUserId: data.targetUserId,
      read: false
    };

    this.broadcasts.unshift(notif);
    saveStorage(STORAGE_KEYS.BROADCASTS, this.broadcasts);
    this.notify();
  }

  // --- LIVE CHAT & SUPPORT TICKETING ---
  public sendChatMessage(senderId: string, message: string, receiverId: string = 'admin'): { success: boolean } {
    const sender = this.users.find((u) => u.id === senderId);
    if (!sender) return { success: false };

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.chats.push(newMsg);
    saveStorage(STORAGE_KEYS.CHATS, this.chats);
    this.notify();
    return { success: true };
  }
}

export const store = new AppStore();
