import { Server } from 'socket.io';
import { logger } from '../config/winston.config.js';

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
      event: 'order:created',
      data: order,
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
      event: 'order:confirmed',
      data: order,
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
      event: 'order:ready',
      data: order,
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
      event: 'order:preparing',
      data: order,
      timestamp: new Date().toISOString(),
    });

    // Also notify waiters
    this.io.to(this.rooms.waiter).emit('order:preparing', {
      event: 'order:preparing',
      data: order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:preparing: Order #${order.orderNumber}`);
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
      event: 'bill:requested',
      data: order,
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
      event: 'order:cancelled',
      data: order,
      timestamp: new Date().toISOString(),
    });

    this.io.to(this.rooms.waiter).emit('order:cancelled', {
      event: 'order:cancelled',
      data: order,
      timestamp: new Date().toISOString(),
    });

    logger.info(`📢 Emitted order:cancelled: Order #${order.orderNumber}`);
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
