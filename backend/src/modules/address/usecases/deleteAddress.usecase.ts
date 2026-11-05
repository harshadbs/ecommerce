import { addressPersistence } from '../persistence/index.js';
import { NotFoundError } from '../../../utils/errors.js';

export class DeleteAddressUseCase {
  async execute(addressId: string, userId: string): Promise<void> {
    const address = await addressPersistence.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('errors.address_not_found');
    }

    await addressPersistence.delete(addressId);

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const addresses = await addressPersistence.findByUser(userId);
      if (addresses.length > 0) {
        await addressPersistence.setDefault(addresses[0].id, userId);
      }
    }
  }
}

export const deleteAddressUseCase = new DeleteAddressUseCase();
