import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Bell, Trash2, AlertCircle } from "lucide-react";
import { alertsService, Alert } from "@/services/alerts.service";
import { accountService } from "@/services/account.service";
import { Account } from "@/lib/mock-data";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "",
    type: "",
    threshold: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [alertsData, accountsData] = await Promise.all([
        alertsService.getAll(),
        accountService.getAll(),
      ]);
      setAlerts(alertsData);
      setAccounts(accountsData);
    } catch (error: any) {
      toast.error("Failed to load alerts");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.type || !formData.threshold) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await alertsService.create({
        accountId: formData.accountId,
        type: formData.type,
        threshold: parseFloat(formData.threshold),
      });
      toast.success("Alert created successfully");
      setIsDialogOpen(false);
      setFormData({ accountId: "", type: "", threshold: "" });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create alert");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    try {
      await alertsService.update(alert.id, { isActive: !alert.isActive });
      toast.success(`Alert ${alert.isActive ? 'deactivated' : 'activated'}`);
      await loadData();
    } catch (error: any) {
      toast.error("Failed to update alert");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      await alertsService.delete(id);
      toast.success("Alert deleted successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to delete alert");
      console.error(error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeAccounts = accounts.filter(acc => acc.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage your account alerts and notifications</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>
              Set up an alert to be notified about account activity
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAlert}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="alert-account">Account *</Label>
                <Select
                  name="alertAccount"
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  required
                >
                  <SelectTrigger id="alert-account" className="mt-1">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alert-type">Alert Type *</Label>
                <Select
                  name="alertType"
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger id="alert-type" className="mt-1">
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_balance">Low Balance</SelectItem>
                    <SelectItem value="large_transaction">Large Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alert-threshold">Threshold ($) *</Label>
                <Input
                  id="alert-threshold"
                  name="alertThreshold"
                  type="number"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.type === 'low_balance' 
                    ? 'Alert when balance falls below this amount'
                    : 'Alert when transaction exceeds this amount'}
                </p>
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
                {isSubmitting ? "Creating..." : "Create Alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const account = accounts.find(acc => acc.id === alert.accountId);
            return (
              <Card key={alert.id} className="p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
                      <h3 className="capitalize">{alert.type.replace('_', ' ')}</h3>
                      <Badge variant={alert.isActive ? "default" : "outline"}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {account?.name || alert.accountName} • {account?.accountNumber || alert.accountNumber}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Threshold</p>
                        <p className="text-lg font-medium">
                          ${alert.threshold.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      {account && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                          <p className="text-lg font-medium">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${alert.id}`} className="text-sm">Active</Label>
                        <Switch
                          id={`toggle-${alert.id}`}
                          checked={alert.isActive}
                          onCheckedChange={() => handleToggleActive(alert)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 rounded-xl shadow-sm border border-border text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No alerts yet</h3>
          <p className="text-muted-foreground mb-4">
            Create alerts to stay informed about your account activity
          </p>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </Card>
      )}
    </div>
  );
}

