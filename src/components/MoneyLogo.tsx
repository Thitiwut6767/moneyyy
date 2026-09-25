import React from 'react';

interface MoneyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const MoneyLogo: React.FC<MoneyLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  return (
    <div className={`relative inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeMap[size]} overflow-hidden shadow-md border border-red-200/80 bg-red-600 shrink-0 transition-transform`}
      >
        <img
          src="/logo.jpg"
          alt="โลโก้ร้านมันนี่ หมูกระทะ x ชาบู"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {showSubtitle && (
        <div className="flex flex-col">
          <span className="font-black text-stone-900 leading-tight">
            มันนี่หมูกระทะ <span className="text-red-600">สวนดอก</span>
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น
          </span>
        </div>
      )}
    </div>
  );
};
