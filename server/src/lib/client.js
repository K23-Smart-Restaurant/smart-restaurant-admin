import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { UserRole, TableStatus, MenuCategory, OrderStatus, PaymentStatus, OrderItemStatus } = require('../../../../smart-restaurant-root/generated/prisma/index.js');

export { UserRole, TableStatus, MenuCategory, OrderStatus, PaymentStatus, OrderItemStatus };