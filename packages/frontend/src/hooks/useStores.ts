import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  StoresAPI, 
  storeKeys, 
  type StoreQueryParams, 
  type CreateStoreData, 
  type UpdateStoreData 
} from '@/lib/stores-api';
import type { Store, PaginatedResponse, ApiResponse } from '@/types/api';

// Get paginated stores with filtering
export const useStores = (params: StoreQueryParams = {}) => {
  return useQuery({
    queryKey: storeKeys.list(params),
    queryFn: () => StoresAPI.getStores(params),
  });
};

// Get a single store by ID
export const useStore = (id: string) => {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => StoresAPI.getStoreById(id),
    enabled: !!id,
  });
};

// Get store statistics
export const useStoreStats = (id: string) => {
  return useQuery({
    queryKey: storeKeys.stats(id),
    queryFn: () => StoresAPI.getStoreStats(id),
    enabled: !!id,
  });
};

// Create a new store
export const useCreateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStoreData) => StoresAPI.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};

// Update a store
export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreData }) => 
      StoresAPI.updateStore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.id) });
    },
  });
};

// Delete a store
export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StoresAPI.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};

// Generate API key for store
export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StoresAPI.generateApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
    },
  });
};

// Rotate API key for store
export const useRotateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StoresAPI.rotateApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
    },
  });
};

// Test store connection
export const useTestConnection = () => {
  return useMutation({
    mutationFn: (id: string) => StoresAPI.testConnection(id),
  });
};
