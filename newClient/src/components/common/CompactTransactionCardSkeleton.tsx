
import { Skeleton } from "@/components/ui/skeleton";

export const CompactTransactionCardSkeleton = () => {
  return (
    <div className="p-4 border rounded-lg bg-white space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
};
