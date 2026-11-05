'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, FolderTree, Upload, X, ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { Modal, Badge, ConfirmDialog } from '@/components/ui';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: { products: number };
}

// Validation schema
const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories?active=all');
      return res.data.data.categories as Category[];
    },
  });

  const categories = data || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const payload: any = {
        ...formData,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
      };

      // Include image (base64 or null to remove)
      if (imageBase64) {
        payload.image = imageBase64;
      } else if (imagePreview === null && editingCategory?.image) {
        // Image was removed
        payload.image = null;
      }

      if (editingCategory) {
        return api.patch(`/categories/${editingCategory.id}`, payload);
      }
      return api.post('/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // Handle file selection and convert to base64
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setImagePreview(null);
    setImageBase64(null);
    reset({ name: '', slug: '', description: '', parentId: '', isActive: true, sortOrder: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setImagePreview(category.image || null);
    setImageBase64(null); // Only set if user picks new image
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImagePreview(null);
    setImageBase64(null);
    reset();
  };

  const onSubmit = (data: CategoryFormData) => {
    saveMutation.mutate(data);
  };

  // Get root categories for parent select
  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <FolderTree className="h-12 w-12 mb-3 text-gray-300" />
            <p>No categories yet</p>
            <button onClick={openCreate} className="mt-2 text-primary-600 text-sm hover:underline">
              Create your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Image</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Products</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                    <td className="px-4 py-3 text-gray-600">{category.slug}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {category.parent?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {category._count?.products ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={category.isActive ? 'success' : 'danger'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(category)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input {...register('name')} className="input mt-1" placeholder="e.g. Electronics" />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Slug</label>
            <input {...register('slug')} className="input mt-1" placeholder="auto-generated if empty" />
            {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input mt-1 h-20 resize-none" placeholder="Optional description" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="label">Category Image</label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP up to 2MB</p>
            </div>
          </div>

          <div>
            <label className="label">Parent Category</label>
            <select {...register('parentId')} className="input mt-1">
              <option value="">None (Root category)</option>
              {rootCategories
                .filter((c) => c.id !== editingCategory?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sort Order</label>
              <input {...register('sortOrder')} type="number" className="input mt-1" min={0} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('isActive')} type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>

          {saveMutation.isError && (
            <p className="text-red-600 text-sm">
              {(saveMutation.error as any)?.response?.data?.error || 'Something went wrong'}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn-outline btn-md">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-md" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
