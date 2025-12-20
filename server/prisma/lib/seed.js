import { hash } from 'bcrypt';
import { prisma } from './lib.js';
import { UserRole, TableStatus, MenuCategory, OrderStatus, PaymentStatus, OrderItemStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Password hash for all users (password: "password123")
  const passwordHash = await hash('password123', 12);

  // ========================================
  // 1. USERS (1 super admin, 2 admins, 3 waiters, 2 kitchen staff, 5 customers)
  // ========================================
  console.log('👤 Creating users...');

  // 1 Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@smartrestaurant.com',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      name: 'Super Administrator',
      phoneNumber: '+1-555-0100',
    },
  });

  // 2 Restaurant Admins
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin1@restaurant.com',
      passwordHash,
      role: UserRole.ADMIN,
      name: 'John Smith',
      phoneNumber: '+1-555-0101',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@restaurant.com',
      passwordHash,
      role: UserRole.ADMIN,
      name: 'Sarah Johnson',
      phoneNumber: '+1-555-0102',
    },
  });

  // 3 Waiters
  const waiter1 = await prisma.user.create({
    data: {
      email: 'waiter1@restaurant.com',
      passwordHash,
      role: UserRole.WAITER,
      name: 'Mike Davis',
      phoneNumber: '+1-555-0201',
    },
  });

  const waiter2 = await prisma.user.create({
    data: {
      email: 'waiter2@restaurant.com',
      passwordHash,
      role: UserRole.WAITER,
      name: 'Emily Chen',
      phoneNumber: '+1-555-0202',
    },
  });

  const waiter3 = await prisma.user.create({
    data: {
      email: 'waiter3@restaurant.com',
      passwordHash,
      role: UserRole.WAITER,
      name: 'Carlos Rodriguez',
      phoneNumber: '+1-555-0203',
    },
  });

  // 2 Kitchen Staff
  const kitchen1 = await prisma.user.create({
    data: {
      email: 'kitchen1@restaurant.com',
      passwordHash,
      role: UserRole.KITCHEN_STAFF,
      name: 'Chef Gordon',
      phoneNumber: '+1-555-0301',
    },
  });

  const kitchen2 = await prisma.user.create({
    data: {
      email: 'kitchen2@restaurant.com',
      passwordHash,
      role: UserRole.KITCHEN_STAFF,
      name: 'Sous Chef Maria',
      phoneNumber: '+1-555-0302',
    },
  });

  // 5 Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      name: 'Alice Williams',
      phoneNumber: '+1-555-1001',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      name: 'Bob Taylor',
      phoneNumber: '+1-555-1002',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'customer3@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      name: 'Carol Martinez',
      phoneNumber: '+1-555-1003',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      email: 'customer4@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      name: 'David Lee',
      phoneNumber: '+1-555-1004',
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      email: 'customer5@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      name: 'Emma Garcia',
      phoneNumber: '+1-555-1005',
    },
  });

  console.log(`✅ Created ${await prisma.user.count()} users\n`);

  // ========================================
  // 2. RESTAURANT
  // ========================================
  console.log('🏪 Creating restaurant...');

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Smart Bistro',
      address: '123 Main Street, Cityville, ST 12345',
      phoneNumber: '+1-555-BISTRO',
      adminId: admin1.id,
    },
  });

  console.log(`✅ Created restaurant: ${restaurant.name}\n`);

  // ========================================
  // 3. TABLES (5 tables with capacities: 2, 4, 4, 6, 8)
  // ========================================
  console.log('🪑 Creating tables...');

  await prisma.table.createMany({
    data: [
      {
        tableNumber: 1,
        capacity: 2,
        status: TableStatus.AVAILABLE,
        qrCode: 'QR-TABLE-001',
        restaurantId: restaurant.id,
      },
      {
        tableNumber: 2,
        capacity: 4,
        status: TableStatus.OCCUPIED,
        qrCode: 'QR-TABLE-002',
        restaurantId: restaurant.id,
      },
      {
        tableNumber: 3,
        capacity: 4,
        status: TableStatus.AVAILABLE,
        qrCode: 'QR-TABLE-003',
        restaurantId: restaurant.id,
      },
      {
        tableNumber: 4,
        capacity: 6,
        status: TableStatus.RESERVED,
        qrCode: 'QR-TABLE-004',
        restaurantId: restaurant.id,
      },
      {
        tableNumber: 5,
        capacity: 8,
        status: TableStatus.AVAILABLE,
        qrCode: 'QR-TABLE-005',
        restaurantId: restaurant.id,
      },
    ],
  });

  // Fetch created tables for later use
  const table1 = await prisma.table.findUnique({ where: { tableNumber: 1 } });
  const table2 = await prisma.table.findUnique({ where: { tableNumber: 2 } });
  const table3 = await prisma.table.findUnique({ where: { tableNumber: 3 } });
  const table4 = await prisma.table.findUnique({ where: { tableNumber: 4 } });
  const table5 = await prisma.table.findUnique({ where: { tableNumber: 5 } });

  // Validate all tables exist
  if (!table1 || !table2 || !table3 || !table4 || !table5) {
    throw new Error('Failed to create all required tables');
  }

  console.log(`✅ Created ${await prisma.table.count()} tables\n`);

  // ========================================
  // 4. CATEGORIES
  // ========================================
  console.log('📂 Creating categories...');

  const appetizerCat = await prisma.category.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with these delicious starters',
      displayOrder: 1,
      restaurantId: restaurant.id,
    },
  });

  const mainCourseCat = await prisma.category.create({
    data: {
      name: 'Main Courses',
      description: 'Our signature main dishes',
      displayOrder: 2,
      restaurantId: restaurant.id,
    },
  });

  const dessertCat = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Sweet endings to your perfect meal',
      displayOrder: 3,
      restaurantId: restaurant.id,
    },
  });

  const beverageCat = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Refreshing drinks and cocktails',
      displayOrder: 4,
      restaurantId: restaurant.id,
    },
  });

  console.log(`✅ Created ${await prisma.category.count()} categories\n`);

  // ========================================
  // 5. MENU ITEMS (20 items - 4 per category with modifiers)
  // ========================================
  console.log('🍽️  Creating menu items...');

  // APPETIZERS (4 items)
  const bruschetta = await prisma.menuItem.create({
    data: {
      name: 'Bruschetta',
      description: 'Toasted bread with fresh tomatoes, basil, and garlic',
      category: MenuCategory.APPETIZER,
      price: 8.99,
      imageUrl: 'https://example.com/images/bruschetta.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 10,
      categoryId: appetizerCat.id,
      restaurantId: restaurant.id,
    },
  });

  const springRolls = await prisma.menuItem.create({
    data: {
      name: 'Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili sauce',
      category: MenuCategory.APPETIZER,
      price: 7.99,
      imageUrl: 'https://example.com/images/spring-rolls.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 8,
      categoryId: appetizerCat.id,
      restaurantId: restaurant.id,
    },
  });

  const calamari = await prisma.menuItem.create({
    data: {
      name: 'Fried Calamari',
      description: 'Crispy calamari rings with marinara sauce',
      category: MenuCategory.APPETIZER,
      price: 12.99,
      imageUrl: 'https://example.com/images/calamari.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 12,
      categoryId: appetizerCat.id,
      restaurantId: restaurant.id,
    },
  });

  const garlicBread = await prisma.menuItem.create({
    data: {
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      category: MenuCategory.APPETIZER,
      price: 5.99,
      imageUrl: 'https://example.com/images/garlic-bread.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 5,
      categoryId: appetizerCat.id,
      restaurantId: restaurant.id,
    },
  });

  // MAIN COURSES (4 items)
  const grilledSalmon = await prisma.menuItem.create({
    data: {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      category: MenuCategory.MAIN_COURSE,
      price: 24.99,
      imageUrl: 'https://example.com/images/salmon.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 20,
      categoryId: mainCourseCat.id,
      restaurantId: restaurant.id,
    },
  });

  const chickenParmesan = await prisma.menuItem.create({
    data: {
      name: 'Chicken Parmesan',
      description: 'Breaded chicken breast with marinara and mozzarella',
      category: MenuCategory.MAIN_COURSE,
      price: 18.99,
      imageUrl: 'https://example.com/images/chicken-parm.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 25,
      categoryId: mainCourseCat.id,
      restaurantId: restaurant.id,
    },
  });

  const ribeyeSteak = await prisma.menuItem.create({
    data: {
      name: 'Ribeye Steak',
      description: '12oz premium ribeye with garlic mashed potatoes',
      category: MenuCategory.MAIN_COURSE,
      price: 34.99,
      imageUrl: 'https://example.com/images/ribeye.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 30,
      categoryId: mainCourseCat.id,
      restaurantId: restaurant.id,
    },
  });

  const veggiePasta = await prisma.menuItem.create({
    data: {
      name: 'Vegetable Pasta',
      description: 'Penne pasta with seasonal vegetables in olive oil',
      category: MenuCategory.MAIN_COURSE,
      price: 15.99,
      imageUrl: 'https://example.com/images/veggie-pasta.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 18,
      categoryId: mainCourseCat.id,
      restaurantId: restaurant.id,
    },
  });

  // DESSERTS (4 items)
  const tiramisu = await prisma.menuItem.create({
    data: {
      name: 'Tiramisu',
      description: 'Classic Italian dessert with espresso and mascarpone',
      category: MenuCategory.DESSERT,
      price: 8.99,
      imageUrl: 'https://example.com/images/tiramisu.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 5,
      categoryId: dessertCat.id,
      restaurantId: restaurant.id,
    },
  });

  const cheesecake = await prisma.menuItem.create({
    data: {
      name: 'New York Cheesecake',
      description: 'Creamy cheesecake with berry compote',
      category: MenuCategory.DESSERT,
      price: 7.99,
      imageUrl: 'https://example.com/images/cheesecake.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 5,
      categoryId: dessertCat.id,
      restaurantId: restaurant.id,
    },
  });

  const lavaCake = await prisma.menuItem.create({
    data: {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center and vanilla ice cream',
      category: MenuCategory.DESSERT,
      price: 9.99,
      imageUrl: 'https://example.com/images/lava-cake.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 12,
      categoryId: dessertCat.id,
      restaurantId: restaurant.id,
    },
  });

  const gelato = await prisma.menuItem.create({
    data: {
      name: 'Italian Gelato',
      description: 'Three scoops of artisan gelato (choice of flavors)',
      category: MenuCategory.DESSERT,
      price: 6.99,
      imageUrl: 'https://example.com/images/gelato.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 3,
      categoryId: dessertCat.id,
      restaurantId: restaurant.id,
    },
  });

  // BEVERAGES (4 items)
  const coke = await prisma.menuItem.create({
    data: {
      name: 'Coca-Cola',
      description: 'Classic Coca-Cola (12oz)',
      category: MenuCategory.BEVERAGE,
      price: 2.99,
      imageUrl: 'https://example.com/images/coke.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 1,
      categoryId: beverageCat.id,
      restaurantId: restaurant.id,
    },
  });

  const lemonade = await prisma.menuItem.create({
    data: {
      name: 'Fresh Lemonade',
      description: 'Homemade lemonade with fresh lemons',
      category: MenuCategory.BEVERAGE,
      price: 3.99,
      imageUrl: 'https://example.com/images/lemonade.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: true,
      preparationTime: 3,
      categoryId: beverageCat.id,
      restaurantId: restaurant.id,
    },
  });

  const espresso = await prisma.menuItem.create({
    data: {
      name: 'Espresso',
      description: 'Double shot of Italian espresso',
      category: MenuCategory.BEVERAGE,
      price: 3.50,
      imageUrl: 'https://example.com/images/espresso.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 2,
      categoryId: beverageCat.id,
      restaurantId: restaurant.id,
    },
  });

  const redWine = await prisma.menuItem.create({
    data: {
      name: 'House Red Wine',
      description: 'Glass of premium house red wine',
      category: MenuCategory.BEVERAGE,
      price: 8.99,
      imageUrl: 'https://example.com/images/red-wine.jpg',
      isAvailable: true,
      isSoldOut: false,
      isChefRecommendation: false,
      preparationTime: 2,
      categoryId: beverageCat.id,
      restaurantId: restaurant.id,
    },
  });

  console.log(`✅ Created ${await prisma.menuItem.count()} menu items\n`);

  // ========================================
  // 6. MODIFIERS (for menu items)
  // ========================================
  console.log('🔧 Creating modifiers...');

  // Modifiers for Ribeye Steak
  await prisma.modifier.createMany({
    data: [
      { name: 'Extra Rare', price: 0, groupName: 'Cooking Level', menuItemId: ribeyeSteak.id, restaurantId: restaurant.id },
      { name: 'Medium Rare', price: 0, groupName: 'Cooking Level', menuItemId: ribeyeSteak.id, restaurantId: restaurant.id },
      { name: 'Well Done', price: 0, groupName: 'Cooking Level', menuItemId: ribeyeSteak.id, restaurantId: restaurant.id },
      { name: 'Add Mushrooms', price: 3.99, groupName: 'Extras', menuItemId: ribeyeSteak.id, restaurantId: restaurant.id },
      { name: 'Add Shrimp', price: 6.99, groupName: 'Extras', menuItemId: ribeyeSteak.id, restaurantId: restaurant.id },
    ],
  });

  // Modifiers for Grilled Salmon
  await prisma.modifier.createMany({
    data: [
      { name: 'Extra Lemon', price: 0, groupName: 'Extras', menuItemId: grilledSalmon.id, restaurantId: restaurant.id },
      { name: 'Side Salad', price: 2.99, groupName: 'Sides', menuItemId: grilledSalmon.id, restaurantId: restaurant.id },
      { name: 'Side Vegetables', price: 2.99, groupName: 'Sides', menuItemId: grilledSalmon.id, restaurantId: restaurant.id },
    ],
  });

  // Modifiers for Vegetable Pasta
  await prisma.modifier.createMany({
    data: [
      { name: 'Extra Cheese', price: 1.99, groupName: 'Toppings', menuItemId: veggiePasta.id, restaurantId: restaurant.id },
      { name: 'Add Chicken', price: 4.99, groupName: 'Protein', menuItemId: veggiePasta.id, restaurantId: restaurant.id },
      { name: 'Gluten-Free Pasta', price: 2.00, groupName: 'Options', menuItemId: veggiePasta.id, restaurantId: restaurant.id },
    ],
  });

  // Modifiers for Garlic Bread
  await prisma.modifier.createMany({
    data: [
      { name: 'Extra Garlic', price: 0.50, groupName: 'Extras', menuItemId: garlicBread.id, restaurantId: restaurant.id },
      { name: 'Add Cheese', price: 1.99, groupName: 'Extras', menuItemId: garlicBread.id, restaurantId: restaurant.id },
    ],
  });

  // Modifiers for Gelato
  await prisma.modifier.createMany({
    data: [
      { name: 'Vanilla', price: 0, groupName: 'Flavors', menuItemId: gelato.id, restaurantId: restaurant.id },
      { name: 'Chocolate', price: 0, groupName: 'Flavors', menuItemId: gelato.id, restaurantId: restaurant.id },
      { name: 'Strawberry', price: 0, groupName: 'Flavors', menuItemId: gelato.id, restaurantId: restaurant.id },
      { name: 'Pistachio', price: 0, groupName: 'Flavors', menuItemId: gelato.id, restaurantId: restaurant.id },
    ],
  });

  console.log(`✅ Created ${await prisma.modifier.count()} modifiers\n`);

  // ========================================
  // 7. ORDERS (10 sample orders)
  // ========================================
  console.log('📝 Creating sample orders...');

  // Order 1 - Customer 1, Table 2, CONFIRMED
  const order1 = await prisma.order.create({
    data: {
      tableId: table2.id,
      userId: customer1.id,
      waiterId: waiter1.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: 52.97,
      paymentStatus: PaymentStatus.UNPAID,
      notes: 'Extra napkins please',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        menuItemId: bruschetta.id,
        quantity: 1,
        unitPrice: 8.99,
        subtotal: 8.99,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order1.id,
        menuItemId: grilledSalmon.id,
        quantity: 1,
        unitPrice: 24.99,
        subtotal: 24.99,
        itemStatus: OrderItemStatus.COOKING,
      },
      {
        orderId: order1.id,
        menuItemId: ribeyeSteak.id,
        quantity: 1,
        unitPrice: 34.99,
        subtotal: 34.99,
        itemStatus: OrderItemStatus.COOKING,
        specialInstructions: 'Medium rare, please',
      },
    ],
  });

  // Order 2 - Customer 2, Table 1, PREPARING
  const order2 = await prisma.order.create({
    data: {
      tableId: table1.id,
      userId: customer2.id,
      waiterId: waiter2.id,
      status: OrderStatus.PREPARING,
      totalAmount: 27.97,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        menuItemId: springRolls.id,
        quantity: 2,
        unitPrice: 7.99,
        subtotal: 15.98,
        itemStatus: OrderItemStatus.COOKING,
      },
      {
        orderId: order2.id,
        menuItemId: lemonade.id,
        quantity: 2,
        unitPrice: 3.99,
        subtotal: 7.98,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order2.id,
        menuItemId: cheesecake.id,
        quantity: 1,
        unitPrice: 7.99,
        subtotal: 7.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
    ],
  });

  // Order 3 - Guest Order, Table 3, PENDING
  const order3 = await prisma.order.create({
    data: {
      tableId: table3.id,
      userId: null,
      guestName: 'John Doe',
      guestContact: '+1-555-9999',
      waiterId: waiter1.id,
      status: OrderStatus.PENDING,
      totalAmount: 45.96,
      paymentStatus: PaymentStatus.UNPAID,
      notes: 'Birthday celebration - need candle for dessert',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        menuItemId: chickenParmesan.id,
        quantity: 2,
        unitPrice: 18.99,
        subtotal: 37.98,
        itemStatus: OrderItemStatus.QUEUED,
      },
      {
        orderId: order3.id,
        menuItemId: lavaCake.id,
        quantity: 1,
        unitPrice: 9.99,
        subtotal: 9.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
    ],
  });

  // Order 4 - Customer 3, Table 5, SERVED
  const order4 = await prisma.order.create({
    data: {
      tableId: table5.id,
      userId: customer3.id,
      waiterId: waiter3.id,
      status: OrderStatus.SERVED,
      totalAmount: 89.92,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order4.id,
        menuItemId: calamari.id,
        quantity: 2,
        unitPrice: 12.99,
        subtotal: 25.98,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order4.id,
        menuItemId: ribeyeSteak.id,
        quantity: 2,
        unitPrice: 34.99,
        subtotal: 69.98,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order4.id,
        menuItemId: redWine.id,
        quantity: 2,
        unitPrice: 8.99,
        subtotal: 17.98,
        itemStatus: OrderItemStatus.READY,
      },
    ],
  });

  // Order 5 - Customer 4, Table 2, PAID
  const order5 = await prisma.order.create({
    data: {
      tableId: table2.id,
      userId: customer4.id,
      waiterId: waiter2.id,
      status: OrderStatus.PAID,
      totalAmount: 31.97,
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order5.id,
        menuItemId: veggiePasta.id,
        quantity: 1,
        unitPrice: 15.99,
        subtotal: 15.99,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order5.id,
        menuItemId: tiramisu.id,
        quantity: 1,
        unitPrice: 8.99,
        subtotal: 8.99,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order5.id,
        menuItemId: espresso.id,
        quantity: 2,
        unitPrice: 3.50,
        subtotal: 7.00,
        itemStatus: OrderItemStatus.READY,
      },
    ],
  });

  // Order 6 - Customer 5, Table 1, READY
  const order6 = await prisma.order.create({
    data: {
      tableId: table1.id,
      userId: customer5.id,
      waiterId: waiter1.id,
      status: OrderStatus.READY,
      totalAmount: 19.97,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order6.id,
        menuItemId: garlicBread.id,
        quantity: 1,
        unitPrice: 5.99,
        subtotal: 5.99,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order6.id,
        menuItemId: gelato.id,
        quantity: 2,
        unitPrice: 6.99,
        subtotal: 13.98,
        itemStatus: OrderItemStatus.READY,
      },
    ],
  });

  // Order 7 - Guest Order, Table 4, CONFIRMED
  const order7 = await prisma.order.create({
    data: {
      tableId: table4.id,
      userId: null,
      guestName: 'Jane Smith',
      guestContact: '+1-555-8888',
      waiterId: waiter3.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: 53.96,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order7.id,
        menuItemId: bruschetta.id,
        quantity: 2,
        unitPrice: 8.99,
        subtotal: 17.98,
        itemStatus: OrderItemStatus.QUEUED,
      },
      {
        orderId: order7.id,
        menuItemId: chickenParmesan.id,
        quantity: 1,
        unitPrice: 18.99,
        subtotal: 18.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
      {
        orderId: order7.id,
        menuItemId: veggiePasta.id,
        quantity: 1,
        unitPrice: 15.99,
        subtotal: 15.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
    ],
  });

  // Order 8 - Customer 1, Table 3, CANCELLED
  const order8 = await prisma.order.create({
    data: {
      tableId: table3.id,
      userId: customer1.id,
      waiterId: waiter2.id,
      status: OrderStatus.CANCELLED,
      totalAmount: 24.99,
      paymentStatus: PaymentStatus.UNPAID,
      notes: 'Customer changed mind',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order8.id,
        menuItemId: grilledSalmon.id,
        quantity: 1,
        unitPrice: 24.99,
        subtotal: 24.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
    ],
  });

  // Order 9 - Customer 2, Table 5, PREPARING
  const order9 = await prisma.order.create({
    data: {
      tableId: table5.id,
      userId: customer2.id,
      waiterId: waiter1.id,
      status: OrderStatus.PREPARING,
      totalAmount: 63.95,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order9.id,
        menuItemId: calamari.id,
        quantity: 1,
        unitPrice: 12.99,
        subtotal: 12.99,
        itemStatus: OrderItemStatus.READY,
      },
      {
        orderId: order9.id,
        menuItemId: ribeyeSteak.id,
        quantity: 1,
        unitPrice: 34.99,
        subtotal: 34.99,
        itemStatus: OrderItemStatus.COOKING,
      },
      {
        orderId: order9.id,
        menuItemId: lavaCake.id,
        quantity: 1,
        unitPrice: 9.99,
        subtotal: 9.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
      {
        orderId: order9.id,
        menuItemId: coke.id,
        quantity: 2,
        unitPrice: 2.99,
        subtotal: 5.98,
        itemStatus: OrderItemStatus.READY,
      },
    ],
  });

  // Order 10 - Customer 3, Table 2, PENDING
  const order10 = await prisma.order.create({
    data: {
      tableId: table2.id,
      userId: customer3.id,
      waiterId: waiter2.id,
      status: OrderStatus.PENDING,
      totalAmount: 12.98,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order10.id,
        menuItemId: lemonade.id,
        quantity: 2,
        unitPrice: 3.99,
        subtotal: 7.98,
        itemStatus: OrderItemStatus.QUEUED,
      },
      {
        orderId: order10.id,
        menuItemId: garlicBread.id,
        quantity: 1,
        unitPrice: 5.99,
        subtotal: 5.99,
        itemStatus: OrderItemStatus.QUEUED,
      },
    ],
  });

  console.log(`✅ Created ${await prisma.order.count()} orders with ${await prisma.orderItem.count()} order items\n`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('📊 SEED SUMMARY');
  console.log('=====================================');
  console.log(`👥 Users: ${await prisma.user.count()}`);
  console.log(`   - Super Admins: 1`);
  console.log(`   - Admins: 2`);
  console.log(`   - Waiters: 3`);
  console.log(`   - Kitchen Staff: 2`);
  console.log(`   - Customers: 5`);
  console.log(`🏪 Restaurants: ${await prisma.restaurant.count()}`);
  console.log(`🪑 Tables: ${await prisma.table.count()}`);
  console.log(`📂 Categories: ${await prisma.category.count()}`);
  console.log(`🍽️  Menu Items: ${await prisma.menuItem.count()}`);
  console.log(`🔧 Modifiers: ${await prisma.modifier.count()}`);
  console.log(`📝 Orders: ${await prisma.order.count()}`);
  console.log(`📦 Order Items: ${await prisma.orderItem.count()}`);
  console.log('=====================================\n');

  console.log('✅ Database seed completed successfully!\n');
  console.log('📧 Test Credentials:');
  console.log('   Email: superadmin@smartrestaurant.com | Password: password123');
  console.log('   Email: admin1@restaurant.com | Password: password123');
  console.log('   Email: waiter1@restaurant.com | Password: password123');
  console.log('   Email: kitchen1@restaurant.com | Password: password123');
  console.log('   Email: customer1@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
