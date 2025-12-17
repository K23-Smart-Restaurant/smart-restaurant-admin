import { useState } from "react";

// Enums matching backend schema
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAID"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED";
export type OrderItemStatus = "QUEUED" | "COOKING" | "READY";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string; // UI-only from MenuItem relation
  quantity: number;
  unitPrice: number;
  subtotal: number;
  itemStatus: OrderItemStatus;
  specialInstructions: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId: string;
  tableName: string; // UI-only computed field from Table relation
  userId: string | null; // Registered customer
  guestName: string | null;
  guestContact: string | null;
  waiterId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  prepTime: number; // UI-only field for display (expected prep time in minutes)
  orderItems: OrderItem[];
}

// Initial mock data
const initialMockOrders: Order[] = [
  {
    id: "ORD001",
    orderNumber: 1001,
    tableId: "T002",
    tableName: "Table 2",
    userId: null,
    guestName: "John Smith",
    guestContact: "+1234567890",
    waiterId: null,
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalAmount: 30.97,
    notes: "No onions please",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    paidAt: null,
    prepTime: 30,
    orderItems: [
      {
        id: "OI001",
        orderId: "ORD001",
        menuItemId: "1",
        menuItemName: "Classic Burger",
        quantity: 2,
        unitPrice: 12.99,
        subtotal: 25.98,
        itemStatus: "COOKING",
        specialInstructions: "Well done",
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "OI002",
        orderId: "ORD001",
        menuItemId: "2",
        menuItemName: "French Fries",
        quantity: 1,
        unitPrice: 4.99,
        subtotal: 4.99,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD002",
    orderNumber: 1002,
    tableId: "T003",
    tableName: "Table 3",
    userId: "user-123",
    guestName: null,
    guestContact: null,
    waiterId: "1",
    status: "READY",
    paymentStatus: "UNPAID",
    totalAmount: 45.5,
    notes: null,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    paidAt: null,
    prepTime: 25,
    orderItems: [
      {
        id: "OI003",
        orderId: "ORD002",
        menuItemId: "3",
        menuItemName: "Grilled Salmon",
        quantity: 1,
        unitPrice: 24.99,
        subtotal: 24.99,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        id: "OI004",
        orderId: "ORD002",
        menuItemId: "5",
        menuItemName: "Garden Salad",
        quantity: 2,
        unitPrice: 10.25,
        subtotal: 20.5,
        itemStatus: "READY",
        specialInstructions: "Dressing on the side",
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD003",
    orderNumber: 1003,
    tableId: "T001",
    tableName: "Table 1",
    userId: null,
    guestName: "Sarah Johnson",
    guestContact: "+1234567891",
    waiterId: "2",
    status: "PENDING",
    paymentStatus: "UNPAID",
    totalAmount: 28.5,
    notes: "Birthday celebration - add candles",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    paidAt: null,
    prepTime: 20,
    orderItems: [
      {
        id: "OI005",
        orderId: "ORD003",
        menuItemId: "6",
        menuItemName: "Chocolate Cake",
        quantity: 1,
        unitPrice: 8.5,
        subtotal: 8.5,
        itemStatus: "QUEUED",
        specialInstructions: "Add candles",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "OI006",
        orderId: "ORD003",
        menuItemId: "7",
        menuItemName: "Cappuccino",
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        itemStatus: "QUEUED",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "OI007",
        orderId: "ORD003",
        menuItemId: "8",
        menuItemName: "Tiramisu",
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        itemStatus: "QUEUED",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD004",
    orderNumber: 1004,
    tableId: "T005",
    tableName: "Table 5",
    userId: "user-456",
    guestName: null,
    guestContact: null,
    waiterId: "1",
    status: "SERVED",
    paymentStatus: "UNPAID",
    totalAmount: 67.8,
    notes: null,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(), // 90 min ago
    updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
    paidAt: null,
    prepTime: 35,
    orderItems: [
      {
        id: "OI008",
        orderId: "ORD004",
        menuItemId: "1",
        menuItemName: "Classic Burger",
        quantity: 2,
        unitPrice: 12.99,
        subtotal: 25.98,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: "OI009",
        orderId: "ORD004",
        menuItemId: "9",
        menuItemName: "Ribeye Steak",
        quantity: 2,
        unitPrice: 19.99,
        subtotal: 39.98,
        itemStatus: "READY",
        specialInstructions: "Medium rare",
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        id: "OI010",
        orderId: "ORD004",
        menuItemId: "7",
        menuItemName: "Cappuccino",
        quantity: 1,
        unitPrice: 1.84,
        subtotal: 1.84,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD005",
    orderNumber: 1005,
    tableId: "T007",
    tableName: "Table 7",
    userId: null,
    guestName: "Michael Brown",
    guestContact: "+1234567892",
    waiterId: "4",
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalAmount: 52.3,
    notes: "Allergic to nuts",
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(), // 35 min ago
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    paidAt: null,
    prepTime: 25,
    orderItems: [
      {
        id: "OI011",
        orderId: "ORD005",
        menuItemId: "10",
        menuItemName: "Caesar Salad",
        quantity: 1,
        unitPrice: 10.5,
        subtotal: 10.5,
        itemStatus: "READY",
        specialInstructions: "No croutons",
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "OI012",
        orderId: "ORD005",
        menuItemId: "11",
        menuItemName: "Margherita Pizza",
        quantity: 1,
        unitPrice: 16.8,
        subtotal: 16.8,
        itemStatus: "COOKING",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "OI013",
        orderId: "ORD005",
        menuItemId: "12",
        menuItemName: "Spaghetti Carbonara",
        quantity: 1,
        unitPrice: 15.0,
        subtotal: 15.0,
        itemStatus: "COOKING",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "OI014",
        orderId: "ORD005",
        menuItemId: "13",
        menuItemName: "Lemonade",
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        itemStatus: "READY",
        specialInstructions: "Extra ice",
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD006",
    orderNumber: 1006,
    tableId: "T004",
    tableName: "Table 4",
    userId: null,
    guestName: "Emma Wilson",
    guestContact: "+1234567893",
    waiterId: "2",
    status: "CONFIRMED",
    paymentStatus: "UNPAID",
    totalAmount: 38.75,
    notes: null,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 min ago
    updatedAt: new Date(Date.now() - 7 * 60000).toISOString(),
    paidAt: null,
    prepTime: 30,
    orderItems: [
      {
        id: "OI015",
        orderId: "ORD006",
        menuItemId: "14",
        menuItemName: "Fish and Chips",
        quantity: 1,
        unitPrice: 17.5,
        subtotal: 17.5,
        itemStatus: "QUEUED",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
      {
        id: "OI016",
        orderId: "ORD006",
        menuItemId: "15",
        menuItemName: "Chicken Wings",
        quantity: 1,
        unitPrice: 13.25,
        subtotal: 13.25,
        itemStatus: "QUEUED",
        specialInstructions: "Extra spicy",
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
      {
        id: "OI017",
        orderId: "ORD006",
        menuItemId: "16",
        menuItemName: "Iced Tea",
        quantity: 2,
        unitPrice: 4.0,
        subtotal: 8.0,
        itemStatus: "QUEUED",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD007",
    orderNumber: 1007,
    tableId: "T008",
    tableName: "Table 8",
    userId: "user-789",
    guestName: null,
    guestContact: null,
    waiterId: "1",
    status: "PAID",
    paymentStatus: "PAID",
    totalAmount: 42.0,
    notes: null,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    paidAt: new Date(Date.now() - 90 * 60000).toISOString(),
    prepTime: 28,
    orderItems: [
      {
        id: "OI018",
        orderId: "ORD007",
        menuItemId: "17",
        menuItemName: "Beef Tacos",
        quantity: 3,
        unitPrice: 10.0,
        subtotal: 30.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        id: "OI019",
        orderId: "ORD007",
        menuItemId: "18",
        menuItemName: "Margarita",
        quantity: 2,
        unitPrice: 6.0,
        subtotal: 12.0,
        itemStatus: "READY",
        specialInstructions: "Frozen",
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD008",
    orderNumber: 1008,
    tableId: "T006",
    tableName: "Table 6",
    userId: null,
    guestName: "David Lee",
    guestContact: "+1234567894",
    waiterId: "4",
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalAmount: 75.4,
    notes: "Corporate lunch",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 min ago
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    paidAt: null,
    prepTime: 40,
    orderItems: [
      {
        id: "OI020",
        orderId: "ORD008",
        menuItemId: "3",
        menuItemName: "Grilled Salmon",
        quantity: 2,
        unitPrice: 24.99,
        subtotal: 49.98,
        itemStatus: "COOKING",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: "OI021",
        orderId: "ORD008",
        menuItemId: "10",
        menuItemName: "Caesar Salad",
        quantity: 2,
        unitPrice: 10.5,
        subtotal: 21.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: "OI022",
        orderId: "ORD008",
        menuItemId: "19",
        menuItemName: "Sparkling Water",
        quantity: 2,
        unitPrice: 2.21,
        subtotal: 4.42,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD009",
    orderNumber: 1009,
    tableId: "T009",
    tableName: "Table 9",
    userId: null,
    guestName: "Linda Garcia",
    guestContact: "+1234567895",
    waiterId: "2",
    status: "READY",
    paymentStatus: "UNPAID",
    totalAmount: 33.5,
    notes: "Table near window",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    paidAt: null,
    prepTime: 22,
    orderItems: [
      {
        id: "OI023",
        orderId: "ORD009",
        menuItemId: "20",
        menuItemName: "Vegetable Stir Fry",
        quantity: 1,
        unitPrice: 13.5,
        subtotal: 13.5,
        itemStatus: "READY",
        specialInstructions: "No mushrooms",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "OI024",
        orderId: "ORD009",
        menuItemId: "21",
        menuItemName: "Spring Rolls",
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "OI025",
        orderId: "ORD009",
        menuItemId: "22",
        menuItemName: "Green Tea",
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        itemStatus: "READY",
        specialInstructions: "Hot",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD010",
    orderNumber: 1010,
    tableId: "T010",
    tableName: "Table 10",
    userId: "user-101",
    guestName: null,
    guestContact: null,
    waiterId: "1",
    status: "CANCELLED",
    paymentStatus: "UNPAID",
    totalAmount: 0.0,
    notes: "Customer left",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 175 * 60000).toISOString(),
    paidAt: null,
    prepTime: 0,
    orderItems: [],
  },
  {
    id: "ORD011",
    orderNumber: 1011,
    tableId: "T002",
    tableName: "Table 2",
    userId: null,
    guestName: "Robert Chen",
    guestContact: "+1234567896",
    waiterId: "4",
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalAmount: 55.8,
    notes: null,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(), // 18 min ago
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    paidAt: null,
    prepTime: 35,
    orderItems: [
      {
        id: "OI026",
        orderId: "ORD011",
        menuItemId: "23",
        menuItemName: "BBQ Ribs",
        quantity: 1,
        unitPrice: 22.5,
        subtotal: 22.5,
        itemStatus: "COOKING",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: "OI027",
        orderId: "ORD011",
        menuItemId: "24",
        menuItemName: "Mac and Cheese",
        quantity: 2,
        unitPrice: 9.0,
        subtotal: 18.0,
        itemStatus: "COOKING",
        specialInstructions: "Extra cheese",
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: "OI028",
        orderId: "ORD011",
        menuItemId: "25",
        menuItemName: "Coleslaw",
        quantity: 2,
        unitPrice: 3.5,
        subtotal: 7.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: "OI029",
        orderId: "ORD011",
        menuItemId: "26",
        menuItemName: "Root Beer",
        quantity: 2,
        unitPrice: 4.15,
        subtotal: 8.3,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD012",
    orderNumber: 1012,
    tableId: "T011",
    tableName: "Table 11",
    userId: null,
    guestName: "Patricia Martinez",
    guestContact: "+1234567897",
    waiterId: "2",
    status: "PENDING",
    paymentStatus: "UNPAID",
    totalAmount: 29.5,
    notes: null,
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(), // 3 min ago
    updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    paidAt: null,
    prepTime: 18,
    orderItems: [
      {
        id: "OI030",
        orderId: "ORD012",
        menuItemId: "27",
        menuItemName: "Pancakes",
        quantity: 1,
        unitPrice: 9.5,
        subtotal: 9.5,
        itemStatus: "QUEUED",
        specialInstructions: "Butter on the side",
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        id: "OI031",
        orderId: "ORD012",
        menuItemId: "28",
        menuItemName: "Eggs Benedict",
        quantity: 1,
        unitPrice: 12.0,
        subtotal: 12.0,
        itemStatus: "QUEUED",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        id: "OI032",
        orderId: "ORD012",
        menuItemId: "29",
        menuItemName: "Orange Juice",
        quantity: 2,
        unitPrice: 4.0,
        subtotal: 8.0,
        itemStatus: "QUEUED",
        specialInstructions: "Fresh squeezed",
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD013",
    orderNumber: 1013,
    tableId: "T003",
    tableName: "Table 3",
    userId: "user-202",
    guestName: null,
    guestContact: null,
    waiterId: "1",
    status: "SERVED",
    paymentStatus: "UNPAID",
    totalAmount: 48.25,
    notes: null,
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(), // 55 min ago
    updatedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    paidAt: null,
    prepTime: 26,
    orderItems: [
      {
        id: "OI033",
        orderId: "ORD013",
        menuItemId: "30",
        menuItemName: "Lobster Roll",
        quantity: 1,
        unitPrice: 28.0,
        subtotal: 28.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
      },
      {
        id: "OI034",
        orderId: "ORD013",
        menuItemId: "31",
        menuItemName: "Clam Chowder",
        quantity: 1,
        unitPrice: 8.25,
        subtotal: 8.25,
        itemStatus: "READY",
        specialInstructions: "Extra crackers",
        createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
      },
      {
        id: "OI035",
        orderId: "ORD013",
        menuItemId: "32",
        menuItemName: "White Wine",
        quantity: 2,
        unitPrice: 6.0,
        subtotal: 12.0,
        itemStatus: "READY",
        specialInstructions: "Chilled",
        createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD014",
    orderNumber: 1014,
    tableId: "T012",
    tableName: "Table 12",
    userId: null,
    guestName: "James Anderson",
    guestContact: "+1234567898",
    waiterId: "4",
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalAmount: 62.75,
    notes: "VIP customer",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 min ago
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    paidAt: null,
    prepTime: 32,
    orderItems: [
      {
        id: "OI036",
        orderId: "ORD014",
        menuItemId: "33",
        menuItemName: "Filet Mignon",
        quantity: 1,
        unitPrice: 38.0,
        subtotal: 38.0,
        itemStatus: "COOKING",
        specialInstructions: "Medium",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: "OI037",
        orderId: "ORD014",
        menuItemId: "34",
        menuItemName: "Loaded Baked Potato",
        quantity: 1,
        unitPrice: 7.5,
        subtotal: 7.5,
        itemStatus: "COOKING",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: "OI038",
        orderId: "ORD014",
        menuItemId: "35",
        menuItemName: "Asparagus",
        quantity: 1,
        unitPrice: 6.25,
        subtotal: 6.25,
        itemStatus: "COOKING",
        specialInstructions: "Grilled",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: "OI039",
        orderId: "ORD014",
        menuItemId: "36",
        menuItemName: "Red Wine",
        quantity: 1,
        unitPrice: 11.0,
        subtotal: 11.0,
        itemStatus: "READY",
        specialInstructions: "2018 vintage",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD015",
    orderNumber: 1015,
    tableId: "T013",
    tableName: "Table 13",
    userId: null,
    guestName: "Maria Rodriguez",
    guestContact: "+1234567899",
    waiterId: "2",
    status: "READY",
    paymentStatus: "UNPAID",
    totalAmount: 41.0,
    notes: null,
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(), // 28 min ago
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    paidAt: null,
    prepTime: 24,
    orderItems: [
      {
        id: "OI040",
        orderId: "ORD015",
        menuItemId: "37",
        menuItemName: "Chicken Parmesan",
        quantity: 1,
        unitPrice: 18.5,
        subtotal: 18.5,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
      {
        id: "OI041",
        orderId: "ORD015",
        menuItemId: "38",
        menuItemName: "Garlic Bread",
        quantity: 2,
        unitPrice: 4.5,
        subtotal: 9.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
      {
        id: "OI042",
        orderId: "ORD015",
        menuItemId: "39",
        menuItemName: "Italian Soda",
        quantity: 1,
        unitPrice: 4.5,
        subtotal: 4.5,
        itemStatus: "READY",
        specialInstructions: "Strawberry",
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
      {
        id: "OI043",
        orderId: "ORD015",
        menuItemId: "40",
        menuItemName: "Cannoli",
        quantity: 3,
        unitPrice: 3.0,
        subtotal: 9.0,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
    ],
  },
];

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(initialMockOrders);

  // Update order status
  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              // If marked as paid, update payment info
              ...(newStatus === "PAID" && {
                paymentStatus: "PAID" as PaymentStatus,
                paidAt: new Date().toISOString(),
              }),
            }
          : order
      )
    );
  };

  // Update individual order item status
  const updateOrderItemStatus = (
    orderItemId: string,
    itemStatus: OrderItemStatus
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        orderItems: order.orderItems.map((item) =>
          item.id === orderItemId ? { ...item, itemStatus } : item
        ),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  // Filter orders by status
  const filterByStatus = (status: OrderStatus | "ALL"): Order[] => {
    if (status === "ALL") return orders;
    return orders.filter((order) => order.status === status);
  };

  // Get overdue orders (elapsed time > prep time)
  const getOverdueOrders = (): Order[] => {
    const now = Date.now();
    return orders.filter((order) => {
      const elapsedMinutes = Math.floor(
        (now - new Date(order.createdAt).getTime()) / 60000
      );
      return (
        order.prepTime > 0 &&
        elapsedMinutes > order.prepTime &&
        ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status)
      );
    });
  };

  return {
    orders,
    updateOrderStatus,
    updateOrderItemStatus,
    filterByStatus,
    getOverdueOrders,
  };
};
