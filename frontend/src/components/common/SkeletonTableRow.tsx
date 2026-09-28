import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonTableRowProps {
  columns?: number;
}

export const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ columns = 6 }) => {
  return (
    <tr className="border-b border-[#E5E1D6]/60">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-4">
          <Skeleton className="h-5 w-full max-w-[120px] rounded-lg" />
        </td>
      ))}
    </tr>
  );
};

export default SkeletonTableRow;
