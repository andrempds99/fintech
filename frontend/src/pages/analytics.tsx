import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { analyticsService } from "@/services/analytics.service";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export function AnalyticsPage() {
  const [incomeExpensesData, setIncomeExpensesData] = useState<any[]>([]);
  const [spendingByCategoryData, setSpendingByCategoryData] = useState<any[]>([]);
  const [balanceTrendData, setBalanceTrendData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netBalance: 0,
  });
  const [topCategory, setTopCategory] = useState({ name: "N/A", amount: 0 });
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [incomeExpenses, spendingData, balanceTrend, summaryData, predictionsData] = await Promise.all([
        analyticsService.getIncomeExpenses(6),
        analyticsService.getSpendingByCategory(),
        analyticsService.getBalanceTrend(6),
        analyticsService.getSummary(),
        analyticsService.getSpendingPredictions(3),
      ]);

      setIncomeExpensesData(incomeExpenses || []);
      setBalanceTrendData(balanceTrend || []);
      setSummary(summaryData || {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        netBalance: 0,
      });
      
      // Process spending by category with colors
      const processedSpending = (spendingData || []).map((s: any) => ({
        category: s.category,
        amount: parseFloat(s.amount || 0),
        fill: `var(--chart-${Math.floor(Math.random() * 5) + 1})`,
      }));
      setSpendingByCategoryData(processedSpending);
      setPredictions(predictionsData || []);
      
      // Find top category
      if (processedSpending.length > 0) {
        const top = processedSpending.reduce((max, cat) => 
          cat.amount > max.amount ? cat : max
        );
        setTopCategory({ name: top.category, amount: top.amount });
      } else {
        setTopCategory({ name: "N/A", amount: 0 });
      }
    } catch (error: any) {
      toast.error("Failed to load analytics data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Calculate savings rate
  const savingsRate = summary.monthlyIncome > 0 
    ? ((summary.monthlyIncome - summary.monthlyExpenses) / summary.monthlyIncome * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Detailed financial analytics and insights</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadAnalytics}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert className="border-[var(--positive)]/20 bg-[var(--positive)]/5">
          <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
          <AlertDescription className="text-[var(--positive)]">
            You're on track with your budget this month! Keep up the good work.
          </AlertDescription>
        </Alert>

        <Alert className="border-[var(--warning)]/20 bg-[var(--warning)]/5">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
          <AlertDescription className="text-[var(--warning)]">
            Shopping expenses are 15% higher than last month.
          </AlertDescription>
        </Alert>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <TrendingUp className="h-4 w-4 text-[var(--positive)]" />
          </div>
          <h3 className="text-2xl mb-1">
            ${summary.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-sm text-[var(--positive)]">Current month</p>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
            <TrendingDown className="h-4 w-4 text-[var(--negative)]" />
          </div>
          <h3 className="text-2xl mb-1">
            ${summary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-sm text-[var(--negative)]">Current month</p>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Savings Rate</p>
            <TrendingUp className="h-4 w-4 text-[var(--positive)]" />
          </div>
          <h3 className="text-2xl mb-1">{savingsRate}%</h3>
          <p className={`text-sm ${parseFloat(savingsRate) >= 20 ? 'text-[var(--positive)]' : 'text-[var(--warning)]'}`}>
            {parseFloat(savingsRate) >= 20 ? 'Good savings rate' : 'Could improve'}
          </p>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Top Category</p>
          </div>
          <h3 className="text-2xl mb-1 capitalize">{topCategory.name || "N/A"}</h3>
          <p className="text-sm text-muted-foreground">
            ${topCategory.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} total
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            {incomeExpensesData.length > 0 ? (
              <BarChart data={incomeExpensesData}>
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
                <Legend />
                <Bar dataKey="income" fill="var(--positive)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--negative)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Balance Growth */}
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Balance Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            {balanceTrendData.length > 0 ? (
              <LineChart data={balanceTrendData}>
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
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="var(--chart-2)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--chart-2)', r: 4 }}
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Monthly Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            {spendingByCategoryData.length > 0 ? (
              <PieChart>
                <Pie
                  data={spendingByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {spendingByCategoryData.map((entry, index) => (
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

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">Category Details</h3>
          <div className="space-y-4">
            {spendingByCategoryData.length > 0 ? (
              spendingByCategoryData.map((category, index) => {
                const total = spendingByCategoryData.reduce((sum, cat) => sum + cat.amount, 0);
                const percentage = total > 0 ? (category.amount / total * 100).toFixed(1) : "0";
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.fill }}
                        />
                        <span className="capitalize">{category.category}</span>
                      </div>
                      <span>${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          backgroundColor: category.fill,
                          width: `${percentage}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage}% of total</p>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">No category data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Spending Predictions */}
      {predictions.length > 0 && (
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <h3 className="mb-6">AI-Powered Spending Predictions (Next Month)</h3>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="capitalize font-medium">{prediction.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <span className="text-lg font-medium">
                    ${prediction.predictedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on average spending over the last 3 months
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-[var(--info)]/10 border border-[var(--info)]/20">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Predictions are based on historical spending patterns. 
              Actual spending may vary based on your behavior.
            </p>
          </div>
        </Card>
      )}

      {/* Financial Goals */}
      <Card className="p-6 rounded-xl shadow-sm border border-border">
        <h3 className="mb-6">Financial Goals Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>Emergency Fund</p>
              <Badge className="bg-[var(--positive)] text-white">On Track</Badge>
            </div>
            <div className="mb-2">
              <p className="text-2xl">$15,000</p>
              <p className="text-sm text-muted-foreground">of $20,000 goal</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--positive)] rounded-full transition-all"
                style={{ width: '75%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p>Vacation Savings</p>
              <Badge className="bg-[var(--info)] text-white">Active</Badge>
            </div>
            <div className="mb-2">
              <p className="text-2xl">$3,200</p>
              <p className="text-sm text-muted-foreground">of $5,000 goal</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--info)] rounded-full transition-all"
                style={{ width: '64%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p>Investment Portfolio</p>
              <Badge className="bg-[var(--positive)] text-white">Excellent</Badge>
            </div>
            <div className="mb-2">
              <p className="text-2xl">$125,340</p>
              <p className="text-sm text-muted-foreground">+8.2% this year</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)] rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
