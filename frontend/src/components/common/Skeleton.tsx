import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius,
}) => {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;
  if (borderRadius !== undefined) style.borderRadius = borderRadius;

  return (
    <div
      aria-busy="true"
      aria-label="Loading content"
      style={style}
      className={`animate-shimmer rounded-xl ${className}`}
    />
  );
};

export default Skeleton;
