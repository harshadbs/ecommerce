import { Address } from '@prisma/client';
import { addressPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class SetDefaultAddressUseCase {
  async execute(addressId: string, userId: string): Promise<Address> {
    const address = await addressPersistence.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('errors.address_not_found');
    }

    return addressPersistence.setDefault(addressId, userId);
  }
}

export const setDefaultAddressUseCase = new SetDefaultAddressUseCase();
