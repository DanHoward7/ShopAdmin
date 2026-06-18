import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrderStatusChange {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy?: string;
  reason?: string;
  createdAt: Date;
}

export class OrderHistoryService {
  /**
   * Record a status change in order history
   */
  async recordStatusChange(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    changedBy?: string,
    reason?: string
  ): Promise<void> {
    try {
      // For now, we'll add this as a note to the order
      // In a full implementation, you'd create a separate OrderHistory table
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      const statusChangeNote = `Status changed from ${fromStatus || 'NEW'} to ${toStatus}${
        changedBy ? ` by ${changedBy}` : ''
      }${reason ? `. Reason: ${reason}` : ''}. Changed at ${new Date().toISOString()}`;

      const existingNotes = order.notes || '';
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n\n--- STATUS HISTORY ---\n${statusChangeNote}`
        : `--- STATUS HISTORY ---\n${statusChangeNote}`;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          notes: updatedNotes,
        },
      });

      console.log(`Order ${orderId} status change recorded: ${fromStatus} → ${toStatus}`);
    } catch (error) {
      console.error('Error recording status change:', error);
      throw error;
    }
  }

  /**
   * Get order status history
   */
  async getOrderHistory(orderId: string): Promise<string[]> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { notes: true },
      });

      if (!order || !order.notes) {
        return [];
      }

      // Extract status history from notes
      const historySection = order.notes.split('--- STATUS HISTORY ---')[1];
      if (!historySection) {
        return [];
      }

      return historySection
        .split('\n')
        .filter(line => line.trim().startsWith('Status changed'))
        .map(line => line.trim());
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  }

  /**
   * Get recent status changes across all orders
   */
  async getRecentStatusChanges(limit: number = 50): Promise<any[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          notes: {
            contains: 'STATUS HISTORY',
          },
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: limit,
      });

      return orders.map(order => {
        const history = this.extractLatestStatusChange(order.notes || '');
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          currentStatus: order.status,
          store: order.store,
          customer: order.customer,
          latestChange: history,
          updatedAt: order.updatedAt,
        };
      });
    } catch (error) {
      console.error('Error getting recent status changes:', error);
      throw error;
    }
  }

  /**
   * Extract the latest status change from notes
   */
  private extractLatestStatusChange(notes: string): string | null {
    const historySection = notes.split('--- STATUS HISTORY ---')[1] ?? null;
    if (!historySection) {
      return null;
    }

    const changes = historySection
      .split('\n')
      .filter(line => line.trim().startsWith('Status changed'))
      .map(line => line.trim());

    return changes.length > 0 ? changes[changes.length - 1] ?? null : null;
  }
}

export const orderHistoryService = new OrderHistoryService();
