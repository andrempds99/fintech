import { Badge } from "./ui/badge";
import { ShoppingCart, UtensilsCrossed, Car, Zap, Sparkles, ShoppingBag, Heart, ArrowLeftRight, Briefcase, TrendingUp } from "lucide-react";
import type { Transaction } from "@/lib/mock-data";

interface TransactionRowProps {
  transaction: Transaction;
}

const categoryIcons: Record<string, React.ReactNode> = {
  groceries: <ShoppingCart className="h-5 w-5" />,
  dining: <UtensilsCrossed className="h-5 w-5" />,
  transportation: <Car className="h-5 w-5" />,
  utilities: <Zap className="h-5 w-5" />,
  entertainment: <Sparkles className="h-5 w-5" />,
  shopping: <ShoppingBag className="h-5 w-5" />,
  healthcare: <Heart className="h-5 w-5" />,
  transfer: <ArrowLeftRight className="h-5 w-5" />,
  salary: <Briefcase className="h-5 w-5" />,
  investment: <TrendingUp className="h-5 w-5" />,
};

const statusColors = {
  completed: 'bg-[var(--positive)] text-white',
  pending: 'bg-[var(--warning)] text-white',
  failed: 'bg-[var(--negative)] text-white'
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="p-2 rounded-lg bg-secondary">
        {categoryIcons[transaction.category]}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="truncate">{transaction.merchant}</h4>
        <p className="text-muted-foreground text-sm capitalize">{transaction.category}</p>
      </div>

      <div className="text-right">
        <p className={`${isPositive ? 'text-[var(--positive)]' : 'text-foreground'}`}>
          {isPositive ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-muted-foreground text-sm">{transaction.date}</p>
      </div>

      <Badge className={statusColors[transaction.status]}>
        {transaction.status}
      </Badge>
    </div>
  );
}
