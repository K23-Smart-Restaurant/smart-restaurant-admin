import { Server } from 'socket.io';
import { logger } from '../config/winston.config.js';
import { REDIS_CHANNELS } from '../config/redis.config.js';

/**
 * T410-T413: Socket.IO service for real-time communication
 * Manages real-time updates for Kitchen Display System and Waiter Dashboard
 */
class SocketService {
  constructor() {
    this.io = null;
    this.rooms = {
      kitchen: 'kitchen',
      waiter: 'waiter',
      admin: 'admin',
    };
  }

  /**
   * Initialize Socket.IO with HTTP server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.RENDER_ADMIN_URL,
          process.env.VERCEL_ADMIN_URL,
          process.env.CLIENT_URL,
          process.env.CUSTOMER_APP_URL,
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
          'http://127.0.0.1:3000',
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    logger.info('✅ Socket.IO initialized successfully');
    return this.io;
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`);

      // T413: Handle room joining
      socket.on('join:room', (data) => {
        const { role, userId } = data;
        this.joinRoom(socket, role, userId);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error: ${error.message}`);
      });
    });
  }

  /**
   * T413: Join a room based on user role
   * @param {Object} socket - Socket instance
   * @param {string} role - User role (KITCHEN_STAFF, WAITER, ADMIN)
   * @param {string} userId - User ID
   */
  joinRoom(socket, role, userId) {
    let room;

    switch (role) {
      case 'KITCHEN_STAFF':
        room = this.rooms.kitchen;
        break;
      case 'WAITER':
        room = this.rooms.waiter;
        break;
      case 'ADMIN':
        room = this.rooms.admin;
        break;
      default:
        logger.warn(`Unknown role: ${role} for user ${userId}`);
        return;
    }

    socket.join(room);
    logger.info(`👤 User ${userId} (${role}) joined room: ${room}`);

    // Notify the client
    socket.emit('room:joined', {
      room,
      message: `Successfully joined ${room} room`,
    });

    // Admins can join all rooms to monitor
    if (role === 'ADMIN') {
      socket.join(this.rooms.kitchen);
      socket.join(this.rooms.waiter);
      logger.info(`👤 Admin ${userId} joined all monitoring rooms`);
    }
  }

  /**
   * T410: Emit order:created event to waiter room
   * When a customer creates a new order (PENDING status)
   * @param {Object} order - Order data
   */
  emitOrderCreated(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(this.rooms.waiter).emit('order:created', {
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:created to waiter room: Order #${order.orderNumber}`);
  }

  /**
   * T411: Emit order:confirmed event to kitchen room
   * When waiter confirms an order (PENDING -> CONFIRMED)
   * @param {Object} order - Order data
   */
  emitOrderConfirmed(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(this.rooms.kitchen).emit('order:confirmed', {
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:confirmed to kitchen room: Order #${order.orderNumber}`);
  }

  /**
   * T412: Emit order:ready event to waiter room
   * When kitchen marks order as ready (PREPARING -> READY)
   * @param {Object} order - Order data
   */
  emitOrderReady(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(this.rooms.waiter).emit('order:ready', {
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:ready to waiter room: Order #${order.orderNumber}`);
  }

  /**
   * Emit order:preparing event
   * When kitchen starts preparing (CONFIRMED -> PREPARING)
   * @param {Object} order - Order data
   */
  emitOrderPreparing(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    // Notify kitchen to update UI
    this.io.to(this.rooms.kitchen).emit('order:preparing', {
      order,
      timestamp: new Date().toISOString(),
    });

    // Also notify waiters
    this.io.to(this.rooms.waiter).emit('order:preparing', {
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:preparing: Order #${order.orderNumber}`);
  }

  /**
   * Emit payment:completed event
   * When waiter confirms payment (order -> COMPLETED, payment -> PAID)
   * @param {Object} order - Order data
   */
  emitPaymentCompleted(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    // Notify waiters
    this.io.to(this.rooms.waiter).emit('payment:completed', {
      order,
      orderId: order.id,
      tableNumber: order.table?.tableNumber,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted payment:completed: Order #${order.orderNumber}`);
  }

  /**
   * Emit bill:requested event to waiter room
   * When customer requests bill
   * @param {Object} order - Order data
   */
  emitBillRequested(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(this.rooms.waiter).emit('bill:requested', {
      orderId: order.id || order.orderId,
      tableNumber: order.tableNumber || order.table?.tableNumber,
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted bill:requested to waiter room: Order #${order.orderNumber}`);
  }

  /**
   * Emit order:cancelled event
   * When an order is cancelled
   * @param {Object} order - Order data
   */
  emitOrderCancelled(order) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    // Notify both kitchen and waiter
    this.io.to(this.rooms.kitchen).emit('order:cancelled', {
      order,
      timestamp: new Date().toISOString(),
    });

    this.io.to(this.rooms.waiter).emit('order:cancelled', {
      order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:cancelled: Order #${order.orderNumber}`);
  }

  /**
   * Handle incoming Redis messages from customer server
   * Routes messages to appropriate Socket.IO rooms
   * @param {string} channel - Redis channel name
   * @param {Object} data - Message data
   */
  handleRedisMessage(channel, data) {
    if (!this.io) {
      logger.warn('Socket.IO not initialized, cannot handle Redis message');
      return;
    }

    logger.info(`[Redis→Socket] Received from ${channel}`);

    switch (channel) {
      case REDIS_CHANNELS.ORDER_CREATED:
        // New order from customer app → notify waiters
        this.emitOrderCreated(data.order);
        break;

      case REDIS_CHANNELS.ORDER_STATUS_UPDATED:
        // Order status changed → notify appropriate rooms
        if (data.newStatus === 'CONFIRMED') {
          this.emitOrderConfirmed(data.order);
        } else if (data.newStatus === 'PREPARING') {
          this.emitOrderPreparing(data.order);
        } else if (data.newStatus === 'READY') {
          this.emitOrderReady(data.order);
        } else if (data.newStatus === 'CANCELLED') {
          this.emitOrderCancelled(data.order);
        }
        break;

      case REDIS_CHANNELS.BILL_REQUESTED:
        // Bill requested → notify waiters
        this.emitBillRequested({
          orderNumber: data.tableNumber, // For display purposes
          tableNumber: data.tableNumber,
          ...data,
        });
        break;

      default:
        logger.debug(`[Redis] Unhandled channel: ${channel}`);
    }
  }

  /**
   * Get Socket.IO instance
   * @returns {Object} Socket.IO instance
   */
  getIO() {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Call initialize() first.');
    }
    return this.io;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
