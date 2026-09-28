import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonCardProps {
  layout?: 'grid' | 'horizontal';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ layout = 'grid' }) => {
  if (layout === 'horizontal') {
    return (
      <div className="bg-white rounded-3xl p-4 border border-[#E5E1D6] shadow-xs flex flex-col sm:flex-row gap-4 animate-in fade-in">
        <Skeleton className="w-full sm:w-48 h-40 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6]">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-[#E5E1D6] shadow-xs space-y-3 animate-in fade-in flex flex-col">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
      <Skeleton className="h-6 w-5/6 rounded-lg" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
      <div className="pt-3 flex items-center justify-between border-t border-[#E5E1D6] mt-auto">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
};

export default SkeletonCard;
