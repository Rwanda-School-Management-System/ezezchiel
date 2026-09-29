import React, { useState } from 'react';
import { ProductPurchase, WithdrawalRequest } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Phone,
  AlertTriangle,
  Layers,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminFinancialApprovals: React.FC = () => {
  const purchases = store.getPurchases();
  const withdrawals = store.getWithdrawals();

  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<{
    id: string;
    type: 'purchase' | 'withdrawal';
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingPurchases = purchases.filter((p) => p.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const handleApprovePurchase = (id: string) => {
    store.reviewProductPurchase(id, 'approve');
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleApproveWithdrawal = (id: string) => {
    store.reviewWithdrawal(id, 'approve');
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    if (rejectingItem.type === 'purchase') {
      store.reviewProductPurchase(rejectingItem.id, 'reject', rejectionReason);
    } else {
      store.reviewWithdrawal(rejectingItem.id, 'reject', rejectionReason);
    }

    setRejectingItem(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 pb-3 gap-3">
        <button
          onClick={() => setActiveSubTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product Deposits ({pendingPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'withdrawals'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Withdrawal Requests ({pendingWithdrawals.length})</span>
        </button>
      </div>

      {/* 1. DEPOSITS & PRODUCT PURCHASES TAB */}
      {activeSubTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Pending Product Purchases ({pendingPurchases.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click "View Full Screenshot" to inspect the SMS payment confirmation before approving.
            </span>
          </div>

          {pendingPurchases.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              No pending product purchases or deposits at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">
                        {purchase.userName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {purchase.senderPhone} ({purchase.paymentMethod})
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                      {purchase.tierAmount.toLocaleString()} RWF
                    </span>
                  </div>

                  {/* USSD & Transaction ID */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono text-slate-400">
                    <div>USSD: <span className="text-amber-300 font-semibold">{purchase.ussdCode}</span></div>
                    <div>SMS Tx ID: <span className="text-slate-200 font-bold">{purchase.transactionId}</span></div>
                    <div>Daily Profit: <span className="text-emerald-400 font-bold">+{purchase.dailyProfitAmount.toLocaleString()} RWF/day</span></div>
                  </div>

                  {/* Screenshot Thumbnail Preview */}
                  <div className="flex items-center gap-3">
                    <img
                      src={purchase.screenshotUrl}
                      alt="SMS Screenshot"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedScreenshot(purchase.screenshotUrl)}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedScreenshot(purchase.screenshotUrl)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Screenshot</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleApprovePurchase(purchase.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() =>
                        setRejectingItem({
                          id: purchase.id,
                          type: 'purchase',
                          title: `Product purchase by ${purchase.userName} (${purchase.tierAmount.toLocaleString()} RWF)`
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. WITHDRAWALS TAB */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Pending Withdrawal Requests ({pendingWithdrawals.length})
            </h3>
            <span className="text-xs text-slate-400">
              30% platform fee is deducted automatically. Confirm phone and registered owner name before paying.
            </span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              No pending withdrawal requests at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{w.userName}</span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Account ID: {w.userId}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Requested Amount</span>
                      <span className="font-mono font-bold text-xs text-slate-200">
                        {w.amount.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown card: Net to send vs Fee */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-rose-400 font-mono text-[11px]">
                      <span>Platform Fee (30%):</span>
                      <span>+{w.fee.toLocaleString()} RWF</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-emerald-400 text-sm">
                      <span>Net Mobile Money Payout (70%):</span>
                      <span className="font-mono text-base">{w.netAmount.toLocaleString()} RWF</span>
                    </div>
                  </div>

                  {/* Recipient details */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Method:</span>
                      <span className="font-bold text-amber-300">{w.method} Mobile Money</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recipient Phone:</span>
                      <span className="font-mono font-bold text-slate-100">{w.recipientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered Name:</span>
                      <span className="font-semibold text-emerald-300">{w.recipientName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleApproveWithdrawal(w.id)}
                    >
                      Approve & Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() =>
                        setRejectingItem({
                          id: w.id,
                          type: 'withdrawal',
                          title: `Withdrawal by ${w.userName} (${w.amount.toLocaleString()} RWF)`
                        })
                      }
                    >
                      Reject with Reason
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {selectedScreenshot && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedScreenshot(null)}
          title="Payment Confirmation Screenshot"
          maxWidth="lg"
        >
          <div className="flex flex-col items-center">
            <img
              src={selectedScreenshot}
              alt="Screenshot Full"
              className="max-h-[70vh] rounded-xl object-contain border border-slate-700 shadow-2xl"
            />
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => setSelectedScreenshot(null)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Rejection Modal with Mandatory Note / Reason */}
      {rejectingItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingItem(null)}
          title={`Reject: ${rejectingItem.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Note: If a withdrawal is rejected, the reserved funds are immediately refunded to the user's available balance, and an alert is sent explaining the reason.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Rejection Note / Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Example: The phone number was mistyped or the name does not match Mobile Money records..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setRejectingItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" className="flex-1">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
