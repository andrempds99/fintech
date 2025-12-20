import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Card Skeleton */}
      <Card className="p-6 rounded-xl">
        <Skeleton className="h-32 w-full" />
      </Card>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Card className="p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Card className="p-6 rounded-xl">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-xl">
        <Skeleton className="h-32 w-full" />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6 rounded-xl">
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
      <Card className="p-6 rounded-xl">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}