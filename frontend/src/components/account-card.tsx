import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CreditCard, MoreVertical } from "lucide-react";
import type { Account } from "@/lib/mock-data";

interface AccountCardProps {
  account: Account;
  featured?: boolean;
  onClick?: () => void;
}

export function AccountCard({ account, featured = false, onClick }: AccountCardProps) {
  const statusColors = {
    active: 'bg-[var(--positive)] text-white',
    suspended: 'bg-[var(--warning)] text-white',
    closed: 'bg-muted text-muted-foreground'
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
        <button className="p-1 hover:bg-muted rounded">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
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
