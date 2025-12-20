import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Wallet, Activity, RefreshCw, Database } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { User, Account, AuditLog } from "@/lib/mock-data";
import { transactionNotifications } from "@/lib/notifications";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, accountsData, logsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllAccounts(),
        adminService.getAuditLogs(),
      ]);

      setUsers(usersData.users || []);
      setAccounts(accountsData.accounts || []);
      setAuditLogs(logsData.logs || []);
    } catch (error: any) {
      toast.error("Failed to load admin data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      await adminService.resetData();
      transactionNotifications.dataReset();
      toast.success("Data reset successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to reset data");
      console.error(error);
    }
  };

  const handleRegenerateData = async () => {
    try {
      await adminService.resetData();
      transactionNotifications.dataRegenerated();
      toast.success("Data regenerated successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to regenerate data");
      console.error(error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const totalAUM = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System management and user overview</p>
        </div>
        <Badge className="bg-[var(--info)] text-white px-4 py-2">Admin Access</Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--positive)]/10">
              <Users className="h-5 w-5 text-[var(--positive)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl">{users.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Wallet className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Accounts</p>
              <h3 className="text-2xl">{activeAccounts.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Activity className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total AUM</p>
              <h3 className="text-2xl">
                ${(totalAUM / 1000000).toFixed(1)}M
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--chart-1)]/10">
              <Database className="h-5 w-5 text-[var(--chart-1)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <h3 className="text-lg text-[var(--positive)]">Operational</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Mock Data Tools */}
      <Card className="p-6 rounded-xl shadow-sm border border-border">
        <h3 className="mb-4">Mock Data Management</h3>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleResetData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Dataset
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRegenerateData}
          >
            <Database className="h-4 w-4 mr-2" />
            Regenerate Demo Data
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Use these tools to reset or regenerate mock data for testing purposes.
        </p>
      </Card>

      {/* User Management */}
      <Card className="rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3>User Management</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-slate-900 text-white">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    className={user.role === 'admin' 
                      ? 'bg-[var(--info)] text-white' 
                      : 'bg-muted text-foreground'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Account Overview */}
      <Card className="rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3>Account Overview</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Account Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      account.status === 'active' 
                        ? 'bg-[var(--positive)] text-white'
                        : account.status === 'suspended'
                        ? 'bg-[var(--warning)] text-white'
                        : 'bg-muted text-foreground'
                    }
                  >
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell>{account.accountNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Audit Log */}
      <Card className="rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3>Audit Log</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{log.timestamp}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
