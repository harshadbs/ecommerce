import { Address } from '@prisma/client';
import { addressPersistence } from '../persistence/index.js';
import { BadRequestError } from '../../../utils/errors.js';
import type { CreateAddressInput } from '../address.validator.js';

const MAX_ADDRESSES_PER_USER = 10;

export class CreateAddressUseCase {
  async execute(userId: string, data: CreateAddressInput): Promise<Address> {
    // Check address limit
    const addressCount = await addressPersistence.countByUser(userId);
    if (addressCount >= MAX_ADDRESSES_PER_USER) {
      throw new BadRequestError('errors.max_addresses_reached');
    }

    // If this is the first address, make it default
    const isFirstAddress = addressCount === 0;
    const isDefault = data.isDefault || isFirstAddress;

    // If setting as default, clear existing default
    if (isDefault && addressCount > 0) {
      await addressPersistence.clearDefaultForUser(userId);
    }

    return addressPersistence.create({
      user: { connect: { id: userId } },
      name: data.name,
      phone: data.phone,
      address: data.address,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      type: data.type,
      isDefault,
    });
  }
}

export const createAddressUseCase = new CreateAddressUseCase();
