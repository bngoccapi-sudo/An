import React from 'react';
import { ActionIconType } from '../types';

interface ActionIconProps {
  type: ActionIconType;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  type,
  imageUrl,
  size = 'md',
  className = '',
  onClick,
  title
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // If a direct image URL is provided (user uploaded icon)
  if (imageUrl || (typeof type === 'string' && (type.startsWith('data:') || type.startsWith('http') || type.startsWith('/')))) {
    const src = imageUrl || type;
    return (
      <div
        onClick={onClick}
        title={title}
        className={`inline-flex items-center justify-center transition-transform ${sizeClasses[size]} ${
          onClick ? 'cursor-pointer hover:scale-115 active:scale-95' : ''
        } ${className}`}
      >
        <img
          src={src}
          alt={title || 'Icon'}
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
        />
      </div>
    );
  }

  const renderIcon = () => {
    switch (type) {
      case 'paw_blue':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M18 52 C12 36, 26 18, 50 16 C74 18, 88 36, 82 54 C88 72, 70 88, 48 88 C26 88, 12 70, 18 52 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M21 52 C16 39, 28 22, 50 20 C71 22, 84 39, 79 53 C84 68, 67 84, 48 84 C28 84, 16 67, 21 52 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes */}
            <line x1="16" y1="36" x2="10" y2="34" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="68" x2="11" y2="72" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="36" x2="90" y2="33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="82" y1="68" x2="89" y2="72" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Blue Paw toes */}
            <ellipse cx="30" cy="36" rx="6.5" ry="9" transform="rotate(-15 30 36)" fill="#1d4ed8" />
            <ellipse cx="43" cy="29" rx="6.5" ry="9.5" transform="rotate(-5 43 29)" fill="#1d4ed8" />
            <ellipse cx="57" cy="29" rx="6.5" ry="9.5" transform="rotate(5 57 29)" fill="#1d4ed8" />
            <ellipse cx="70" cy="36" rx="6.5" ry="9" transform="rotate(15 70 36)" fill="#1d4ed8" />
            {/* Main pad */}
            <path
              d="M32 54 C32 45, 42 41, 50 41 C58 41, 68 45, 68 54 C68 64, 62 74, 50 74 C38 74, 32 64, 32 54 Z"
              fill="#1d4ed8"
            />
          </svg>
        );

      case 'paw_yellow':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M18 52 C12 36, 26 18, 50 16 C74 18, 88 36, 82 54 C88 72, 70 88, 48 88 C26 88, 12 70, 18 52 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M21 52 C16 39, 28 22, 50 20 C71 22, 84 39, 79 53 C84 68, 67 84, 48 84 C28 84, 16 67, 21 52 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes (blue accents as in sticker set) */}
            <line x1="16" y1="36" x2="10" y2="34" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="68" x2="11" y2="71" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="36" x2="90" y2="33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="82" y1="68" x2="89" y2="71" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

            {/* Yellow Paw toes */}
            <ellipse cx="30" cy="36" rx="6.5" ry="9" transform="rotate(-15 30 36)" fill="#f59e0b" />
            <ellipse cx="43" cy="29" rx="6.5" ry="9.5" transform="rotate(-5 43 29)" fill="#f59e0b" />
            <ellipse cx="57" cy="29" rx="6.5" ry="9.5" transform="rotate(5 57 29)" fill="#f59e0b" />
            <ellipse cx="70" cy="36" rx="6.5" ry="9" transform="rotate(15 70 36)" fill="#f59e0b" />
            {/* Main pad */}
            <path
              d="M32 54 C32 45, 42 41, 50 41 C58 41, 68 45, 68 54 C68 64, 62 74, 50 74 C38 74, 32 64, 32 54 Z"
              fill="#f59e0b"
            />
          </svg>
        );

      case 'flower':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M24 45 C15 28, 32 15, 50 15 C68 15, 85 28, 76 45 C86 64, 72 86, 50 86 C28 86, 14 64, 24 45 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M26 46 C18 31, 34 18, 50 18 C66 18, 82 31, 74 46 C83 63, 69 83, 50 83 C31 83, 17 63, 26 46 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes */}
            <line x1="22" y1="36" x2="16" y2="33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="21" y1="56" x2="15" y2="58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="78" y1="36" x2="84" y2="33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="79" y1="56" x2="85" y2="58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Stem */}
            <path d="M50 48 L50 78" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M50 64 C40 60, 37 48, 38 43 C43 54, 48 58, 50 64 Z" fill="#15803d" />
            <path d="M50 64 C60 60, 63 48, 62 43 C57 54, 52 58, 50 64 Z" fill="#15803d" />
            {/* Tulip flower petals */}
            <path d="M50 48 C42 48, 38 34, 42 24 C45 32, 50 44, 50 48 Z" fill="#f43f5e" />
            <path d="M50 48 C58 48, 62 34, 58 24 C55 32, 50 44, 50 48 Z" fill="#e11d48" />
            <path d="M42 26 C48 20, 52 20, 58 26 C57 38, 50 48, 50 48 C50 48, 43 38, 42 26 Z" fill="#fb7185" />
            {/* White highlight crayon strokes on petals */}
            <path d="M47 24 C48 28, 48 35, 47 38" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" />
            <path d="M54 25 C55 29, 54 36, 53 38" stroke="#fecdd3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'house':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M20 54 C10 38, 28 20, 50 16 C72 20, 90 38, 80 54 C88 74, 72 88, 50 88 C28 88, 12 74, 20 54 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M23 54 C14 41, 30 23, 50 19 C70 23, 86 41, 77 54 C85 71, 69 85, 50 85 C31 85, 15 71, 23 54 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes */}
            <line x1="16" y1="46" x2="9" y2="44" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="68" x2="11" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="46" x2="91" y2="44" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="82" y1="68" x2="89" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Chimney */}
            <rect x="58" y="32" width="7" height="15" fill="#78350f" rx="1.5" />
            {/* Heart Smoke */}
            <path
              d="M62 25 C62 22, 60 20, 58 22 C56 20, 54 22, 54 25 C54 28, 58 31, 58 31 C58 31, 62 28, 62 25 Z"
              fill="#f59e0b"
            />

            {/* House Body */}
            <rect x="33" y="47" width="34" height="28" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" rx="2" />
            {/* Roof */}
            <path
              d="M28 48 L50 28 L72 48 Z"
              fill="#ea580c"
              stroke="#c2410c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Window */}
            <rect x="39" y="53" width="9" height="9" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" rx="1" />
            <line x1="43.5" y1="53" x2="43.5" y2="62" stroke="#0284c7" strokeWidth="1" />
            <line x1="39" y1="57.5" x2="48" y2="57.5" stroke="#0284c7" strokeWidth="1" />
            {/* Arched Door */}
            <path d="M56 75 L56 61 C56 57, 63 57, 63 61 L63 75 Z" fill="#9a3412" />
            <circle cx="61.5" cy="67" r="0.8" fill="#fde047" />

            {/* Green Bushes */}
            <circle cx="31" cy="73" r="5" fill="#16a34a" />
            <circle cx="35" cy="74" r="4" fill="#15803d" />
            <circle cx="69" cy="73" r="5" fill="#16a34a" />
            <circle cx="65" cy="74" r="4" fill="#15803d" />
          </svg>
        );

      case 'note':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M20 50 C12 34, 28 16, 50 16 C72 16, 88 34, 80 50 C88 68, 72 86, 50 86 C28 86, 12 68, 20 50 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M22 50 C15 36, 30 19, 50 19 C70 19, 85 36, 78 50 C85 66, 70 83, 50 83 C30 83, 15 66, 22 50 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes */}
            <line x1="16" y1="38" x2="10" y2="36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="16" y1="62" x2="10" y2="64" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="38" x2="90" y2="36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="62" x2="90" y2="64" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Notepad cardboard back shadow */}
            <rect x="36" y="27" width="34" height="48" rx="4" fill="#d97706" opacity="0.3" />
            {/* Notepad sheet */}
            <rect x="34" y="26" width="34" height="48" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="1.8" />
            {/* Spiral binder loops */}
            <rect x="39" y="22" width="3" height="7" rx="1.5" fill="#451a03" />
            <rect x="49" y="22" width="3" height="7" rx="1.5" fill="#451a03" />
            <rect x="59" y="22" width="3" height="7" rx="1.5" fill="#451a03" />

            {/* Ruled lines */}
            <line x1="40" y1="38" x2="62" y2="38" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="46" x2="62" y2="46" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="54" x2="56" y2="54" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

            {/* Red Heart sticker on bottom right */}
            <path
              d="M62 65 C62 63, 60 61, 58 63 C56 61, 54 63, 54 65 C54 68, 58 71, 58 71 C58 71, 62 68, 62 65 Z"
              fill="#dc2626"
            />
          </svg>
        );

      case 'food':
        return (
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm select-none">
            {/* Die-cut cream sticker patch */}
            <path
              d="M18 52 C10 35, 26 18, 50 16 C74 18, 90 35, 82 52 C90 70, 74 88, 50 88 C26 88, 10 70, 18 52 Z"
              fill="#fffbee"
              stroke="#eddcb6"
              strokeWidth="2"
            />
            {/* Dashed stitch outline */}
            <path
              d="M20 52 C13 37, 28 21, 50 19 C72 21, 87 37, 80 52 C87 68, 72 85, 50 85 C28 85, 13 68, 20 52 Z"
              fill="none"
              stroke="#d8c599"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Radiant dashes */}
            <line x1="16" y1="38" x2="10" y2="36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="16" y1="64" x2="10" y2="67" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="38" x2="90" y2="36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="64" x2="90" y2="67" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* Blue plate / bowl */}
            <ellipse cx="50" cy="58" rx="30" ry="20" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" />
            <ellipse cx="50" cy="56" rx="27" ry="17" fill="#f8fafc" />

            {/* Green salad lettuce */}
            <path
              d="M44 42 C40 38, 48 35, 54 36 C59 34, 66 38, 64 43 C70 45, 71 52, 65 54 C58 58, 46 54, 44 42 Z"
              fill="#22c55e"
            />

            {/* Sunny-side up fried egg */}
            <path
              d="M34 52 C32 45, 42 42, 48 44 C53 42, 60 48, 56 55 C58 60, 52 66, 44 65 C36 65, 33 58, 34 52 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Bright yellow egg yolk */}
            <circle cx="45" cy="53" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="43.5" cy="51.5" r="1.5" fill="#fef08a" />

            {/* Grilled Sausage with grill marks */}
            <path
              d="M52 64 C50 60, 68 52, 72 58 C74 62, 58 70, 52 64 Z"
              fill="#c2410c"
              stroke="#9a3412"
              strokeWidth="1.5"
            />
            <line x1="57" y1="60" x2="59" y2="64" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="63" y1="58" x2="65" y2="62" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />

            {/* Two cherry tomatoes with little stems */}
            <circle cx="68" cy="48" r="4.5" fill="#ef4444" />
            <circle cx="73" cy="53" r="4" fill="#dc2626" />
            <path d="M68 44 L68 46 M66 45 L70 45" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M73 49 L73 51 M71 50 L75 50" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <span className="text-xl select-none" role="img" aria-label="icon">
            🐾
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center transition-transform ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:scale-115 active:scale-95' : ''
      } ${className}`}
    >
      {renderIcon()}
    </div>
  );
};

export const ACTION_METADATA: Record<ActionIconType, { label: string; desc: string; color: string; bg: string }> = {
  paw_blue: {
    label: 'His Paw Stamp',
    desc: 'Check-in stamp by him',
    color: '#1d4ed8',
    bg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  paw_yellow: {
    label: 'Her Paw Stamp',
    desc: 'Check-in stamp by her',
    color: '#f59e0b',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  house: {
    label: 'Home',
    desc: 'Cozy time at home',
    color: '#059669',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  food: {
    label: 'Food',
    desc: 'Delicious meals together',
    color: '#f43f5e',
    bg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  flower: {
    label: 'Tulip',
    desc: 'Sweet & blooming memories',
    color: '#ec4899',
    bg: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  note: {
    label: 'Note',
    desc: 'Journal note & warm thought',
    color: '#d97706',
    bg: 'bg-amber-50 text-amber-800 border-amber-200'
  }
};
