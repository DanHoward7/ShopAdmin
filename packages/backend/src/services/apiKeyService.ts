import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { 
  ApiKeyCreateInput, 
  ApiKeyUpdateInput, 
  ApiKeyResponse, 
  ApiKeyCreateResponse 
} from '../types/store.types';

const prisma = new PrismaClient();

export class ApiKeyService {
  private readonly SALT_ROUNDS = 12;
  private readonly KEY_LENGTH = 32;
  private readonly PREFIX_LENGTH = 8;

  /**
   * Generate a secure API key
   */
  private generateApiKey(): { apiKey: string; keyPrefix: string } {
    const randomBytes = crypto.randomBytes(this.KEY_LENGTH);
    const apiKey = `sk_${randomBytes.toString('hex')}`;
    const keyPrefix = apiKey.substring(0, this.PREFIX_LENGTH + 3); // Include 'sk_' prefix
    
    return { apiKey, keyPrefix };
  }

  /**
   * Hash an API key for secure storage
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    return bcrypt.hash(apiKey, this.SALT_ROUNDS);
  }

  /**
   * Verify an API key against its hash
   */
  async verifyApiKey(apiKey: string, keyHash: string): Promise<boolean> {
    return bcrypt.compare(apiKey, keyHash);
  }

  /**
   * Create a new API key for a store
   */
  async createApiKey(storeId: string, data: ApiKeyCreateInput, createdBy?: string): Promise<ApiKeyCreateResponse> {
    try {
      // Verify store exists
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        throw new Error(`Store with ID ${storeId} not found`);
      }

      // Generate API key
      const { apiKey, keyPrefix } = this.generateApiKey();
      const keyHash = await this.hashApiKey(apiKey);

      // Parse expiration date if provided
      const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

      // Create API key record
      const apiKeyRecord = await prisma.apiKey.create({
        data: {
          name: data.name,
          keyHash,
          keyPrefix,
          storeId,
          permissions: data.permissions,
          expiresAt,
          createdBy: createdBy ?? null,
        },
      });

      return {
        ...this.formatApiKeyResponse(apiKeyRecord),
        apiKey, // Only returned on creation
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  /**
   * Get all API keys for a store
   */
  async getStoreApiKeys(storeId: string): Promise<ApiKeyResponse[]> {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      return apiKeys.map(key => this.formatApiKeyResponse(key));
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(id: string, storeId: string): Promise<ApiKeyResponse | null> {
    try {
      const apiKey = await prisma.apiKey.findFirst({
        where: { 
          id,
          storeId, // Ensure key belongs to the store
        },
      });

      return apiKey ? this.formatApiKeyResponse(apiKey) : null;
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }

  /**
   * Update API key
   */
  async updateApiKey(id: string, storeId: string, data: ApiKeyUpdateInput): Promise<ApiKeyResponse> {
    try {
      // Check if API key exists and belongs to the store
      const existingKey = await prisma.apiKey.findFirst({
        where: { 
          id,
          storeId,
        },
      });

      if (!existingKey) {
        throw new Error(`API key with ID ${id} not found for this store`);
      }

      // Parse expiration date if provided
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.permissions !== undefined) updateData.permissions = data.permissions;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.expiresAt !== undefined) {
        updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
      }

      const updatedKey = await prisma.apiKey.update({
        where: { id },
        data: updateData,
      });

      return this.formatApiKeyResponse(updatedKey);
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id: string, storeId: string): Promise<void> {
    try {
      // Check if API key exists and belongs to the store
      const existingKey = await prisma.apiKey.findFirst({
        where: { 
          id,
          storeId,
        },
      });

      if (!existingKey) {
        throw new Error(`API key with ID ${id} not found for this store`);
      }

      await prisma.apiKey.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Authenticate API key and return store info
   */
  async authenticateApiKey(apiKey: string): Promise<{ storeId: string; permissions: string[] } | null> {
    try {
      // Extract prefix from the provided key
      const keyPrefix = apiKey.substring(0, this.PREFIX_LENGTH + 3);

      // Find API key by prefix (for performance)
      const apiKeyRecords = await prisma.apiKey.findMany({
        where: {
          keyPrefix,
          isActive: true,
        },
        include: {
          store: {
            select: {
              id: true,
              isActive: true,
              status: true,
            },
          },
        },
      });

      // Verify the full key against each potential match
      for (const record of apiKeyRecords) {
        const isValid = await this.verifyApiKey(apiKey, record.keyHash);
        
        if (isValid) {
          // Check if key is expired
          if (record.expiresAt && record.expiresAt < new Date()) {
            continue; // Skip expired keys
          }

          // Check if store is active
          if (!record.store.isActive || record.store.status !== 'ACTIVE') {
            continue; // Skip inactive stores
          }

          // Update last used timestamp
          await prisma.apiKey.update({
            where: { id: record.id },
            data: { lastUsedAt: new Date() },
          });

          return {
            storeId: record.storeId,
            permissions: record.permissions,
          };
        }
      }

      return null; // No valid key found
    } catch (error) {
      console.error('Error authenticating API key:', error);
      return null;
    }
  }

  /**
   * Rotate API key (generate new key, keep same permissions)
   */
  async rotateApiKey(id: string, storeId: string): Promise<ApiKeyCreateResponse> {
    try {
      // Get existing key
      const existingKey = await prisma.apiKey.findFirst({
        where: { 
          id,
          storeId,
        },
      });

      if (!existingKey) {
        throw new Error(`API key with ID ${id} not found for this store`);
      }

      // Generate new API key
      const { apiKey, keyPrefix } = this.generateApiKey();
      const keyHash = await this.hashApiKey(apiKey);

      // Update the existing record with new key
      const updatedKey = await prisma.apiKey.update({
        where: { id },
        data: {
          keyHash,
          keyPrefix,
          lastUsedAt: null, // Reset usage tracking
        },
      });

      return {
        ...this.formatApiKeyResponse(updatedKey),
        apiKey, // Return the new key
      };
    } catch (error) {
      console.error('Error rotating API key:', error);
      throw error;
    }
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(storeId: string): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    recentlyUsed: number;
  }> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [totalKeys, activeKeys, expiredKeys, recentlyUsed] = await Promise.all([
        prisma.apiKey.count({ where: { storeId } }),
        prisma.apiKey.count({ 
          where: { 
            storeId, 
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          } 
        }),
        prisma.apiKey.count({ 
          where: { 
            storeId, 
            expiresAt: { lt: now },
          } 
        }),
        prisma.apiKey.count({ 
          where: { 
            storeId, 
            lastUsedAt: { gte: oneDayAgo },
          } 
        }),
      ]);

      return {
        totalKeys,
        activeKeys,
        expiredKeys,
        recentlyUsed,
      };
    } catch (error) {
      console.error('Error fetching API key stats:', error);
      throw error;
    }
  }

  /**
   * Format API key response (exclude sensitive data)
   */
  private formatApiKeyResponse(apiKey: any): ApiKeyResponse {
    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      permissions: apiKey.permissions,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
      createdBy: apiKey.createdBy,
    };
  }
}

export const apiKeyService = new ApiKeyService();
