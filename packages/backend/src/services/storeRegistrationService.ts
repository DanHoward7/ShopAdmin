import { PrismaClient, RegistrationStatus, StoreStatus } from '@prisma/client';
import { 
  StoreRegistrationInput,
  StoreRegistrationUpdateInput,
  StoreRegistrationResponse,
  StoreRegistrationListResponse,
  RegistrationQuery,
  StoreCreateInput
} from '../types/store.types';
import { apiKeyService } from './apiKeyService';
import { PERMISSION_GROUPS } from '../types/store.types';

const prisma = new PrismaClient();

export class StoreRegistrationService {
  /**
   * Submit a new store registration
   */
  async submitRegistration(data: StoreRegistrationInput): Promise<StoreRegistrationResponse> {
    try {
      // Check if email is already registered
      const existingRegistration = await prisma.storeRegistration.findFirst({
        where: {
          contactEmail: data.contactEmail,
          status: {
            in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED],
          },
        },
      });

      if (existingRegistration) {
        throw new Error('A registration with this email already exists');
      }

      // Check if store URL is already registered
      const existingStore = await prisma.store.findFirst({
        where: { url: data.storeUrl },
      });

      if (existingStore) {
        throw new Error('A store with this URL is already registered');
      }

      const registration = await prisma.storeRegistration.create({
        data: {
          storeName: data.storeName,
          storeUrl: data.storeUrl,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone ?? null,
          description: data.description ?? null,
          businessType: data.businessType ?? null,
          expectedVolume: data.expectedVolume ?? null,
        },
      });

      return this.formatRegistrationResponse(registration);
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw error;
    }
  }

  /**
   * Get all registrations with filtering and pagination
   */
  async getRegistrations(query: RegistrationQuery): Promise<StoreRegistrationListResponse> {
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
          { storeName: { contains: search, mode: 'insensitive' } },
          { storeUrl: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [registrations, total] = await Promise.all([
        prisma.storeRegistration.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.storeRegistration.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        registrations: registrations.map(reg => this.formatRegistrationResponse(reg)),
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
      console.error('Error fetching registrations:', error);
      throw error;
    }
  }

  /**
   * Get registration by ID
   */
  async getRegistrationById(id: string): Promise<StoreRegistrationResponse | null> {
    try {
      const registration = await prisma.storeRegistration.findUnique({
        where: { id },
      });

      return registration ? this.formatRegistrationResponse(registration) : null;
    } catch (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }
  }

  /**
   * Update registration status (approve/reject)
   */
  async updateRegistrationStatus(
    id: string, 
    data: StoreRegistrationUpdateInput, 
    reviewedBy: string
  ): Promise<StoreRegistrationResponse> {
    try {
      const existingRegistration = await prisma.storeRegistration.findUnique({
        where: { id },
      });

      if (!existingRegistration) {
        throw new Error(`Registration with ID ${id} not found`);
      }

      if (existingRegistration.status !== RegistrationStatus.PENDING) {
        throw new Error('Only pending registrations can be updated');
      }

      const updateData: any = {
        status: data.status,
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes: data.reviewNotes,
      };

      // Set approval/rejection timestamps
      if (data.status === RegistrationStatus.APPROVED) {
        updateData.approvedAt = new Date();
      } else if (data.status === RegistrationStatus.REJECTED) {
        updateData.rejectedAt = new Date();
      }

      const updatedRegistration = await prisma.storeRegistration.update({
        where: { id },
        data: updateData,
      });

      // If approved, create the store
      if (data.status === RegistrationStatus.APPROVED) {
        const store = await this.createStoreFromRegistration(updatedRegistration);
        
        // Update registration with store ID
        await prisma.storeRegistration.update({
          where: { id },
          data: { storeId: store.id },
        });

        updatedRegistration.storeId = store.id;
      }

      return this.formatRegistrationResponse(updatedRegistration);
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  }

  /**
   * Cancel registration (by applicant)
   */
  async cancelRegistration(id: string): Promise<StoreRegistrationResponse> {
    try {
      const existingRegistration = await prisma.storeRegistration.findUnique({
        where: { id },
      });

      if (!existingRegistration) {
        throw new Error(`Registration with ID ${id} not found`);
      }

      if (existingRegistration.status !== RegistrationStatus.PENDING) {
        throw new Error('Only pending registrations can be cancelled');
      }

      const updatedRegistration = await prisma.storeRegistration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CANCELLED,
          reviewedAt: new Date(),
        },
      });

      return this.formatRegistrationResponse(updatedRegistration);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  }

  /**
   * Get registration statistics
   */
  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    recentSubmissions: number;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [total, pending, approved, rejected, cancelled, recentSubmissions] = await Promise.all([
        prisma.storeRegistration.count(),
        prisma.storeRegistration.count({ where: { status: RegistrationStatus.PENDING } }),
        prisma.storeRegistration.count({ where: { status: RegistrationStatus.APPROVED } }),
        prisma.storeRegistration.count({ where: { status: RegistrationStatus.REJECTED } }),
        prisma.storeRegistration.count({ where: { status: RegistrationStatus.CANCELLED } }),
        prisma.storeRegistration.count({ 
          where: { 
            submittedAt: { gte: oneDayAgo },
          } 
        }),
      ]);

      return {
        total,
        pending,
        approved,
        rejected,
        cancelled,
        recentSubmissions,
      };
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      throw error;
    }
  }

  /**
   * Create store from approved registration
   */
  private async createStoreFromRegistration(registration: any): Promise<any> {
    try {
      // Create store
      const store = await prisma.store.create({
        data: {
          name: registration.storeName,
          url: registration.storeUrl,
          description: registration.description ?? null,
          contactEmail: registration.contactEmail ?? null,
          contactPhone: registration.contactPhone ?? null,
          timezone: 'UTC',
          currency: 'USD',
          status: StoreStatus.ACTIVE,
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

      // Create default API key with full access
      await apiKeyService.createApiKey(
        store.id,
        {
          name: 'Default API Key',
          permissions: [...PERMISSION_GROUPS.FULL_ACCESS],
        },
        'system'
      );

      return store;
    } catch (error) {
      console.error('Error creating store from registration:', error);
      throw error;
    }
  }

  /**
   * Format registration response
   */
  private formatRegistrationResponse(registration: any): StoreRegistrationResponse {
    return {
      id: registration.id,
      storeName: registration.storeName,
      storeUrl: registration.storeUrl,
      contactEmail: registration.contactEmail,
      contactPhone: registration.contactPhone,
      description: registration.description,
      businessType: registration.businessType,
      expectedVolume: registration.expectedVolume,
      status: registration.status,
      submittedAt: registration.submittedAt,
      reviewedAt: registration.reviewedAt,
      reviewedBy: registration.reviewedBy,
      reviewNotes: registration.reviewNotes,
      approvedAt: registration.approvedAt,
      rejectedAt: registration.rejectedAt,
      storeId: registration.storeId,
    };
  }
}

export const storeRegistrationService = new StoreRegistrationService();
