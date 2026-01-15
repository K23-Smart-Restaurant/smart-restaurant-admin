import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enDashboard from '../locales/en/dashboard.json';
import enMenu from '../locales/en/menu.json';
import enOrders from '../locales/en/orders.json';
import enKitchen from '../locales/en/kitchen.json';
import enStaff from '../locales/en/staff.json';
import enTables from '../locales/en/tables.json';
import enReports from '../locales/en/reports.json';

import viCommon from '../locales/vi/common.json';
import viDashboard from '../locales/vi/dashboard.json';
import viMenu from '../locales/vi/menu.json';
import viOrders from '../locales/vi/orders.json';
import viKitchen from '../locales/vi/kitchen.json';
import viStaff from '../locales/vi/staff.json';
import viTables from '../locales/vi/tables.json';
import viReports from '../locales/vi/reports.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    menu: enMenu,
    orders: enOrders,
    kitchen: enKitchen,
    staff: enStaff,
    tables: enTables,
    reports: enReports,
  },
  vi: {
    common: viCommon,
    dashboard: viDashboard,
    menu: viMenu,
    orders: viOrders,
    kitchen: viKitchen,
    staff: viStaff,
    tables: viTables,
    reports: viReports,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'menu', 'orders', 'kitchen', 'staff', 'tables', 'reports'],

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
