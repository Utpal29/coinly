import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />
        ))}
      </div>
      <Skeleton className="h-10 w-64 bg-white/5" />
      <TransactionListSkeleton />
    </div>
  )
}

export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-4 w-16 bg-white/10" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return <Skeleton className="aspect-[4/3] w-full rounded-xl bg-white/5" />
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 bg-white/5" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20 bg-white/5" />
          <Skeleton className="h-10 w-full bg-white/5" />
        </div>
      ))}
      <Skeleton className="h-10 w-full bg-white/5" />
    </div>
  )
}
