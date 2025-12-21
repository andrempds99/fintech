import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, CheckCircle, Clock, Calendar, Trash2, Pause, Play } from "lucide-react";
import { accountService } from "@/services/account.service";
import { transferService } from "@/services/transfer.service";
import { transactionService } from "@/services/transaction.service";
import { scheduledTransfersService, ScheduledTransfer } from "@/services/scheduled-transfers.service";
import { Account, Transaction } from "@/lib/mock-data";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TransfersPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [transferType, setTransferType] = useState<'own' | 'other'>('own');
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transferStatus, setTransferStatus] = useState<'idle' | 'pending' | 'completed'>('idle');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [scheduledTransfers, setScheduledTransfers] = useState<ScheduledTransfer[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    frequency: "",
    nextExecutionDate: "",
    endDate: "",
    description: "",
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [completedTransferData, setCompletedTransferData] = useState<{
    fromAccountName: string;
    toAccountName: string;
    amount: string;
  } | null>(null);

  const activeAccounts = accounts.filter(acc => acc.status === 'active');

  useEffect(() => {
    loadAccounts();
    loadRecentTransfers();
    loadScheduledTransfers();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accountsData = await accountService.getActiveForTransfers();
      setAccounts(accountsData);
    } catch (error: any) {
      toast.error("Failed to load accounts");
      console.error(error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadRecentTransfers = async () => {
    try {
      const transfersData = await transactionService.getAll({
        category: 'transfer',
        limit: 10,
      });
      setRecentTransfers(transfersData?.transactions || []);
    } catch (error: any) {
      console.error("Failed to load recent transfers", error);
    }
  };

  const loadScheduledTransfers = async () => {
    try {
      const scheduled = await scheduledTransfersService.getAll();
      setScheduledTransfers(scheduled);
    } catch (error: any) {
      console.error("Failed to load scheduled transfers", error);
    }
  };

  const handleScheduleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleFormData.fromAccountId || !scheduleFormData.toAccountId || !scheduleFormData.amount || !scheduleFormData.frequency || !scheduleFormData.nextExecutionDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmittingSchedule(true);
      await scheduledTransfersService.create({
        fromAccountId: scheduleFormData.fromAccountId,
        toAccountId: scheduleFormData.toAccountId,
        amount: parseFloat(scheduleFormData.amount),
        frequency: scheduleFormData.frequency,
        nextExecutionDate: scheduleFormData.nextExecutionDate,
        endDate: scheduleFormData.endDate || undefined,
        description: scheduleFormData.description || undefined,
      });
      toast.success("Scheduled transfer created successfully");
      setIsScheduleDialogOpen(false);
      setScheduleFormData({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        frequency: "",
        nextExecutionDate: "",
        endDate: "",
        description: "",
      });
      await loadScheduledTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create scheduled transfer");
      console.error(error);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleToggleScheduledTransfer = async (transfer: ScheduledTransfer) => {
    try {
      await scheduledTransfersService.update(transfer.id, { isActive: !transfer.isActive });
      toast.success(`Scheduled transfer ${transfer.isActive ? 'paused' : 'resumed'}`);
      await loadScheduledTransfers();
    } catch (error: any) {
      toast.error("Failed to update scheduled transfer");
      console.error(error);
    }
  };

  const handleDeleteScheduledTransfer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled transfer?")) {
      return;
    }

    try {
      await scheduledTransfersService.delete(id);
      toast.success("Scheduled transfer deleted successfully");
      await loadScheduledTransfers();
    } catch (error: any) {
      toast.error("Failed to delete scheduled transfer");
      console.error(error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccount || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    if (transferType === 'own') {
      if (!toAccount) {
        toast.error("Please select a destination account");
        return;
      }
      if (fromAccount === toAccount) {
        toast.error("Cannot transfer to the same account");
        return;
      }
    } else {
      if (!toAccountNumber || toAccountNumber.trim() === '') {
        toast.error("Please enter a destination account number");
        return;
      }
    }

    try {
      setTransferStatus('pending');
      
      const transferAmount = parseFloat(amount);
      const fromAccountData = accounts.find(acc => acc.id === fromAccount);

      if (fromAccountData && transferAmount > fromAccountData.balance) {
        toast.error("Insufficient balance");
        setTransferStatus('idle');
        return;
      }

      const transferData: any = {
        fromAccountId: fromAccount,
        amount: transferAmount,
        description: note || undefined,
      };

      if (transferType === 'own') {
        transferData.toAccountId = toAccount;
        const toAccountData = accounts.find(acc => acc.id === toAccount);
        setCompletedTransferData({
          fromAccountName: fromAccountData?.name || "",
          toAccountName: toAccountData?.name || "",
          amount: amount,
        });
      } else {
        transferData.toAccountNumber = toAccountNumber.trim();
        setCompletedTransferData({
          fromAccountName: fromAccountData?.name || "",
          toAccountName: `Account ${toAccountNumber}`,
          amount: amount,
        });
      }

      const result = await transferService.create(transferData);

      setTransferStatus('completed');
      toast.success("Transfer completed successfully");
      
      // Refresh accounts to show updated balances and recent transfers
      await Promise.all([loadAccounts(), loadRecentTransfers()]);

      setTimeout(() => {
        setTransferStatus('idle');
        setFromAccount("");
        setToAccount("");
        setToAccountNumber("");
        setAmount("");
        setNote("");
        setTransferType('own');
        setCompletedTransferData(null);
      }, 3000);
    } catch (error: any) {
      setTransferStatus('idle');
      toast.error(error.response?.data?.message || "Failed to process transfer");
      console.error(error);
    }
  };

  if (isLoadingAccounts) {
    return <LoadingSkeleton />;
  }

  if (transferStatus === 'pending') {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="p-12 rounded-2xl shadow-lg border-0 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--warning)]/10 mb-4">
            <Clock className="h-8 w-8 text-[var(--warning)] animate-pulse" />
          </div>
          <h2 className="mb-2">Processing Transfer</h2>
          <p className="text-muted-foreground">
            Please wait while we process your transfer of ${amount || '0.00'}
          </p>
        </Card>
      </div>
    );
  }

  if (transferStatus === 'completed') {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="p-12 rounded-2xl shadow-lg border-0 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--positive)]/10 mb-4">
            <CheckCircle className="h-8 w-8 text-[var(--positive)]" />
          </div>
          <h2 className="mb-2">Transfer Completed</h2>
          <p className="text-muted-foreground mb-6">
            Successfully transferred ${completedTransferData?.amount || amount || '0.00'}
          </p>
          <div className="p-4 rounded-lg bg-muted text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From:</span>
              <span>{completedTransferData?.fromAccountName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To:</span>
              <span>{completedTransferData?.toAccountName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="text-[var(--positive)]">${completedTransferData?.amount}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Transfer Funds</h1>
          <p className="text-muted-foreground mt-1">Transfer money between your accounts</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => setIsScheduleDialogOpen(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Transfer
        </Button>
      </div>

      {/* Schedule Transfer Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Recurring Transfer</DialogTitle>
            <DialogDescription>
              Set up a recurring transfer that will execute automatically
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleTransfer}>
            <div className="space-y-5 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-from-account" className="text-sm font-medium">From Account *</Label>
                  <Select
                    name="scheduleFromAccount"
                    value={scheduleFormData.fromAccountId}
                    onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, fromAccountId: value })}
                    required
                  >
                    <SelectTrigger id="schedule-from-account" className="bg-input-background border-0 h-10">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAccounts.map((account) => {
                        const accountInfo = account as any;
                        const ownerInfo = accountInfo.user_name ? ` (${accountInfo.user_name})` : '';
                        return (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}{ownerInfo}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-to-account" className="text-sm font-medium">To Account *</Label>
                  <Select
                    name="scheduleToAccount"
                    value={scheduleFormData.toAccountId}
                    onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, toAccountId: value })}
                    required
                  >
                    <SelectTrigger id="schedule-to-account" className="bg-input-background border-0 h-10">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAccounts
                        .filter(acc => acc.id !== scheduleFormData.fromAccountId)
                        .map((account) => {
                          const accountInfo = account as any;
                          const ownerInfo = accountInfo.user_name ? ` (${accountInfo.user_name})` : '';
                          return (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}{ownerInfo}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-amount" className="text-sm font-medium">Amount *</Label>
                  <Input
                    id="schedule-amount"
                    name="scheduleAmount"
                    type="number"
                    step="0.01"
                    value={scheduleFormData.amount}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-input-background border-0 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-frequency" className="text-sm font-medium">Frequency *</Label>
                  <Select
                    name="scheduleFrequency"
                    value={scheduleFormData.frequency}
                    onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, frequency: value })}
                    required
                  >
                    <SelectTrigger id="schedule-frequency" className="bg-input-background border-0 h-10">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-next-date" className="text-sm font-medium">Next Execution Date *</Label>
                  <Input
                    id="schedule-next-date"
                    name="scheduleNextDate"
                    type="date"
                    value={scheduleFormData.nextExecutionDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, nextExecutionDate: e.target.value })}
                    className="bg-input-background border-0 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-end-date" className="text-sm font-medium">End Date (Optional)</Label>
                  <Input
                    id="schedule-end-date"
                    name="scheduleEndDate"
                    type="date"
                    value={scheduleFormData.endDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, endDate: e.target.value })}
                    className="bg-input-background border-0 h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-description" className="text-sm font-medium">Description (Optional)</Label>
                <Input
                  id="schedule-description"
                  name="scheduleDescription"
                  type="text"
                  value={scheduleFormData.description}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                  placeholder="e.g., Monthly savings transfer"
                  className="bg-input-background border-0 h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
                disabled={isSubmittingSchedule}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingSchedule}>
                {isSubmittingSchedule ? "Creating..." : "Schedule Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <Card className="lg:col-span-2 p-6 rounded-xl shadow-sm border border-border">
          <form onSubmit={handleTransfer} className="space-y-6">
            <div>
              <Label htmlFor="from-account">From Account</Label>
              <Select name="fromAccount" value={fromAccount} onValueChange={setFromAccount} required>
                <SelectTrigger id="from-account" className="mt-1 bg-input-background border-0 h-12">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => {
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - ${account.balance.toLocaleString()}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-type" className="text-sm font-medium">Transfer Type</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant={transferType === 'own' ? 'default' : 'outline'}
                  className={`flex-1 h-10 ${transferType === 'own' ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''}`}
                  onClick={() => {
                    setTransferType('own');
                    setToAccount("");
                    setToAccountNumber("");
                  }}
                >
                  To my account
                </Button>
                <Button
                  type="button"
                  variant={transferType === 'other' ? 'default' : 'outline'}
                  className={`flex-1 h-10 ${transferType === 'other' ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''}`}
                  onClick={() => {
                    setTransferType('other');
                    setToAccount("");
                    setToAccountNumber("");
                  }}
                >
                  To another account
                </Button>
              </div>
            </div>

            {transferType === 'own' ? (
              <div>
                <Label htmlFor="to-account">To Account</Label>
                <Select name="toAccount" value={toAccount} onValueChange={setToAccount} required>
                  <SelectTrigger id="to-account" className="mt-1 bg-input-background border-0 h-12">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts
                      .filter(acc => acc.id !== fromAccount)
                      .map((account) => {
                        return (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} - ${account.balance.toLocaleString()}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="to-account-number">To Account Number</Label>
                <Input
                  id="to-account-number"
                  name="toAccountNumber"
                  type="text"
                  placeholder="Enter account number (e.g., ****1234 or 1234)"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  className="mt-1 bg-input-background border-0 h-12"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the full account number (****1234) or just the last 4 digits
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 bg-input-background border-0 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                name="note"
                type="text"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 bg-input-background border-0 h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-slate-900 hover:bg-slate-800"
              disabled={
                !fromAccount || 
                !amount || 
                (transferType === 'own' && (!toAccount || fromAccount === toAccount)) ||
                (transferType === 'other' && !toAccountNumber.trim())
              }
            >
              Transfer ${amount || '0.00'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </Card>

        {/* Transfer Summary */}
        <Card className="p-6 rounded-xl shadow-sm border border-border h-fit">
          <h3 className="mb-4">Transfer Summary</h3>
          <div className="space-y-4">
            {fromAccount && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p>{activeAccounts.find(acc => acc.id === fromAccount)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Available: ${activeAccounts.find(acc => acc.id === fromAccount)?.balance.toLocaleString()}
                </p>
              </div>
            )}

            {(toAccount || toAccountNumber) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">To</p>
                {transferType === 'own' && toAccount ? (
                  <>
                    <p>{activeAccounts.find(acc => acc.id === toAccount)?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Balance: ${activeAccounts.find(acc => acc.id === toAccount)?.balance.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p>Account {toAccountNumber || 'N/A'}</p>
                )}
              </div>
            )}

            {amount && (
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transfer Amount</span>
                  <span>${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${parseFloat(amount || '0').toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs for Recent and Scheduled Transfers */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Transfers</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Transfers</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <Card className="p-6 rounded-xl shadow-sm border border-border">
            <h3 className="mb-4">Recent Transfers</h3>
            <div className="space-y-3">
              {recentTransfers.length > 0 ? (
                recentTransfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p>{transfer.merchant}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transfer.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <p className={transfer.amount < 0 ? "text-[var(--negative)]" : "text-[var(--positive)]"}>
                      {transfer.amount < 0 ? "" : "+"}${Math.abs(transfer.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent transfers</p>
              )}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="scheduled">
          <Card className="p-6 rounded-xl shadow-sm border border-border">
            <h3 className="mb-4">Scheduled Transfers</h3>
            <div className="space-y-3">
              {scheduledTransfers.length > 0 ? (
                scheduledTransfers.map((transfer) => (
                  <div key={transfer.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            ${transfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant={transfer.isActive ? "default" : "outline"}>
                            {transfer.isActive ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transfer.fromAccountName || 'Unknown'} → {transfer.toAccountName || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Frequency: {transfer.frequency} • Next: {new Date(transfer.nextExecutionDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        {transfer.description && (
                          <p className="text-xs text-muted-foreground">{transfer.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleScheduledTransfer(transfer)}
                        >
                          {transfer.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScheduledTransfer(transfer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No scheduled transfers</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
