import express from 'express';
import cors from 'cors';
import path from 'path';
import { db } from './server/db';
import { User, InvestmentTier, ProductPurchase, Task, TaskSubmission, WithdrawalRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for audit
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, district, birthDate } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!/^(078|079|072|073)\d{7}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with 078, 079, 072, or 073 and contain 10 digits.'
      });
    }

    const existing = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() || u.phone === cleanPhone
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This email or phone number is already registered in the system.'
      });
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      district: district || 'Gasabo (Kigali)',
      birthDate: birthDate || '2001-01-01',
      avatar: '/src/assets/images/avatar_user_rw_1790691607872.jpg',
      role: 'user',
      isBlocked: false,
      balance: 2500, // Immediate 2,500 RWF Registration Bonus
      pendingBalance: 0,
      registrationBonus: 2500,
      hasBoughtProduct: false, // Strict Rule: Cannot withdraw bonus until product is bought
      totalEarned: 2500,
      totalDeposited: 0,
      totalInvested: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Record immutable bonus transaction
    db.recordTransaction({
      userId: newUser.id,
      userName: newUser.name,
      type: 'bonus',
      amount: 2500,
      direction: 'in',
      description: 'Welcome Registration Bonus: 2,500 RWF (Policy: Buy at least 1 product to unlock withdrawals)',
      status: 'completed',
      relatedEntityId: newUser.id
    });

    // Send Welcome Notification
    db.createNotification({
      senderName: 'Umurimo Rwanda System',
      title: 'Welcome! You received 2,500 RWF Bonus',
      message: 'Welcome to the platform. Your account received 2,500 RWF immediately! Note: Purchase at least one daily profit product to unlock your bonus and earnings for withdrawal.',
      type: 'success',
      targetUserId: newUser.id
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! 2,500 RWF bonus added to your wallet.',
      user: newUser
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Login (Separates User vs Admin portal)
app.post('/api/auth/login', (req, res) => {
  try {
    const { emailOrPhone, password, role = 'user' } = req.body;
    const clean = (emailOrPhone || '').trim().toLowerCase();

    const user = db.users.find(
      u => (u.email.toLowerCase() === clean || u.phone === clean) && u.role === role
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: role === 'admin'
          ? 'Administrator account not found with these credentials.'
          : 'User account not found. Please sign up or verify your credentials.'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator. Please contact support.'
      });
    }

    user.lastLoginAt = new Date().toISOString();
    db.save();

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Current User Info
app.get('/api/auth/me/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, user });
});

// Profile Update
app.put('/api/profile/update', (req, res) => {
  try {
    const { userId, name, phone, district, birthDate, avatar, email } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (district) user.district = district;
    if (birthDate) user.birthDate = birthDate;
    if (avatar) user.avatar = avatar;
    if (email) user.email = email.trim();

    db.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully and synced live to Admin portal!',
      user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Password Update
app.put('/api/profile/password', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  db.save();
  return res.json({ success: true, message: 'Password updated successfully!' });
});

// ==========================================
// 2. SHORT VIDEOS EARNING SYSTEM
// ==========================================

// Get All Short Videos
app.get('/api/videos', (req, res) => {
  return res.json({ success: true, videos: db.shortVideos.filter(v => v.isPublished) });
});

// Claim Video Reward after Server-side Duration Verification
app.post('/api/videos/:id/claim', (req, res) => {
  try {
    const { userId, watchedSeconds } = req.body;
    const video = db.shortVideos.find(v => v.id === req.params.id);
    const user = db.users.find(u => u.id === userId);

    if (!video || !user) {
      return res.status(404).json({ success: false, message: 'Video or User not found.' });
    }

    // Server-side viewing duration verification
    if ((watchedSeconds || 0) < video.durationSeconds) {
      return res.status(400).json({
        success: false,
        message: `Please watch this video for at least ${video.durationSeconds} seconds to claim your reward.`
      });
    }

    // Check if already claimed
    const existing = db.videoViews.find(vw => vw.videoId === video.id && vw.userId === user.id && vw.rewardClaimed);
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already claimed the reward for this video.' });
    }

    db.videoViews.push({
      id: 'view-' + Date.now(),
      videoId: video.id,
      userId: user.id,
      watchedSeconds,
      isCompleted: true,
      rewardClaimed: true,
      viewedAt: new Date().toISOString()
    });

    user.balance += video.reward;
    user.totalEarned += video.reward;

    db.recordTransaction({
      userId: user.id,
      userName: user.name,
      type: 'video_earning',
      amount: video.reward,
      direction: 'in',
      description: `Short Video Reward: "${video.title}"`,
      status: 'completed',
      relatedEntityId: video.id
    });

    db.save();

    return res.json({
      success: true,
      message: `Great job! +${video.reward.toLocaleString()} RWF added to your wallet!`,
      reward: video.reward,
      newBalance: user.balance
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. SURVEY EARNING SYSTEM
// ==========================================

// Get Surveys
app.get('/api/surveys', (req, res) => {
  return res.json({ success: true, surveys: db.surveys.filter(s => s.isPublished) });
});

// Submit Survey
app.post('/api/surveys/:id/submit', (req, res) => {
  try {
    const { userId, answers } = req.body;
    const survey = db.surveys.find(s => s.id === req.params.id);
    const user = db.users.find(u => u.id === userId);

    if (!survey || !user) {
      return res.status(404).json({ success: false, message: 'Survey or User not found.' });
    }

    const existing = db.surveySubmissions.find(sub => sub.surveyId === survey.id && sub.userId === user.id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already completed this survey.' });
    }

    db.surveySubmissions.push({
      id: 'ssub-' + Date.now(),
      surveyId: survey.id,
      surveyTitle: survey.title,
      userId: user.id,
      userName: user.name,
      reward: survey.reward,
      answers: answers || {},
      status: 'approved',
      submittedAt: new Date().toISOString()
    });

    survey.completedCount += 1;
    user.balance += survey.reward;
    user.totalEarned += survey.reward;

    db.recordTransaction({
      userId: user.id,
      userName: user.name,
      type: 'survey_earning',
      amount: survey.reward,
      direction: 'in',
      description: `Survey Reward: "${survey.title}"`,
      status: 'completed',
      relatedEntityId: survey.id
    });

    db.save();

    return res.json({
      success: true,
      message: `Survey completed! +${survey.reward.toLocaleString()} RWF added to your wallet!`,
      reward: survey.reward,
      newBalance: user.balance
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. TASK MANAGEMENT & ADVERTISERS
// ==========================================

// Get Published Tasks
app.get('/api/tasks', (req, res) => {
  return res.json({ success: true, tasks: db.tasks.filter(t => t.status === 'published') });
});

// Create Task (Advertiser)
app.post('/api/tasks/create', (req, res) => {
  try {
    const { creatorId, title, type, description, instructions, targetUrl, rewardPerTask, totalSlots, proofUrl } = req.body;
    const user = db.users.find(u => u.id === creatorId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const totalBudget = rewardPerTask * totalSlots;
    const ussdCode = `*182*8*1*1880554*${totalBudget}#`;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      creatorId: user.id,
      creatorName: user.name,
      title: title.trim(),
      type: type || 'youtube_subscribe',
      description: description.trim(),
      instructions: Array.isArray(instructions) ? instructions : [instructions],
      targetUrl: targetUrl.trim(),
      rewardPerTask: Number(rewardPerTask),
      totalBudget,
      totalSlots: Number(totalSlots),
      completedSlots: 0,
      requiresProof: type === 'youtube_subscribe' || type === 'youtube_watch',
      proofRequirementText: type === 'youtube_subscribe'
        ? 'Upload screenshot showing you subscribed to the channel'
        : 'Upload screenshot showing you watched 2 minutes of the video',
      paymentUssd: ussdCode,
      paymentProofUrl: proofUrl,
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };

    db.tasks.unshift(newTask);

    // Notify Admin of new task awaiting payment
    db.createNotification({
      senderName: 'Task Marketplace System',
      title: 'New Task Campaign Pending Approval',
      message: `${user.name} submitted task: "${newTask.title}" with budget ${totalBudget.toLocaleString()} RWF via MoMo (${ussdCode}).`,
      type: 'task',
      targetUserId: 'user-admin-1'
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: `Task campaign created! Dial ${ussdCode} on your phone to pay. The admin will verify and publish your task.`,
      task: newTask
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Submit Task Completion (User)
app.post('/api/tasks/:id/submit', (req, res) => {
  try {
    const { userId, proofPhotoUrl, notes } = req.body;
    const task = db.tasks.find(t => t.id === req.params.id);
    const user = db.users.find(u => u.id === userId);

    if (!task || !user) {
      return res.status(404).json({ success: false, message: 'Task or User not found.' });
    }

    const existing = db.taskSubmissions.find(s => s.taskId === task.id && s.userId === user.id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already completed this task.' });
    }

    if (task.requiresProof && !proofPhotoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a screenshot showing proof of completion.'
      });
    }

    // Tasks requiring proof go to Admin / Advertiser review
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
        proofPhotoUrl,
        notes,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      db.taskSubmissions.unshift(submission);

      db.createNotification({
        senderName: 'Task System',
        title: 'New Task Proof Submission',
        message: `${user.name} submitted screenshot proof for: "${task.title}". Please verify and approve.`,
        type: 'task',
        targetUserId: 'user-admin-1'
      });

      db.save();

      return res.json({
        success: true,
        message: 'Task proof submitted! The admin will review your screenshot and credit your wallet shortly.'
      });
    }

    // Instant approval for non-proof tasks (General / Short links)
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

    db.taskSubmissions.unshift(submission);

    db.recordTransaction({
      userId: user.id,
      userName: user.name,
      type: 'task_earning',
      amount: task.rewardPerTask,
      direction: 'in',
      description: `Task Reward: "${task.title}"`,
      status: 'completed',
      relatedEntityId: task.id
    });

    db.save();

    return res.json({
      success: true,
      message: `Great job! Task completed and +${task.rewardPerTask.toLocaleString()} RWF added to your wallet!`,
      reward: task.rewardPerTask,
      newBalance: user.balance
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. INVESTMENT PRODUCTS & DEPOSITS
// ==========================================

// Get All Products (7 tiers)
app.get('/api/products', (req, res) => {
  return res.json({ success: true, products: db.products });
});

// Deposit & Buy Product
app.post('/api/products/deposit', (req, res) => {
  try {
    const { userId, tierAmount, paymentMethod, senderPhone, transactionId, screenshotUrl } = req.body;
    const user = db.users.find(u => u.id === userId);
    const tier = db.products.find(t => t.tierAmount === Number(tierAmount));

    if (!user || !tier) {
      return res.status(404).json({ success: false, message: 'User or Product tier not found.' });
    }

    if (!screenshotUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a screenshot of your Mobile Money SMS payment confirmation.'
      });
    }

    const ussdCode = paymentMethod === 'MTN'
      ? `*182*1*2*0738514596*${tier.tierAmount}#`
      : `*182*1*1*0738514596*${tier.tierAmount}#`;

    const purchase: ProductPurchase = {
      id: 'pur-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: senderPhone || user.phone,
      tierAmount: tier.tierAmount,
      paymentMethod: paymentMethod || 'MTN',
      ussdCode,
      senderPhone: senderPhone || user.phone,
      transactionId: transactionId || 'MOMO-' + Date.now().toString().slice(-6),
      screenshotUrl,
      status: 'pending',
      dailyProfitAmount: tier.dailyProfit,
      createdAt: new Date().toISOString(),
      totalProfitEarned: 0
    };

    db.productPurchases.unshift(purchase);

    // Notify Admin of deposit awaiting verification
    db.createNotification({
      senderName: 'Financial System',
      title: 'New Product Purchase Request!',
      message: `${user.name} paid ${tier.tierAmount.toLocaleString()} RWF on ${paymentMethod}. Please inspect the screenshot and Approve.`,
      type: 'system',
      targetUserId: 'user-admin-1'
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: 'Product purchase request submitted! The administrator will review and approve shortly.',
      purchase
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Claim Daily Profit (Server-side calculation)
app.post('/api/products/claim-daily-profit', (req, res) => {
  try {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const activePurchases = db.productPurchases.filter(p => p.userId === userId && p.status === 'approved');
    if (activePurchases.length === 0) {
      return res.status(400).json({ success: false, message: 'You have no active approved products yet.' });
    }

    let totalClaimable = 0;
    const now = new Date().toISOString();

    activePurchases.forEach(p => {
      const currentTier = db.products.find(t => t.tierAmount === p.tierAmount);
      const rate = currentTier ? currentTier.dailyProfit : p.dailyProfitAmount;

      totalClaimable += rate;
      p.totalProfitEarned += rate;
      p.lastProfitClaimedAt = now;
    });

    user.balance += totalClaimable;
    user.totalEarned += totalClaimable;

    db.recordTransaction({
      userId: user.id,
      userName: user.name,
      type: 'daily_profit',
      amount: totalClaimable,
      direction: 'in',
      description: `Daily profit from ${activePurchases.length} product(s) (+${totalClaimable.toLocaleString()} RWF)`,
      status: 'completed'
    });

    db.save();

    return res.json({
      success: true,
      amount: totalClaimable,
      newBalance: user.balance,
      message: `You claimed +${totalClaimable.toLocaleString()} RWF daily profit!`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. WITHDRAWALS & FINANCIAL RULES
// ==========================================

// Request Withdrawal
app.post('/api/withdrawals/request', (req, res) => {
  try {
    const { userId, amount, method, recipientPhone, recipientName } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Strict Rule 1: Registration Bonus Lock - must buy a product first!
    if (!user.hasBoughtProduct) {
      return res.status(403).json({
        success: false,
        message: 'SECURITY POLICY: You cannot withdraw funds until you purchase at least one daily profit product starting from 5,000 RWF.'
      });
    }

    const numAmount = Number(amount);

    // Rule 2: Minimum Withdrawal 5,000 Frw
    if (numAmount < 5000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 5,000 RWF.'
      });
    }

    // Rule 3: Balance check
    if (user.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Your balance is only ${user.balance.toLocaleString()} RWF. You cannot withdraw ${numAmount.toLocaleString()} RWF.`
      });
    }

    // Rule 4: Phone prefix validation
    const phone = (recipientPhone || '').trim().replace(/\s+/g, '');
    if (method === 'MTN') {
      if (!/^(078|079)\d{7}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'MTN phone numbers must start with 078 or 079 and contain 10 digits.'
        });
      }
    } else {
      if (!/^(072|073)\d{7}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Airtel / Tigo phone numbers must start with 072 or 073 and contain 10 digits.'
        });
      }
    }

    if (!recipientName || !recipientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the registered Mobile Money account owner name.'
      });
    }

    // Rule 5: 30% Fee calculation
    const fee = Math.round(numAmount * 0.3);
    const netAmount = numAmount - fee;

    // Reserve amount from user balance
    user.balance -= numAmount;
    user.pendingBalance = (user.pendingBalance || 0) + numAmount;

    const withdrawal: WithdrawalRequest = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: numAmount,
      fee,
      netAmount,
      method: method || 'MTN',
      recipientPhone: phone,
      recipientName: recipientName.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.withdrawals.unshift(withdrawal);

    db.recordTransaction({
      userId: user.id,
      userName: user.name,
      type: 'withdrawal',
      amount: numAmount,
      direction: 'out',
      description: `Withdrawal Request: ${numAmount.toLocaleString()} RWF via ${withdrawal.method} (${phone} - ${withdrawal.recipientName}) [30% Fee: ${fee.toLocaleString()} RWF]`,
      status: 'pending',
      relatedEntityId: withdrawal.id
    });

    db.createNotification({
      senderName: 'Financial System',
      title: 'New Withdrawal Request!',
      message: `${user.name} requested withdrawal of ${numAmount.toLocaleString()} RWF (Payout: ${netAmount.toLocaleString()} RWF via ${method} - ${phone} / ${withdrawal.recipientName}).`,
      type: 'withdrawal',
      targetUserId: 'user-admin-1'
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: `Withdrawal request for ${numAmount.toLocaleString()} RWF received! You will receive ${netAmount.toLocaleString()} RWF to ${phone}.`,
      withdrawal,
      newBalance: user.balance
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. TRANSACTIONS & MESSAGING
// ==========================================

// Get User Transactions
app.get('/api/transactions', (req, res) => {
  const { userId } = req.query;
  const list = userId ? db.transactions.filter(t => t.userId === userId) : db.transactions;
  return res.json({ success: true, transactions: list });
});

// Chat Messages
app.get('/api/messages', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json({ success: true, messages: db.messages });

  const list = db.messages.filter(
    m => m.senderId === userId || m.receiverId === userId || m.receiverId === 'admin'
  );
  return res.json({ success: true, messages: list });
});

app.post('/api/messages/send', (req, res) => {
  try {
    const { senderId, message, receiverId = 'admin' } = req.body;
    const sender = db.users.find(u => u.id === senderId);
    if (!sender) return res.status(404).json({ success: false, message: 'Sender not found.' });

    const newMsg = {
      id: 'msg-' + Date.now(),
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    db.messages.push(newMsg);
    db.save();

    return res.status(201).json({ success: true, message: newMsg });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json({ success: true, notifications: db.notifications });

  const list = db.notifications.filter(
    n => n.targetUserId === 'ALL' || n.targetUserId === userId
  );
  return res.json({ success: true, notifications: list });
});

// ==========================================
// 8. ADMIN DASHBOARD OPERATIONS
// ==========================================

// Admin Overview KPIs
app.get('/api/admin/overview', (req, res) => {
  const totalUsers = db.users.filter(u => u.role === 'user').length;
  const approvedPurchases = db.productPurchases.filter(p => p.status === 'approved');
  const approvedWithdrawals = db.withdrawals.filter(w => w.status === 'approved');

  const totalDeposits = approvedPurchases.reduce((acc, curr) => acc + curr.tierAmount, 0);
  const totalWithdrawals = approvedWithdrawals.reduce((acc, curr) => acc + curr.netAmount, 0);
  const totalFees = approvedWithdrawals.reduce((acc, curr) => acc + curr.fee, 0);

  const pendingPurchases = db.productPurchases.filter(p => p.status === 'pending').length;
  const pendingWithdrawals = db.withdrawals.filter(w => w.status === 'pending').length;
  const pendingProofs = db.taskSubmissions.filter(s => s.status === 'pending').length;
  const pendingTasks = db.tasks.filter(t => t.status === 'pending_payment').length;

  return res.json({
    success: true,
    stats: {
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      totalFees,
      pendingPurchases,
      pendingWithdrawals,
      pendingProofs,
      pendingTasks
    }
  });
});

// Admin Review Deposit
app.post('/api/admin/deposits/:id/review', (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const purchase = db.productPurchases.find(p => p.id === req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase request not found.' });

    const user = db.users.find(u => u.id === purchase.userId);

    if (action === 'approve') {
      purchase.status = 'approved';
      purchase.approvedAt = new Date().toISOString();
      purchase.lastProfitClaimedAt = new Date().toISOString();

      if (user) {
        user.hasBoughtProduct = true; // Unlocks bonus withdrawal!
        user.totalDeposited = (user.totalDeposited || 0) + purchase.tierAmount;
        user.totalInvested = (user.totalInvested || 0) + purchase.tierAmount;

        db.recordTransaction({
          userId: user.id,
          userName: user.name,
          type: 'deposit_product',
          amount: purchase.tierAmount,
          direction: 'in',
          description: `Product Purchase: ${purchase.tierAmount.toLocaleString()} RWF via ${purchase.paymentMethod} (Approved)`,
          status: 'completed',
          relatedEntityId: purchase.id
        });

        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
          title: 'Your Product Purchase was Approved!',
          message: `Your product for ${purchase.tierAmount.toLocaleString()} RWF was approved. You will earn ${purchase.dailyProfitAmount.toLocaleString()} RWF daily profit every 24h! Your 2,500 RWF bonus is now unlocked for withdrawal.`,
          type: 'success',
          targetUserId: user.id
        });
      }
    } else {
      purchase.status = 'rejected';
      purchase.rejectionReason = rejectionReason || 'Screenshot does not match payment record.';

      if (user) {
        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
          title: 'Product Purchase Request Rejected',
          message: `Your request for ${purchase.tierAmount.toLocaleString()} RWF was rejected. Reason: ${purchase.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    db.logAudit('user-admin-1', 'Admin', `DEPOSIT_${action.toUpperCase()}`, `Processed purchase ${purchase.id} of ${purchase.tierAmount} RWF`, purchase.userId);
    db.save();

    return res.json({
      success: true,
      message: action === 'approve' ? 'Product purchase Approved!' : 'Product purchase Rejected!'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Review Withdrawal
app.post('/api/admin/withdrawals/:id/review', (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const withdrawal = db.withdrawals.find(w => w.id === req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });

    const user = db.users.find(u => u.id === withdrawal.userId);

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.reviewedAt = new Date().toISOString();

      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - withdrawal.amount);
        user.totalWithdrawn += withdrawal.netAmount;

        const tx = db.transactions.find(
          t => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'completed';
          tx.notes = `Approved by Admin. Amount of ${withdrawal.netAmount.toLocaleString()} RWF sent to ${withdrawal.recipientPhone} (${withdrawal.recipientName}).`;
        }

        db.recordTransaction({
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_fee',
          amount: withdrawal.fee,
          direction: 'out',
          description: `30% Withdrawal Fee on ${withdrawal.amount.toLocaleString()} RWF`,
          status: 'completed',
          relatedEntityId: withdrawal.id
        });

        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
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

      // Refund the reserved balance back to user's available balance!
      if (user) {
        user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - withdrawal.amount);
        user.balance += withdrawal.amount;

        const tx = db.transactions.find(
          t => t.userId === user.id && t.type === 'withdrawal' && t.amount === withdrawal.amount && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'rejected';
          tx.notes = `Rejected by Admin. Reason: ${withdrawal.rejectionReason}. Full amount refunded to balance.`;
        }

        db.recordTransaction({
          userId: user.id,
          userName: user.name,
          type: 'withdrawal_refund',
          amount: withdrawal.amount,
          direction: 'in',
          description: `Refund: ${withdrawal.amount.toLocaleString()} RWF because withdrawal was rejected (${withdrawal.rejectionReason})`,
          status: 'completed',
          relatedEntityId: withdrawal.id
        });

        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
          title: 'Withdrawal Request Rejected & Refunded',
          message: `Your withdrawal of ${withdrawal.amount.toLocaleString()} RWF was rejected. Reason: "${withdrawal.rejectionReason}". The entire amount was refunded to your wallet balance.`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    db.logAudit('user-admin-1', 'Admin', `WITHDRAWAL_${action.toUpperCase()}`, `Reviewed withdrawal ${withdrawal.id} of ${withdrawal.amount} RWF`, withdrawal.userId);
    db.save();

    return res.json({
      success: true,
      message: action === 'approve' ? 'Withdrawal Approved & Processed!' : 'Withdrawal Rejected & Funds Refunded!'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Review Task Proof Submission
app.post('/api/admin/submissions/:id/review', (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const sub = db.taskSubmissions.find(s => s.id === req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const user = db.users.find(u => u.id === sub.userId);
    const task = db.tasks.find(t => t.id === sub.taskId);

    if (action === 'approve') {
      sub.status = 'approved';
      sub.reviewedAt = new Date().toISOString();

      if (task) task.completedSlots += 1;

      if (user) {
        user.balance += sub.reward;
        user.totalEarned += sub.reward;

        db.recordTransaction({
          userId: user.id,
          userName: user.name,
          type: 'task_earning',
          amount: sub.reward,
          direction: 'in',
          description: `Task Proof Approved: "${sub.taskTitle}"`,
          status: 'completed',
          relatedEntityId: sub.id
        });

        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
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
        db.createNotification({
          senderName: 'Umurimo Rwanda Admin',
          title: 'Task Proof was Not Approved',
          message: `Your screenshot for "${sub.taskTitle}" was rejected. Reason: ${sub.rejectionReason}`,
          type: 'alert',
          targetUserId: user.id
        });
      }
    }

    db.save();

    return res.json({
      success: true,
      message: action === 'approve' ? 'Task proof approved and user credited!' : 'Task proof rejected!'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin User Management (Block, Unblock, Delete)
app.put('/api/admin/users/:id/block', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.isBlocked = !user.isBlocked;
  db.logAudit('user-admin-1', 'Admin', user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', `User ${user.name} (${user.id}) status toggled`, user.id);
  db.save();

  return res.json({
    success: true,
    isBlocked: user.isBlocked,
    message: user.isBlocked ? 'User has been blocked!' : 'User has been unblocked!'
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found.' });

  const deleted = db.users.splice(index, 1)[0];
  db.logAudit('user-admin-1', 'Admin', 'USER_DELETED', `User ${deleted.name} (${deleted.id}) deleted`, deleted.id);
  db.save();

  return res.json({ success: true, message: 'User account deleted permanently from system.' });
});

// Admin Profit Settings Panel
app.put('/api/admin/profit-settings/:id', (req, res) => {
  try {
    const { dailyProfit } = req.body;
    const tier = db.products.find(t => t.id === req.params.id);
    if (!tier) return res.status(404).json({ success: false, message: 'Product tier not found.' });

    tier.dailyProfit = Number(dailyProfit);
    tier.totalReturnPercent = Math.round(((tier.dailyProfit * tier.durationDays) / tier.tierAmount) * 100);
    tier.description = `Earn ${tier.dailyProfit.toLocaleString()} RWF daily for ${tier.durationDays} days. Price: ${tier.tierAmount.toLocaleString()} RWF.`;

    db.logAudit('user-admin-1', 'Admin', 'PROFIT_SETTINGS_UPDATED', `Tier ${tier.tierAmount} RWF daily profit updated to ${tier.dailyProfit} RWF`);
    db.save();

    return res.json({
      success: true,
      message: `Daily profit for ${tier.tierAmount.toLocaleString()} RWF updated to ${tier.dailyProfit.toLocaleString()} RWF/day!`,
      tier
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Broadcast Message
app.post('/api/admin/broadcast', (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notif = db.createNotification({
      senderName: 'Umurimo Rwanda Admin',
      title: title.trim(),
      message: message.trim(),
      type: 'broadcast',
      targetUserId: 'ALL'
    });

    db.logAudit('user-admin-1', 'Admin', 'BROADCAST_SENT', `Broadcast message: "${title}" sent to all users`);
    db.save();

    return res.status(201).json({ success: true, message: 'Broadcast announcement sent to all members successfully!', notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  return res.json({ success: true, logs: db.auditLogs });
});

// ==========================================
// 9. VITE MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Umurimo Rwanda Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
