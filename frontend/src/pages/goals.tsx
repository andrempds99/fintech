import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Target, Trash2, Edit, TrendingUp } from "lucide-react";
import { goalsService, Goal } from "@/services/goals.service";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

const goalCategories = [
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'down_payment', label: 'Down Payment' },
  { value: 'debt_payoff', label: 'Debt Payoff' },
  { value: 'education', label: 'Education' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'other', label: 'Other' },
];

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    category: "",
    targetDate: "",
  });
  const [progressAmount, setProgressAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProgressSubmitting, setIsProgressSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    console.log('[Goals] isDialogOpen state changed to:', isDialogOpen);
  }, [isDialogOpen]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const goalsData = await goalsService.getAll();
      setGoals(goalsData);
    } catch (error: any) {
      toast.error("Failed to load goals");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const goalData: any = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        category: formData.category,
      };

      if (formData.currentAmount) {
        goalData.currentAmount = parseFloat(formData.currentAmount);
      }

      if (formData.targetDate) {
        goalData.targetDate = formData.targetDate;
      }

      if (editingGoal) {
        await goalsService.update(editingGoal.id, goalData);
        toast.success("Goal updated successfully");
      } else {
        await goalsService.create(goalData);
        toast.success("Goal created successfully");
      }

      handleCloseDialog();
      await loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save goal");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[Goals] handleOpenDialog called');
    console.log('[Goals] Current isDialogOpen state:', isDialogOpen);
    setEditingGoal(null);
    setFormData({ name: "", targetAmount: "", currentAmount: "", category: "", targetDate: "" });
    // Use a small timeout to ensure the click event has fully processed
    setTimeout(() => {
      setIsDialogOpen(true);
      console.log('[Goals] setIsDialogOpen(true) called');
    }, 10);
  };

  const handleCloseDialog = () => {
    console.log('[Goals] handleCloseDialog called');
    setIsDialogOpen(false);
    setEditingGoal(null);
    setFormData({ name: "", targetAmount: "", currentAmount: "", category: "", targetDate: "" });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      category: goal.category,
      targetDate: goal.targetDate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      await goalsService.delete(id);
      toast.success("Goal deleted successfully");
      await loadGoals();
    } catch (error: any) {
      toast.error("Failed to delete goal");
      console.error(error);
    }
  };

  const handleOpenProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressAmount("");
    setIsProgressDialogOpen(true);
  };

  const handleCloseProgressDialog = () => {
    setIsProgressDialogOpen(false);
    setSelectedGoal(null);
    setProgressAmount("");
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal || !progressAmount || isNaN(parseFloat(progressAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsProgressSubmitting(true);
      await goalsService.updateProgress(selectedGoal.id, parseFloat(progressAmount));
      toast.success("Progress updated successfully");
      handleCloseProgressDialog();
      await loadGoals();
    } catch (error: any) {
      toast.error("Failed to update progress");
      console.error(error);
    } finally {
      setIsProgressSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track and manage your financial goals</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={(e) => {
            console.log('[Goals] Button clicked!');
            handleOpenDialog(e);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Financial Goals Progress */}
      <Card className="p-6 rounded-xl shadow-sm border border-border">
        <h3 className="mb-6">Financial Goals Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeGoals.length > 0 ? (
            activeGoals.slice(0, 3).map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const isOnTrack = progress >= 75;
              const isActive = progress >= 50 && progress < 75;
              
              let badgeClass = "bg-[var(--info)] text-white";
              let badgeText = "Active";
              
              if (isCompleted) {
                badgeClass = "bg-[var(--positive)] text-white";
                badgeText = "Excellent";
              } else if (isOnTrack) {
                badgeClass = "bg-[var(--positive)] text-white";
                badgeText = "On Track";
              } else if (isActive) {
                badgeClass = "bg-[var(--info)] text-white";
                badgeText = "Active";
              }

              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p>{goal.name}</p>
                    <Badge className={badgeClass}>{badgeText}</Badge>
                  </div>
                  <div className="mb-2">
                    <p className="text-2xl">${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground">of ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} goal</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)]' 
                          : isOnTrack 
                            ? 'bg-[var(--positive)]' 
                            : 'bg-[var(--info)]'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p>No goals yet</p>
                  <Badge className="bg-[var(--info)] text-white">Active</Badge>
                </div>
                <div className="mb-2">
                  <p className="text-2xl">$0.00</p>
                  <p className="text-sm text-muted-foreground">Create your first goal</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--info)] rounded-full transition-all"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
              <div></div>
              <div></div>
            </>
          )}
        </div>
      </Card>

      {/* Create/Edit Goal Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log('[Goals] Dialog onOpenChange called with:', open);
          console.log('[Goals] Current isDialogOpen:', isDialogOpen);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoal ? 'Update your financial goal' : 'Set a new financial goal to track your progress'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal}>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="goal-name" className="text-sm font-medium">Goal Name *</Label>
                <Input
                  id="goal-name"
                  name="goalName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className="bg-input-background border-0 h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-category" className="text-sm font-medium">Category *</Label>
                <Select
                  name="goalCategory"
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="goal-category" className="bg-input-background border-0 h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-amount" className="text-sm font-medium">Target Amount *</Label>
                  <Input
                    id="target-amount"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                    className="bg-input-background border-0 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-amount" className="text-sm font-medium">Current Amount</Label>
                  <Input
                    id="current-amount"
                    name="currentAmount"
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0.00"
                    className="bg-input-background border-0 h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date" className="text-sm font-medium">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="bg-input-background border-0 h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Progress Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Progress</DialogTitle>
            <DialogDescription>
              Add amount to "{selectedGoal?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProgress}>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="progress-amount" className="text-sm font-medium">Amount *</Label>
                <Input
                  id="progress-amount"
                  name="progressAmount"
                  type="number"
                  step="0.01"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-input-background border-0 h-10"
                  required
                  autoFocus
                />
              </div>
              {selectedGoal && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium">${selectedGoal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-medium">${selectedGoal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  {progressAmount && !isNaN(parseFloat(progressAmount)) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">New Total</p>
                      <p className="font-medium text-lg">
                        ${(selectedGoal.currentAmount + parseFloat(progressAmount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseProgressDialog}
                disabled={isProgressSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProgressSubmitting}>
                {isProgressSubmitting ? "Adding..." : "Add Progress"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="mb-4">Active Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              
              return (
                <Card key={goal.id} className="p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-[var(--positive)]" />
                        <h3>{goal.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {goalCategories.find(c => c.value === goal.category)?.label || goal.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        title="Edit goal"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        title="Delete goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="text-lg font-medium">${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="text-lg font-medium">${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    {remaining > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining
                        </p>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="pt-2 border-t border-border">
                        <Badge className="bg-[var(--positive)] text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Goal Achieved!
                        </Badge>
                      </div>
                    )}

                    {goal.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenProgressDialog(goal)}
                    >
                      Add Progress
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="mb-4">Completed Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => {
              return (
                <Card key={goal.id} className="p-6 rounded-xl shadow-sm border border-border opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-[var(--positive)]" />
                        <h3>{goal.name}</h3>
                      </div>
                      <Badge className="bg-[var(--positive)] text-white">Completed</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Achieved</p>
                        <p className="text-lg font-medium">${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="text-lg font-medium">${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create your first financial goal to start tracking your progress"
          actionLabel="Create Goal"
          onAction={handleOpenDialog}
        />
      )}
    </div>
  );
}
