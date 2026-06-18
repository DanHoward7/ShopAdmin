import { Request, Response } from 'express';
import { storeRegistrationService } from '../services/storeRegistrationService';
import { 
  StoreRegistrationSchema,
  StoreRegistrationUpdateSchema,
  RegistrationQuerySchema
} from '../types/store.types';

/**
 * Submit a new store registration
 */
export const submitRegistration = async (req: Request, res: Response) => {
  try {
    const validationResult = StoreRegistrationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration data',
        errors: validationResult.error.errors,
      });
    }

    const registration = await storeRegistrationService.submitRegistration(validationResult.data);

    return res.status(201).json({
      success: true,
      data: registration,
      message: 'Registration submitted successfully. You will be notified once reviewed.',
    });
  } catch (error) {
    console.error('Error submitting registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit registration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all registrations (admin only)
 */
export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const queryResult = RegistrationQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.errors,
      });
    }

    const result = await storeRegistrationService.getRegistrations(queryResult.data);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error getting registrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get registrations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get registration by ID
 */
export const getRegistrationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration ID is required' 
      });
    }

    const registration = await storeRegistrationService.getRegistrationById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: `Registration with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('Error getting registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get registration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update registration status (approve/reject) - Admin only
 */
export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
    }

    const validationResult = StoreRegistrationUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: validationResult.error.errors,
      });
    }

    // In a real app, get this from authenticated user
    const reviewedBy = 'admin'; // TODO: Get from auth context

    const updatedRegistration = await storeRegistrationService.updateRegistrationStatus(
      id, 
      validationResult.data, 
      reviewedBy
    );

    return res.status(200).json({
      success: true,
      data: updatedRegistration,
      message: `Registration ${validationResult.data.status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update registration status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Cancel registration
 */
export const cancelRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
    }

    const cancelledRegistration = await storeRegistrationService.cancelRegistration(id);

    return res.status(200).json({
      success: true,
      data: cancelledRegistration,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get registration statistics (admin only)
 */
export const getRegistrationStats = async (req: Request, res: Response) => {
  try {
    const stats = await storeRegistrationService.getRegistrationStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting registration stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get registration statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
