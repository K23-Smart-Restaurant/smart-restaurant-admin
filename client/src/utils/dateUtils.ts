import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18n from '../i18n/config';

/**
 * Get the date-fns locale based on the current i18n language
 */
export const getDateLocale = () => {
  const language = i18n.language;
  switch (language) {
    case 'vi':
      return vi;
    case 'en':
    default:
      return enUS;
  }
};

/**
 * Format the distance to now with proper locale support
 * This is a wrapper around date-fns formatDistanceToNow that automatically
 * applies the correct locale based on the current i18n language setting
 */
export const formatDistanceToNowLocalized = (
  date: Date | number,
  options?: { addSuffix?: boolean; includeSeconds?: boolean }
): string => {
  return dateFnsFormatDistanceToNow(date, {
    ...options,
    locale: getDateLocale(),
  });
};
