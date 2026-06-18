import { PrismaClient, StoreStatus } from '@prisma/client';
import { 
  StoreCreateInput,
  StoreUpdateInput,
  StoreResponse,
  StoreListResponse,
  StoreQuery,
  StoreConfigInput,
  StoreConfigResponse
} from '../types/store.types';

const prisma = new PrismaClient();

export class StoreService {
  /**
   * Create a new store
   */
  async createStore(data: StoreCreateInput): Promise<StoreResponse> {
    try {
      // Check if store URL already exists
      const existingStore = await prisma.store.findFirst({
        where: { url: data.url },
      });

      if (existingStore) {
        throw new Error('A store with this URL already exists');
      }

      const store = await prisma.store.create({
        data: {
          name: data.name,
          url: data.url,
          description: data.description ?? null,
          contactEmail: data.contactEmail ?? null,
          contactPhone: data.contactPhone ?? null,
          timezone: data.timezone,
          currency: data.currency,
          status: data.status,
        },
        include: {
          _count: {
            select: {
              orders: true,
              products: true,
              customers: true,
              apiKeys: true,
            },
          },
        },
      });

      // Create default store configuration
      await prisma.storeConfig.create({
        data: {
          storeId: store.id,
          orderSyncEnabled: true,
          productSyncEnabled: false,
          customerSyncEnabled: false,
          syncFrequency: 300,
          maxOrdersPerSync: 100,
          retryAttempts: 3,
        },
      });

      return this.formatStoreResponse(store);
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Get all stores with filtering and pagination
   */
  async getStores(query: StoreQuery): Promise<StoreListResponse> {
    try {
      const {
        page,
        limit,
        status,
        search,
        sortBy,
        sortOrder,
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [stores, total] = await Promise.all([
        prisma.store.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: {
                orders: true,
                products: true,
                customers: true,
                apiKeys: true,
              },
            },
          },
        }),
        prisma.store.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        stores: stores.map(store => this.formatStoreResponse(store)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          ...(status && { status }),
          ...(search && { search }),
        },
      };
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }

  /**
   * Get store by ID
   */
  async getStoreById(id: string): Promise<StoreResponse | null> {
    try {
      const store = await prisma.store.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              orders: true,
              products: true,
              customers: true,
              apiKeys: true,
            },
          },
        },
      });

      return store ? this.formatStoreResponse(store) : null;
    } catch (error) {
      console.error('Error fetching store:', error);
      throw error;
    }
  }

  /**
   * Update store
   */
  async updateStore(id: string, data: StoreUpdateInput): Promise<StoreResponse> {
    try {
      const existingStore = await prisma.store.findUnique({
        where: { id },
      });

      if (!existingStore) {
        throw new Error(`Store with ID ${id} not found`);
      }

      // Check URL uniqueness if URL is being updated
      if (data.url && data.url !== existingStore.url) {
        const urlExists = await prisma.store.findFirst({
          where: { 
            url: data.url,
            id: { not: id },
          },
        });

        if (urlExists) {
          throw new Error('A store with this URL already exists');
        }
      }

      // Filter out undefined values
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
      if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const updatedStore = await prisma.store.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              orders: true,
              products: true,
              customers: true,
              apiKeys: true,
            },
          },
        },
      });

      return this.formatStoreResponse(updatedStore);
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  /**
   * Delete store
   */
  async deleteStore(id: string): Promise<void> {
    try {
      const existingStore = await prisma.store.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              orders: true,
              products: true,
              customers: true,
            },
          },
        },
      });

      if (!existingStore) {
        throw new Error(`Store with ID ${id} not found`);
      }

      // Check if store has associated data
      const hasData = existingStore._count.orders > 0 || 
                     existingStore._count.products > 0 || 
                     existingStore._count.customers > 0;

      if (hasData) {
        throw new Error('Cannot delete store with existing orders, products, or customers. Consider deactivating instead.');
      }

      await prisma.store.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  }

  /**
   * Get store configuration
   */
  async getStoreConfig(storeId: string): Promise<StoreConfigResponse | null> {
    try {
      const config = await prisma.storeConfig.findUnique({
        where: { storeId },
      });

      return config ? this.formatStoreConfigResponse(config) : null;
    } catch (error) {
      console.error('Error fetching store config:', error);
      throw error;
    }
  }

  /**
   * Update store configuration
   */
  async updateStoreConfig(storeId: string, data: StoreConfigInput): Promise<StoreConfigResponse> {
    try {
      // Verify store exists
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        throw new Error(`Store with ID ${storeId} not found`);
      }

      // Filter out undefined values
      const updateData: any = {};
      if (data.webhookUrl !== undefined) updateData.webhookUrl = data.webhookUrl;
      if (data.webhookSecret !== undefined) updateData.webhookSecret = data.webhookSecret;
      if (data.orderSyncEnabled !== undefined) updateData.orderSyncEnabled = data.orderSyncEnabled;
      if (data.productSyncEnabled !== undefined) updateData.productSyncEnabled = data.productSyncEnabled;
      if (data.customerSyncEnabled !== undefined) updateData.customerSyncEnabled = data.customerSyncEnabled;
      if (data.syncFrequency !== undefined) updateData.syncFrequency = data.syncFrequency;
      if (data.maxOrdersPerSync !== undefined) updateData.maxOrdersPerSync = data.maxOrdersPerSync;
      if (data.retryAttempts !== undefined) updateData.retryAttempts = data.retryAttempts;
      if (data.notificationSettings !== undefined) updateData.notificationSettings = data.notificationSettings;
      if (data.customFields !== undefined) updateData.customFields = data.customFields;

      const config = await prisma.storeConfig.upsert({
        where: { storeId },
        update: updateData,
        create: {
          storeId,
          webhookUrl: data.webhookUrl ?? null,
          webhookSecret: data.webhookSecret ?? null,
          orderSyncEnabled: data.orderSyncEnabled ?? true,
          productSyncEnabled: data.productSyncEnabled ?? false,
          customerSyncEnabled: data.customerSyncEnabled ?? false,
          syncFrequency: data.syncFrequency ?? 300,
          maxOrdersPerSync: data.maxOrdersPerSync ?? 100,
          retryAttempts: data.retryAttempts ?? 3,
          ...(data.notificationSettings && { notificationSettings: data.notificationSettings }),
          ...(data.customFields && { customFields: data.customFields }),
        },
      });

      return this.formatStoreConfigResponse(config);
    } catch (error) {
      console.error('Error updating store config:', error);
      throw error;
    }
  }

  /**
   * Get store statistics
   */
  async getStoreStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
    recentlyCreated: number;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [total, active, pending, suspended, inactive, recentlyCreated] = await Promise.all([
        prisma.store.count(),
        prisma.store.count({ where: { status: StoreStatus.ACTIVE } }),
        prisma.store.count({ where: { status: StoreStatus.PENDING } }),
        prisma.store.count({ where: { status: StoreStatus.SUSPENDED } }),
        prisma.store.count({ where: { status: StoreStatus.INACTIVE } }),
        prisma.store.count({ 
          where: { 
            createdAt: { gte: oneDayAgo },
          } 
        }),
      ]);

      return {
        total,
        active,
        pending,
        suspended,
        inactive,
        recentlyCreated,
      };
    } catch (error) {
      console.error('Error fetching store stats:', error);
      throw error;
    }
  }

  /**
   * Format store response
   */
  private formatStoreResponse(store: any): StoreResponse {
    return {
      id: store.id,
      name: store.name,
      url: store.url,
      description: store.description,
      contactEmail: store.contactEmail,
      contactPhone: store.contactPhone,
      timezone: store.timezone,
      currency: store.currency,
      status: store.status,
      isActive: store.isActive,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      _count: store._count,
    };
  }

  /**
   * Format store config response
   */
  private formatStoreConfigResponse(config: any): StoreConfigResponse {
    return {
      id: config.id,
      storeId: config.storeId,
      webhookUrl: config.webhookUrl,
      orderSyncEnabled: config.orderSyncEnabled,
      productSyncEnabled: config.productSyncEnabled,
      customerSyncEnabled: config.customerSyncEnabled,
      syncFrequency: config.syncFrequency,
      maxOrdersPerSync: config.maxOrdersPerSync,
      retryAttempts: config.retryAttempts,
      notificationSettings: config.notificationSettings,
      customFields: config.customFields,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

export const storeService = new StoreService();
