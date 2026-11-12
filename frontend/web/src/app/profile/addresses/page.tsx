'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, MapPin, Trash2, Star } from 'lucide-react';
import api from '@/lib/api';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAddresses = () => {
    api.get('/addresses').then(res => setAddresses(res.data.data.addresses || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/addresses', { ...data, type: 'HOME', isDefault: addresses.length === 0 });
      fetchAddresses();
      setShowForm(false);
      reset();
    } catch {}
  };

  const deleteAddress = async (id: string) => {
    await api.delete(`/addresses/${id}`);
    fetchAddresses();
  };

  const setDefault = async (id: string) => {
    await api.patch(`/addresses/${id}/default`);
    fetchAddresses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">My Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm"><Plus className="h-4 w-4 mr-1" />Add Address</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name', { required: true, minLength: 2 })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} className="input mt-1" placeholder="9876543210" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea {...register('address', { required: true, minLength: 10 })} className="input mt-1 h-16 resize-none" />
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('city', { required: true })} className="input mt-1" />
            </div>
            <div>
              <label className="label">State</label>
              <input {...register('state', { required: true })} className="input mt-1" />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input {...register('pincode', { required: true, pattern: /^\d{6}$/ })} className="input mt-1" placeholder="560001" />
            </div>
            <div>
              <label className="label">Landmark (optional)</label>
              <input {...register('landmark')} className="input mt-1" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary btn-sm">Save Address</button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>
      ) : addresses.length === 0 ? (
        <div className="card text-center py-12">
          <MapPin className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No addresses saved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`card p-4 relative ${addr.isDefault ? 'border-primary-300' : ''}`}>
              {addr.isDefault && <span className="absolute top-2 right-2 bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">Default</span>}
              <p className="font-medium">{addr.name}</p>
              <p className="text-sm text-secondary-600 mt-1">{addr.address}</p>
              {addr.landmark && <p className="text-sm text-secondary-500">{addr.landmark}</p>}
              <p className="text-sm text-secondary-600">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-sm text-secondary-500 mt-1">📞 {addr.phone}</p>
              <div className="flex gap-2 mt-3">
                {!addr.isDefault && <button onClick={() => setDefault(addr.id)} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Star className="h-3 w-3" />Set Default</button>}
                <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-700 hover:underline flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
