import React from 'react';

export interface PigIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * PigIcon (ไอคอนรูปหมูสำหรับคะแนนความพึงพอใจและแบรนด์มันนี่หมูกระทะ)
 * รองรับ Tailwind className เช่น fill-amber-400 text-amber-400
 * ออกแบบให้ดวงตาและจมูกเป็น Cutout รูเจาะมองทะลุพื้นหลัง สวยงาม คมชัดทุกขนาด
 */
export const PigIcon: React.FC<PigIconProps> = ({
  className = 'w-5 h-5',
  size,
  width,
  height,
  ...props
}) => {
  const finalWidth = size || width || 24;
  const finalHeight = size || height || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={finalWidth}
      height={finalHeight}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Head + Ears with cutout holes for eyes and nostrils */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.2 4.2C7.2 2.8 5 3.2 4.4 4.8C3.8 6.5 4.8 8.4 5.4 9.4C3.8 11.2 3 13.4 3 15.5C3 19.5 6.8 22 12 22C17.2 22 21 19.5 21 15.5C21 13.4 20.2 11.2 18.6 9.4C19.2 8.4 20.2 6.5 19.6 4.8C19 3.2 16.8 2.8 15.8 4.2C14.6 3.6 13.3 3.3 12 3.3C10.7 3.3 9.4 3.6 8.2 4.2ZM8 10C8.55 10 9 9.55 9 9C9 8.45 8.55 8 8 8C7.45 8 7 8.45 7 9C7 9.55 7.45 10 8 10ZM16 10C16.55 10 17 9.55 17 9C17 8.45 16.55 8 16 8C15.45 8 15 8.45 15 9C15 9.55 15.45 10 16 10ZM10.5 15.2C10.5 15.75 10.05 16.2 9.5 16.2C8.95 16.2 8.5 15.75 8.5 15.2C8.5 14.65 8.95 14.2 9.5 14.2C10.05 14.2 10.5 14.65 10.5 15.2ZM15.5 15.2C15.5 15.75 15.05 16.2 14.5 16.2C13.95 16.2 13.5 15.75 13.5 15.2C13.5 14.65 13.95 14.2 14.5 14.2C15.05 14.2 15.5 14.65 15.5 15.2Z"
      />
      {/* Snout outline contour */}
      <ellipse
        cx="12"
        cy="15.2"
        rx="4.2"
        ry="2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.75"
      />
    </svg>
  );
};

export default PigIcon;
