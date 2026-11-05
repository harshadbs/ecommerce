import { Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendMessage } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import type { CreateAddressInput, UpdateAddressInput } from './address.validator.js';
import { getAddressesUseCase } from './usecases/getAddresses.usecase.js';
import { getAddressByIdUseCase } from './usecases/getAddressById.usecase.js';
import { createAddressUseCase } from './usecases/createAddress.usecase.js';
import { updateAddressUseCase } from './usecases/updateAddress.usecase.js';
import { deleteAddressUseCase } from './usecases/deleteAddress.usecase.js';
import { setDefaultAddressUseCase } from './usecases/setDefaultAddress.usecase.js';

export class AddressController {
  async getAddresses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      const addresses = await getAddressesUseCase.execute(req.user.userId);
      sendSuccess(res, { addresses });
    } catch (error) {
      next(error);
    }
  }

  async getAddress(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      const address = await getAddressByIdUseCase.execute(req.params.id, req.user.userId);
      sendSuccess(res, { address });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(
    req: AuthenticatedRequest & { body: CreateAddressInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      const address = await createAddressUseCase.execute(req.user.userId, req.body);
      sendCreated(res, { address });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(
    req: AuthenticatedRequest & { params: { id: string }; body: UpdateAddressInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      const address = await updateAddressUseCase.execute(req.params.id, req.user.userId, req.body);
      sendSuccess(res, { address });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      await deleteAddressUseCase.execute(req.params.id, req.user.userId);
      sendMessage(res, 'messages.address_deleted');
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not authenticated');
      const address = await setDefaultAddressUseCase.execute(req.params.id, req.user.userId);
      sendSuccess(res, { address });
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
