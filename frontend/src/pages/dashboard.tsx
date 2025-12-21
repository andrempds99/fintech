import { useEffect, useState } from "react";
import { KPICard } from "@/components/kpi-card";
import { AccountCard } from "@/components/account-card";
import { TransactionRow } from "@/components/transaction-row";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, PiggyBank } from "lucide-react";
import { accountService } from "@/services/account.service";
import { transactionService } from "@/services/transaction.service";
import { analyticsService } from "@/services/analytics.service";
import { Account, Transaction } from "@/lib/mock-data";
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
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";

interface DashboardPageProps {
  onPageChange?: (page: string) => void;
}

export function DashboardPage({ onPageChange }: DashboardPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceTrend, setBalanceTrend] = useState<any[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, transactionsData, balanceTrendData, spendingData, summaryData] = await Promise.all([
        accountService.getAll(),
        transactionService.getAll({ limit: 6 }),
        analyticsService.getBalanceTrend(6),
        analyticsService.getSpendingByCategory(),
        analyticsService.getSummary(),
      ]);

      setAccounts(accountsData || []);
      setTransactions(transactionsData?.transactions || []);
      setBalanceTrend(balanceTrendData || []);
      const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
      setSpendingByCategory((spendingData || []).map((s: any, index: number) => ({
        category: s.category,
        amount: parseFloat(s.amount || 0),
        fill: chartColors[index % chartColors.length],
      })));
      setSummary(summaryData || {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        netBalance: 0,
      });
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeAccounts = accounts.filter(acc => acc.status === 'active');
  const featuredAccount = activeAccounts.find(acc => acc.isHighlighted) || activeAccounts[0];

  return (
    <div className="space-y-6">
      {/* Hero Balance Card */}
      {featuredAccount && <AccountCard account={featuredAccount} featured />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          className="h-14 bg-slate-900 hover:bg-slate-800 justify-start px-6"
          onClick={() => onPageChange?.('transfers')}
        >
          <ArrowUpRight className="h-5 w-5 mr-3" />
          <span>New Transfer</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-14 justify-start px-6"
          onClick={() => onPageChange?.('accounts')}
        >
          <PiggyBank className="h-5 w-5 mr-3" />
          <span>Add Account</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Monthly Income"
          value={`$${summary.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={8.2}
          icon={<TrendingUp className="h-6 w-6 text-[var(--positive)]" />}
        />
        <KPICard
          title="Monthly Expenses"
          value={`$${summary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={-3.5}
          icon={<ArrowDownRight className="h-6 w-6 text-[var(--negative)]" />}
        />
        <KPICard
          title="Net Balance"
          value={`$${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={12.4}
          icon={<DollarSign className="h-6 w-6 text-[var(--info)]" />}
        />
      </div>

      {/* Account Summary Cards */}
      <div>
        <h3 className="mb-4">Your Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAccounts.slice(1).map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Trend Chart */}
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Balance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            {balanceTrend.length > 0 ? (
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorBalance)" 
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
            {spendingByCategory.length > 0 && spendingByCategory.some((s: any) => s.amount > 0) ? (
              <PieChart>
                <Pie
                  data={spendingByCategory.filter((s: any) => s.amount > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {spendingByCategory.filter((s: any) => s.amount > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || `var(--chart-${(index % 5) + 1})`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
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
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Transactions</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-1">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
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
