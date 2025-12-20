import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { accountService } from "@/services/account.service";
import { analyticsService } from "@/services/analytics.service";
import { transactionService } from "@/services/transaction.service";
import { Account, Transaction } from "@/lib/mock-data";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { TransactionRow } from "@/components/transaction-row";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balanceTrend, setBalanceTrend] = useState<any[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    currency: "USD",
    limit: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusColors = {
    active: 'bg-[var(--positive)] text-white',
    suspended: 'bg-[var(--warning)] text-white',
    closed: 'bg-muted text-muted-foreground'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, balanceTrendData, spendingData, transactionsData] = await Promise.all([
        accountService.getAll(),
        analyticsService.getBalanceTrend(6),
        analyticsService.getSpendingByCategory(),
        transactionService.getAll({ limit: 5 }),
      ]);

      setAccounts(accountsData || []);
      setBalanceTrend(balanceTrendData || []);
      setSpendingByCategory((spendingData || []).map((s: any) => ({
        category: s.category,
        amount: s.amount,
        fill: `var(--chart-${Math.floor(Math.random() * 5) + 1})`,
      })));
      setRecentTransactions(transactionsData?.transactions || []);
    } catch (error: any) {
      toast.error("Failed to load accounts data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const accountData: any = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
      };

      if (formData.limit) {
        accountData.limit = parseFloat(formData.limit);
      }

      await accountService.create(accountData);
      toast.success("Account created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", type: "", currency: "USD", limit: "" });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeAccounts = accounts.filter(acc => acc.status === 'active');
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLimit = activeAccounts
    .filter(acc => acc.limit)
    .reduce((sum, acc) => sum + (acc.limit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Accounts & Wallets</h1>
          <p className="text-muted-foreground mt-1">Manage your accounts and view details</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to manage your finances
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="account-name">Account Name *</Label>
                <Input
                  id="account-name"
                  name="accountName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Savings Account"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account-type">Account Type *</Label>
                <Select
                  name="accountType"
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger id="account-type" className="mt-1">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account-currency">Currency</Label>
                <Select
                  name="accountCurrency"
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="account-currency" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account-limit">Transaction Limit (Optional)</Label>
                <Input
                  id="account-limit"
                  name="accountLimit"
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="e.g., 10000"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accounts Grid */}
      <div className="grid gap-4">
        {accounts.length > 0 ? (
          accounts.map((account) => (
          <Card key={account.id} className="p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3>{account.name}</h3>
                  <Badge className={statusColors[account.status]}>
                    {account.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{account.type} • {account.accountNumber}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Balance</p>
                    <p className="text-xl">
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Currency</p>
                    <p>{account.currency}</p>
                  </div>
                  {account.limit && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Transaction Limit</p>
                      <p>${account.limit.toLocaleString('en-US')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                    <p>{account.accountNumber}</p>
                  </div>
                </div>
              </div>

            </div>
          </Card>
          ))
        ) : (
          <Card className="p-6 rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground text-center py-4">No accounts found. Create your first account to get started.</p>
          </Card>
        )}
      </div>

      {/* Account Summary */}
      <Card className="p-6 rounded-xl shadow-sm border border-border">
        <h3 className="mb-4">Account Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Active Accounts</p>
            <p className="text-2xl">{activeAccounts.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-2xl">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Limit</p>
            <p className="text-2xl">
              ${totalLimit.toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Trend Chart */}
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Balance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            {balanceTrend.length > 0 ? (
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="colorBalanceAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="var(--chart-1)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBalanceAccounts)" 
                />
              </AreaChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No balance trend data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Spending by Category */}
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            {spendingByCategory.length > 0 ? (
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No spending data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 rounded-xl shadow-sm border border-border">
        <h3 className="mb-4">Recent Transactions</h3>
        <div className="space-y-1">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent transactions</p>
          )}
        </div>
      </Card>
    </div>
  );
}
