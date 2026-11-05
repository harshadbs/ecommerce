import { Address } from '@prisma/client';
import { addressPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { UpdateAddressInput } from '../address.validator.js';

export class UpdateAddressUseCase {
  async execute(addressId: string, userId: string, data: UpdateAddressInput): Promise<Address> {
    // Check if address exists and belongs to user
    const address = await addressPersistence.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('errors.address_not_found');
    }

    // If setting as default, clear existing default
    if (data.isDefault && !address.isDefault) {
      await addressPersistence.clearDefaultForUser(userId);
    }

    return addressPersistence.update(addressId, {
      name: data.name,
      phone: data.phone,
      address: data.address,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      type: data.type,
      isDefault: data.isDefault,
    });
  }
}

export const updateAddressUseCase = new UpdateAddressUseCase();
