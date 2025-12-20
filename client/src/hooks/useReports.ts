import { useQuery } from '@tanstack/react-query';
import { reportService, type RevenueReport, type TopRevenueItem, type OrderAnalytics } from '../services/reportService';

// Date range type for filtering
export type DateRange = '7days' | '30days' | '3months' | 'custom';

// Re-export types
export type { RevenueReport, TopRevenueItem, OrderAnalytics };

interface UseRevenueOptions {
  startDate: Date;
  endDate: Date;
}

export const useReports = () => {
  // Revenue report hook
  const useRevenue = (options: UseRevenueOptions) => {
    return useQuery({
      queryKey: ['reports', 'revenue', options.startDate.toISOString(), options.endDate.toISOString()],
      queryFn: () => reportService.getRevenue(options.startDate, options.endDate),
      enabled: !!options.startDate && !!options.endDate,
    });
  };

  // Top items hook
  const useTopItems = (limit: number = 10) => {
    return useQuery({
      queryKey: ['reports', 'topItems', limit],
      queryFn: () => reportService.getTopItems(limit),
    });
  };

  // Analytics hook
  const useAnalytics = () => {
    return useQuery({
      queryKey: ['reports', 'analytics'],
      queryFn: reportService.getAnalytics,
    });
  };

  return {
    useRevenue,
    useTopItems,
    useAnalytics,
  };
};
