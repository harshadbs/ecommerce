'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import api from '@/lib/api';
import { Modal, Badge, ConfirmDialog } from '@/components/ui';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderValue: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20),
  description: z.string().max(200).optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive('Must be positive'),
  minOrderValue: z.coerce.number().min(0).optional().or(z.literal(0)),
  maxDiscount: z.coerce.number().min(0).optional().or(z.literal(0)),
  usageLimit: z.coerce.number().int().min(0).optional().or(z.literal(0)),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  startsAt: z.string().min(1, 'Start date required'),
  expiresAt: z.string().min(1, 'Expiry date required'),
  isActive: z.boolean().default(true),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', page],
    queryFn: async () => {
      const res = await api.get(`/coupons?page=${page}&limit=10`);
      return res.data;
    },
  });

  const coupons: Coupon[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const saveMutation = useMutation({
    mutationFn: async (formData: CouponFormData) => {
      const payload = {
        ...formData,
        description: formData.description || undefined,
        minOrderValue: formData.minOrderValue || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        usageLimit: formData.usageLimit || undefined,
        startsAt: new Date(formData.startsAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
      };
      if (editingCoupon) return api.patch(`/coupons/${editingCoupon.id}`, payload);
      return api.post('/coupons', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setDeleteTarget(null);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  });

  const openCreate = () => {
    setEditingCoupon(null);
    reset({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 0, maxDiscount: 0, usageLimit: 0, perUserLimit: 1, startsAt: '', expiresAt: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderValue: Number(coupon.minOrderValue) || 0,
      maxDiscount: Number(coupon.maxDiscount) || 0,
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit,
      startsAt: coupon.startsAt.slice(0, 16),
      expiresAt: coupon.expiresAt.slice(0, 16),
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingCoupon(null); reset(); };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-600 mt-1">Manage discount coupons</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-md"><Plus className="h-4 w-4 mr-2" />Add Coupon</button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Ticket className="h-12 w-12 mb-3 text-gray-300" /><p>No coupons yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Period</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{coupon.code}</span>
                      {coupon.description && <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.maxDiscount && coupon.discountType === 'PERCENTAGE' && <span className="text-xs text-gray-500 block">Max ₹{coupon.maxDiscount}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatDate(coupon.startsAt)} — {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      {!coupon.isActive ? <Badge variant="default">Inactive</Badge> :
                        isExpired(coupon.expiresAt) ? <Badge variant="danger">Expired</Badge> :
                        <Badge variant="success">Active</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(coupon)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline btn-sm">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="btn-outline btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Code *</label>
              <input {...register('code')} className="input mt-1 uppercase" placeholder="SAVE20" />
              {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Discount Type *</label>
              <select {...register('discountType')} className="input mt-1">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Discount Value *</label>
              <input {...register('discountValue')} type="number" step="0.01" className="input mt-1" />
              {errors.discountValue && <p className="text-red-600 text-xs mt-1">{errors.discountValue.message}</p>}
            </div>
            <div>
              <label className="label">Max Discount (₹)</label>
              <input {...register('maxDiscount')} type="number" className="input mt-1" placeholder="0 = no limit" />
            </div>
            <div>
              <label className="label">Min Order Value (₹)</label>
              <input {...register('minOrderValue')} type="number" className="input mt-1" placeholder="0 = no minimum" />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input {...register('usageLimit')} type="number" className="input mt-1" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="label">Per User Limit</label>
              <input {...register('perUserLimit')} type="number" className="input mt-1" min={1} />
            </div>
            <div>
              <label className="label">Description</label>
              <input {...register('description')} className="input mt-1" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Starts At *</label>
              <input {...register('startsAt')} type="datetime-local" className="input mt-1" />
              {errors.startsAt && <p className="text-red-600 text-xs mt-1">{errors.startsAt.message}</p>}
            </div>
            <div>
              <label className="label">Expires At *</label>
              <input {...register('expiresAt')} type="datetime-local" className="input mt-1" />
              {errors.expiresAt && <p className="text-red-600 text-xs mt-1">{errors.expiresAt.message}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="rounded border-gray-300 text-primary-600" />
            <span className="text-sm">Active</span>
          </label>

          {saveMutation.isError && <p className="text-red-600 text-sm">{(saveMutation.error as any)?.response?.data?.error || 'Something went wrong'}</p>}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn-outline btn-md">Cancel</button>
            <button type="submit" className="btn-primary btn-md" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="Delete Coupon" message={`Delete coupon "${deleteTarget?.code}"?`} isLoading={deleteMutation.isPending} />
    </div>
  );
}
