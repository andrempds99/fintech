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
import { Plus, Target, Trash2, Edit } from "lucide-react";
import { goalsService, Goal } from "@/services/goals.service";
import { LoadingSkeleton } from "@/components/loading-skeleton";
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
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    category: "",
    targetDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

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

      setIsDialogOpen(false);
      setEditingGoal(null);
      setFormData({ name: "", targetAmount: "", currentAmount: "", category: "", targetDate: "" });
      await loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save goal");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleAddProgress = async (goal: Goal) => {
    const amount = prompt(`Add amount to "${goal.name}":`);
    if (!amount || isNaN(parseFloat(amount))) {
      return;
    }

    try {
      await goalsService.updateProgress(goal.id, parseFloat(amount));
      toast.success("Progress updated successfully");
      await loadGoals();
    } catch (error: any) {
      toast.error("Failed to update progress");
      console.error(error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track and manage your financial goals</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => {
            setEditingGoal(null);
            setFormData({ name: "", targetAmount: "", currentAmount: "", category: "", targetDate: "" });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Create/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoal ? 'Update your financial goal' : 'Set a new financial goal to track your progress'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="goal-name">Goal Name *</Label>
                <Input
                  id="goal-name"
                  name="goalName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="goal-category">Category *</Label>
                <Select
                  name="goalCategory"
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="goal-category" className="mt-1">
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
                <div>
                  <Label htmlFor="target-amount">Target Amount *</Label>
                  <Input
                    id="target-amount"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="current-amount">Current Amount</Label>
                  <Input
                    id="current-amount"
                    name="currentAmount"
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingGoal(null);
                }}
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

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="mb-4">Active Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;
              return (
                <Card key={goal.id} className="p-6 rounded-xl shadow-sm border border-border">
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
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

                    {goal.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddProgress(goal)}
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
              const progress = 100;
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
                      <Progress value={progress} className="h-2" />
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

      {goals.length === 0 && (
        <Card className="p-12 rounded-xl shadow-sm border border-border text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first financial goal to start tracking your progress
          </p>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </Card>
      )}
    </div>
  );
}

