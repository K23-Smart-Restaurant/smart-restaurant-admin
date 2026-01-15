// TypeScript declarations for i18next
import 'i18next';
import common from './locales/en/common.json';
import dashboard from './locales/en/dashboard.json';
import menu from './locales/en/menu.json';
import orders from './locales/en/orders.json';
import kitchen from './locales/en/kitchen.json';
import staff from './locales/en/staff.json';
import tables from './locales/en/tables.json';
import reports from './locales/en/reports.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
      menu: typeof menu;
      orders: typeof orders;
      kitchen: typeof kitchen;
      staff: typeof staff;
      tables: typeof tables;
      reports: typeof reports;
    };
  }
}
