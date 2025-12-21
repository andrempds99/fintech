import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/lib/mock-data";
import { TransactionRow } from "@/components/transaction-row";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api-client";

export function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, [currentPage, categoryFilter, statusFilter, searchQuery]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (categoryFilter !== "all") {
        filters.category = categoryFilter;
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const response = await transactionService.getAll(filters);
      setTransactions(response.transactions);
      setTotal(response.total);
    } catch (error: any) {
      toast.error("Failed to load transactions");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (exportDateFrom) params.append('dateFrom', exportDateFrom);
      if (exportDateTo) params.append('dateTo', exportDateTo);

      const url = `/api/export/transactions/${exportFormat}?${params.toString()}`;
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: exportFormat === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${exportDateFrom || 'all'}_${exportDateTo || 'all'}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Transactions exported as ${exportFormat.toUpperCase()}`);
      setIsExportDialogOpen(false);
    } catch (error: any) {
      toast.error('Failed to export transactions');
      console.error(error);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Transactions</h1>
          <p className="text-muted-foreground mt-1">View and manage all your transactions</p>
        </div>
        <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 rounded-xl shadow-sm border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-input-background border-0"
              />
            </div>
          </div>

          <Select name="categoryFilter" value={categoryFilter} onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="bg-input-background border-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
            </SelectContent>
          </Select>

          <Select name="statusFilter" value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="bg-input-background border-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>All Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, total)} of {total}
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="space-y-1">
                {transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-slate-900 hover:bg-slate-800" : ""}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription>
              Choose format and date range for export
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="export-format" className="text-sm font-medium">Format</Label>
              <Select name="exportFormat" value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger id="export-format" className="bg-input-background border-0 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm font-medium">From Date (Optional)</Label>
                <Input
                  id="date-from"
                  name="exportStartDate"
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                  className="bg-input-background border-0 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm font-medium">To Date (Optional)</Label>
                <Input
                  id="date-to"
                  name="exportEndDate"
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                  className="bg-input-background border-0 h-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
