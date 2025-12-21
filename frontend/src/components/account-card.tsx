import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CreditCard, MoreVertical, Trash2, Star } from "lucide-react";
import type { Account } from "@/lib/mock-data";

interface AccountCardProps {
  account: Account;
  featured?: boolean;
  onClick?: () => void;
  onDelete?: (accountId: string) => void;
  onSetHighlight?: (accountId: string, isHighlighted: boolean) => void;
}

export function AccountCard({ account, featured = false, onClick, onDelete, onSetHighlight }: AccountCardProps) {
  const statusColors = {
    active: 'bg-[var(--positive)] text-white',
    suspended: 'bg-[var(--warning)] text-white',
    closed: 'bg-muted text-muted-foreground'
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && account.balance === 0) {
      onDelete(account.id);
    }
  };

  const handleSetHighlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetHighlight) {
      onSetHighlight(account.id, !account.isHighlighted);
    }
  };

  if (featured) {
    return (
      <Card 
        className="p-6 rounded-xl shadow-lg border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-white/70 text-sm mb-1">{account.type} Account</p>
            <h4 className="text-white">{account.name}</h4>
          </div>
          <CreditCard className="h-8 w-8 text-white/70" />
        </div>
        <div>
          <p className="text-white/70 text-sm mb-2">Available Balance</p>
          <h2 className="text-4xl text-white mb-4">
            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">{account.accountNumber}</span>
            <Badge className={statusColors[account.status]}>
              {account.status}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-5 rounded-xl shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="mb-1">{account.name}</h4>
          <p className="text-muted-foreground text-sm">{account.type}</p>
        </div>
        {(onDelete || onSetHighlight) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <button 
                className="p-1 hover:bg-muted rounded"
                onClick={handleMenuClick}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleMenuClick}>
              {onSetHighlight && (
                <DropdownMenuItem onClick={handleSetHighlight}>
                  <Star className="h-4 w-4 mr-2" />
                  {account.isHighlighted ? 'Remove Highlight' : 'Set as Highlight Account'}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  {onSetHighlight && <DropdownMenuSeparator />}
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={account.balance !== 0}
                    variant={account.balance === 0 ? "destructive" : "default"}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                    {account.balance !== 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Balance must be $0)
                      </span>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div>
        <p className="text-2xl mb-2">
          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{account.accountNumber}</span>
          <Badge className={statusColors[account.status]}>
            {account.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
