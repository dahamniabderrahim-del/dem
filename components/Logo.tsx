'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', variant = 'dark', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const color = variant === 'light' ? 'text-white' : 'text-primary-900';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Cercle blanc avec le symbole CK */}
      <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center shadow-lg ${showText ? 'mb-3' : ''}`}>
        <svg
          className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-10 h-10'} ${variant === 'light' ? 'text-primary-600' : 'text-primary-700'}`}
          viewBox="0 0 100 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Symbole CK - C arrondi ouvert (forme pleine) avec K angulaire intégré */}
          {/* C - forme arrondie, ouverte, audacieuse (forme pleine) */}
          <path
            d="M 20 50 
               C 20 28, 36 15, 58 15 
               L 70 15 
               C 80 15, 85 20, 85 30 
               L 85 50 
               C 85 60, 80 65, 70 65 
               L 58 65 
               C 42 65, 28 75, 22 88 
               C 20 92, 20 95, 20 95 
               L 20 50 Z"
            fill="currentColor"
          />
          {/* K - barre verticale forte, positionnée dans la courbe du C */}
          <rect x="50" y="20" width="8" height="60" fill="currentColor" />
          {/* K - diagonale supérieure (angle aigu vers le haut) */}
          <path
            d="M 58 50 L 75 30 L 78 33 L 63 50 Z"
            fill="currentColor"
          />
          {/* K - diagonale inférieure (angle aigu vers le bas) */}
          <path
            d="M 58 50 L 75 70 L 78 67 L 63 50 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {showText && (
        <div className={`text-center ${color}`}>
          <div className="flex flex-col items-center">
            <div className="flex items-baseline space-x-1">
              <span className={`${textSizeClasses[size]} font-normal`}>Clinique</span>
              <span className={`${textSizeClasses[size]} font-bold`}>KARA</span>
            </div>
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-normal mt-0.5`}>Oran</span>
          </div>
        </div>
      )}
    </div>
  );
}
