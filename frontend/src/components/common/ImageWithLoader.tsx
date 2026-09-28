import React, { useState } from 'react';
import { Skeleton } from './Skeleton';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackSrc?: string;
}

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (props.onLoad) props.onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    if (props.onError) props.onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-inherit z-10" />
      )}
      
      {hasError ? (
        <div className="w-full h-full bg-[#F7F5EF] border border-[#E5E1D6] rounded-inherit flex flex-col items-center justify-center p-3 text-center text-[#6B6B63]">
          <span className="material-symbols-outlined text-2xl mb-1">domain</span>
          <span className="text-[10px] font-bold text-[#171A18]">EaseHub Verified</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt || 'EaseHub Property'}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithLoader;
