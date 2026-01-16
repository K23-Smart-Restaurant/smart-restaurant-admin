import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

interface TimerBadgeProps {
  startTime: string; // ISO date string
  className?: string;
}

/**
 * TimerBadge - Displays elapsed time since order creation
 * Color-coded: Green (<15min), Yellow (15-30min), Red (>30min)
 */
const TimerBadge: React.FC<TimerBadgeProps> = ({ startTime, className = '' }) => {
  const { t } = useTranslation('common');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const calculateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diffInSeconds = Math.floor((now - start) / 1000);
      setElapsed(diffInSeconds);
    };

    calculateElapsed();

    // Update every second
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on elapsed time
  const getColorClasses = (): string => {
    const minutes = elapsed / 60;

    if (minutes < 15) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    } else if (minutes < 30) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    } else {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  // Get status text
  const getStatusText = (): string => {
    const minutes = elapsed / 60;

    if (minutes < 15) {
      return t('timer.onTime');
    } else if (minutes < 30) {
      return t('timer.urgent');
    } else {
      return t('timer.critical');
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-semibold text-sm ${getColorClasses()} ${className}`}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(elapsed)}</span>
      <span className="text-xs opacity-80">• {getStatusText()}</span>
    </div>
  );
};

export default TimerBadge;
