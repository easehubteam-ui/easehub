import React from 'react';
import { Building2, Utensils, Shirt, Wrench, Image as ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  type?: 'pg' | 'meals' | 'laundry' | 'services' | 'general';
  title?: string;
  className?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  type = 'general',
  title,
  className = 'w-full h-full',
}) => {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'pg':
        return <Building2 className="w-8 h-8 text-[#225944]/60" />;
      case 'meals':
      case 'meal':
        return <Utensils className="w-8 h-8 text-[#225944]/60" />;
      case 'laundry':
        return <Shirt className="w-8 h-8 text-[#225944]/60" />;
      case 'services':
      case 'service':
        return <Wrench className="w-8 h-8 text-[#225944]/60" />;
      default:
        return <ImageIcon className="w-8 h-8 text-[#225944]/60" />;
    }
  };

  const getLabel = () => {
    switch (type.toLowerCase()) {
      case 'pg':
        return 'PG Accommodation';
      case 'meals':
      case 'meal':
        return 'Mess & Tiffin Partner';
      case 'laundry':
        return 'Laundry Service';
      case 'services':
      case 'service':
        return 'Utility & Repair Service';
      default:
        return 'EaseHub Verified Listing';
    }
  };

  return (
    <div
      className={`bg-[#E5E1D6]/30 border border-[#E5E1D6] flex flex-col items-center justify-center p-4 text-[#6B6B63] select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/80 border border-[#E5E1D6] flex items-center justify-center mb-2 shadow-2xs">
        {getIcon()}
      </div>
      <span className="text-xs font-bold text-[#171A18] text-center truncate max-w-[180px]">
        {title || getLabel()}
      </span>
      <span className="text-[10px] text-[#6B6B63] font-medium mt-0.5">Verified EaseHub Listing</span>
    </div>
  );
};

export default PlaceholderImage;
