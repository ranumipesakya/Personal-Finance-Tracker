import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClass = "bg-secondary/40 animate-pulse";
  const variantClass = 
    variant === 'text' ? 'h-3 w-full rounded' :
    variant === 'circle' ? 'rounded-full' : 'rounded-2xl';
  
  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/30" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-secondary/30 rounded" />
              <div className="h-3 w-20 bg-secondary/30 rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-secondary/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-background border border-secondary rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-secondary/30 rounded" />
        <div className="w-10 h-10 bg-secondary/30 rounded-xl" />
      </div>
      <div className="h-8 w-32 bg-secondary/30 rounded" />
    </div>
  );
}
