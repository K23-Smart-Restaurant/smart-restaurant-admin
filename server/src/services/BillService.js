import prisma from '../lib/prisma.js';

/**
 * BillService - Handles bill generation and payment processing
 * T474-T476: Bill calculation, generation, and payment recording
 */
class BillService {
  /**
   * T474: Calculate bill total with tax and modifiers
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Bill details with breakdown
   */
  async calculateBill(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            tableNumber: true,
            location: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate subtotal from order items
    let subtotal = 0;
    const itemsBreakdown = order.orderItems.map((item) => {
      const itemTotal = Number(item.subtotal);
      subtotal += itemTotal;

      return {
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: itemTotal,
        specialInstructions: item.specialInstructions,
      };
    });

    // Tax calculation (10% VAT as default)
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.1;
    const taxAmount = subtotal * taxRate;

    // Service charge (optional, default 5%)
    const serviceChargeRate = parseFloat(process.env.SERVICE_CHARGE_RATE) || 0.05;
    const serviceCharge = subtotal * serviceChargeRate;

    // Total calculation
    const total = subtotal + taxAmount + serviceCharge;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.tableNumber,
      tableLocation: order.table.location,
      guestName: order.guestName || order.customer?.name || 'Guest',
      guestContact: order.guestContact || order.customer?.email || '',
      items: itemsBreakdown,
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: taxRate * 100, // Convert to percentage
      taxAmount: Number(taxAmount.toFixed(2)),
      serviceChargeRate: serviceChargeRate * 100,
      serviceCharge: Number(serviceCharge.toFixed(2)),
      total: Number(total.toFixed(2)),
      createdAt: order.createdAt,
      status: order.status,
    };
  }

  /**
   * T475: Generate bill (JSON format - PDF generation can be added later)
   * @param {string} orderId - Order ID
   * @param {number} discount - Optional discount amount
   * @returns {Promise<Object>} Generated bill
   */
  async generateBill(orderId, discount = 0) {
    // Calculate bill
    const bill = await this.calculateBill(orderId);

    // Apply discount if provided
    if (discount > 0) {
      bill.discount = Number(discount);
      bill.total = Number((bill.total - discount).toFixed(2));
    }

    // Update order to mark bill as requested
    await prisma.order.update({
      where: { id: orderId },
      data: {
        billRequested: true,
        billRequestedAt: new Date(),
        totalAmount: bill.total,
      },
    });

    return {
      ...bill,
      generatedAt: new Date(),
      billNumber: `BILL-${bill.orderNumber}`,
    };
  }

  /**
   * T476: Record payment
   * @param {string} orderId - Order ID
   * @param {string} paymentMethod - CASH, CARD, or E_WALLET
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} Payment record
   */
  async recordPayment(orderId, paymentMethod) {
    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate payment method
    const validMethods = ['CASH', 'CARD', 'E_WALLET'];
    if (!validMethods.includes(paymentMethod)) {
      throw new Error(`Invalid payment method: ${paymentMethod}`);
    }

    let payment;

    if (paymentMethod === 'CASH') {
      // Create payment record for cash payment
      payment = await prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          method: paymentMethod,
          status: 'SUCCESS',
          completedAt: new Date(),
          metadata: {
            processedBy: 'waiter',
            processedAt: new Date(),
          },
        },
      });
    }

    // Update order status to COMPLETED and payment status to PAID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    // Update table status to AVAILABLE
    await prisma.table.update({
      where: { id: order.tableId },
      data: {
        status: 'AVAILABLE',
      },
    });

    return {
      success: true,
      payment,
      message: 'Payment recorded successfully',
    };
  }

  /**
   * Get bill for an order (if it exists)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Bill details
   */
  async getBill(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.billRequested) {
      throw new Error('Bill has not been generated for this order');
    }

    return this.calculateBill(orderId);
  }
}

export default BillService;
