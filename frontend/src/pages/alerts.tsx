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
import { Plus, Bell, Trash2, AlertCircle, Wallet } from "lucide-react";
import { alertsService, Alert } from "@/services/alerts.service";
import { accountService } from "@/services/account.service";
import { Account } from "@/lib/mock-data";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
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

  useEffect(() => {
    console.log('[Alerts] isDialogOpen state changed to:', isDialogOpen);
  }, [isDialogOpen]);

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
      handleCloseDialog();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create alert");
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
    console.log('[Alerts] handleOpenDialog called');
    console.log('[Alerts] Current isDialogOpen state:', isDialogOpen);
    setFormData({ accountId: "", type: "", threshold: "" });
    // Use a small timeout to ensure the click event has fully processed
    setTimeout(() => {
      setIsDialogOpen(true);
      console.log('[Alerts] setIsDialogOpen(true) called');
    }, 10);
  };

  const handleCloseDialog = () => {
    console.log('[Alerts] handleCloseDialog called');
    setIsDialogOpen(false);
    setFormData({ accountId: "", type: "", threshold: "" });
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
  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  const getAlertTypeLabel = (type: string) => {
    return type === 'low_balance' ? 'Low Balance' : 'Large Transaction';
  };

  const getAlertTypeDescription = (type: string) => {
    return type === 'low_balance' 
      ? 'Triggers when account balance falls below threshold'
      : 'Triggers when a transaction exceeds the threshold amount';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage your account alerts and notifications</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={(e) => {
            console.log('[Alerts] Button clicked!');
            handleOpenDialog(e);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Create Alert Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log('[Alerts] Dialog onOpenChange called with:', open);
          console.log('[Alerts] Current isDialogOpen:', isDialogOpen);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>
              Set up an alert to be notified about account activity
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAlert}>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="alert-account" className="text-sm font-medium">Account *</Label>
                <Select
                  name="alertAccount"
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  required
                >
                  <SelectTrigger id="alert-account" className="bg-input-background border-0 h-10">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.length > 0 ? (
                      activeAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.accountNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No active accounts available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-type" className="text-sm font-medium">Alert Type *</Label>
                <Select
                  name="alertType"
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger id="alert-type" className="bg-input-background border-0 h-10">
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_balance">Low Balance</SelectItem>
                    <SelectItem value="large_transaction">Large Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-threshold" className="text-sm font-medium">Threshold ($) *</Label>
                <Input
                  id="alert-threshold"
                  name="alertThreshold"
                  type="number"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="0.00"
                  className="bg-input-background border-0 h-10"
                  required
                />
                {formData.type && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {getAlertTypeDescription(formData.type)}
                  </p>
                )}
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
                {isSubmitting ? "Creating..." : "Create Alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
            <p className="text-2xl">{alerts.length}</p>
          </Card>
          <Card className="p-4 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
            <p className="text-2xl text-[var(--positive)]">{activeAlerts.length}</p>
          </Card>
          <Card className="p-4 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground mb-1">Inactive Alerts</p>
            <p className="text-2xl text-muted-foreground">{inactiveAlerts.length}</p>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h2 className="mb-4">Active Alerts</h2>
          <div className="grid gap-4">
            {activeAlerts.map((alert) => {
              const account = accounts.find(acc => acc.id === alert.accountId);
              const isLowBalance = alert.type === 'low_balance';
              const isTriggered = account && (
                isLowBalance 
                  ? account.balance < alert.threshold
                  : false
              );
              
              return (
                <Card key={alert.id} className="p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className={`h-5 w-5 ${isTriggered ? 'text-[var(--negative)]' : 'text-[var(--warning)]'}`} />
                        <h3>{getAlertTypeLabel(alert.type)}</h3>
                        <Badge className="bg-[var(--positive)] text-white">Active</Badge>
                        {isTriggered && (
                          <Badge className="bg-[var(--negative)] text-white">Triggered</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {account?.name || alert.accountName} • {account?.accountNumber || alert.accountNumber}
                        </p>
                      </div>
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
                            <p className={`text-lg font-medium ${isLowBalance && account.balance < alert.threshold ? 'text-[var(--negative)]' : ''}`}>
                              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-active-${alert.id}`} className="text-sm">Status</Label>
                          <Switch
                            id={`toggle-active-${alert.id}`}
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
                      title="Delete alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Alerts */}
      {inactiveAlerts.length > 0 && (
        <div>
          <h2 className="mb-4">Inactive Alerts</h2>
          <div className="grid gap-4">
            {inactiveAlerts.map((alert) => {
              const account = accounts.find(acc => acc.id === alert.accountId);
              
              return (
                <Card key={alert.id} className="p-6 rounded-xl shadow-sm border border-border opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <h3>{getAlertTypeLabel(alert.type)}</h3>
                        <Badge variant="outline">Inactive</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {account?.name || alert.accountName} • {account?.accountNumber || alert.accountNumber}
                        </p>
                      </div>
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
                          <Label htmlFor={`toggle-inactive-${alert.id}`} className="text-sm">Status</Label>
                          <Switch
                            id={`toggle-inactive-${alert.id}`}
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
                      title="Delete alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Create alerts to stay informed about your account activity"
          actionLabel="Create Alert"
          onAction={handleOpenDialog}
        />
      )}
    </div>
  );
}
