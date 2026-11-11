import { Address } from '@prisma/client';
import { addressRepository } from '../repositories/address.repository.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import type { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator.js';

const MAX_ADDRESSES_PER_USER = 10;

export class AddressService {
  async getAddresses(userId: string): Promise<Address[]> {
    return addressRepository.findByUser(userId);
  }

  async getAddressById(addressId: string, userId: string): Promise<Address> {
    const address = await addressRepository.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    return address;
  }

  async createAddress(userId: string, data: CreateAddressInput): Promise<Address> {
    // Check address limit
    const addressCount = await addressRepository.countByUser(userId);
    if (addressCount >= MAX_ADDRESSES_PER_USER) {
      throw new BadRequestError(`Maximum ${MAX_ADDRESSES_PER_USER} addresses allowed`);
    }

    // If this is the first address, make it default
    const isFirstAddress = addressCount === 0;
    const isDefault = data.isDefault || isFirstAddress;

    // If setting as default, clear existing default
    if (isDefault && addressCount > 0) {
      await addressRepository.clearDefaultForUser(userId);
    }

    return addressRepository.create({
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

  async updateAddress(
    addressId: string,
    userId: string,
    data: UpdateAddressInput
  ): Promise<Address> {
    // Check if address exists and belongs to user
    const address = await addressRepository.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // If setting as default, clear existing default
    if (data.isDefault && !address.isDefault) {
      await addressRepository.clearDefaultForUser(userId);
    }

    return addressRepository.update(addressId, {
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

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const address = await addressRepository.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    await addressRepository.delete(addressId);

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const addresses = await addressRepository.findByUser(userId);
      if (addresses.length > 0) {
        await addressRepository.setDefault(addresses[0].id, userId);
      }
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<Address> {
    const address = await addressRepository.findByIdAndUser(addressId, userId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return addressRepository.setDefault(addressId, userId);
  }
}

export const addressService = new AddressService();
