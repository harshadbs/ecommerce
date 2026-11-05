import { Address } from '@prisma/client';
import { addressPersistence } from '../persistence/index.js';

export class GetAddressesUseCase {
  async execute(userId: string): Promise<Address[]> {
    return addressPersistence.findByUser(userId);
  }
}

export const getAddressesUseCase = new GetAddressesUseCase();
