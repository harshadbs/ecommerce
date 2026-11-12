'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Package, Search, Filter, Upload, X, Star } from 'lucide-react';
import api, { assetUrl } from '@/lib/api';
import { compressImage, ACCEPTED_IMAGE_TYPES, MAX_SOURCE_IMAGE_BYTES } from '@/lib/image';
import { Modal, Badge, ConfirmDialog } from '@/components/ui';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  price: string;
  mrp: string;
  sku: string | null;
  stock: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isFeatured: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
  variants: { id: string; sku: string; name: string; price: string; stock: number }[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Validation
const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  shortDesc: z.string().max(300).optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be positive'),
  mrp: z.coerce.number().positive('MRP must be positive'),
  sku: z.string().max(50).optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0).default(0),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

const MAX_PRODUCT_IMAGES = 8;

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  INACTIVE: 'default',
  OUT_OF_STOCK: 'danger',
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  // Ordered image list for the form; the first one is the cover. Entries are stored
  // /api/media paths (existing) or data URLs (new uploads, saved by the API).
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products (admin endpoint shows all statuses)
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, searchQuery, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data;
    },
  });

  const products: Product[] = productsData?.data || [];
  const pagination = productsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  // Fetch categories for filter/form
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const res = await api.get('/categories?active=all');
      return res.data.data.categories as Category[];
    },
  });

  const categories = categoriesData || [];

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const originalImages = editingProduct?.images.map((img) => img.url) ?? [];
      const imagesChanged = images.join('\n') !== originalImages.join('\n');
      const payload = {
        ...formData,
        shortDesc: formData.shortDesc || undefined,
        sku: formData.sku || undefined,
        // Full ordered list; the API stores new uploads and removes dropped images
        images: imagesChanged ? images.map((url) => ({ url })) : undefined,
      };
      if (editingProduct) {
        return api.patch(`/products/${editingProduct.id}`, payload);
      }
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteTarget(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file
    if (!files.length) return;

    setImageError(null);
    const room = MAX_PRODUCT_IMAGES - images.length;
    if (files.length > room) {
      setImageError(`A product can have at most ${MAX_PRODUCT_IMAGES} images`);
    }

    setIsProcessingImages(true);
    const added: string[] = [];
    for (const file of files.slice(0, Math.max(0, room))) {
      if (!ACCEPTED_IMAGE_TYPES.split(',').includes(file.type)) {
        setImageError(`${file.name}: use a JPG, PNG or WEBP image`);
        continue;
      }
      if (file.size > MAX_SOURCE_IMAGE_BYTES) {
        setImageError(`${file.name}: image must be less than 10MB`);
        continue;
      }
      try {
        added.push(await compressImage(file));
      } catch {
        setImageError(`${file.name}: could not read this image`);
      }
    }
    setImages((prev) => [...prev, ...added].slice(0, MAX_PRODUCT_IMAGES));
    setIsProcessingImages(false);
  };

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setImages([]);
    setImageError(null);
    reset({
      categoryId: '',
      name: '',
      description: '',
      shortDesc: '',
      price: 0,
      mrp: 0,
      sku: '',
      stock: 0,
      status: 'DRAFT',
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setImages(product.images.map((img) => img.url)); // API returns the cover first
    setImageError(null);
    reset({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      shortDesc: product.shortDesc || '',
      price: parseFloat(product.price),
      mrp: parseFloat(product.mrp),
      sku: product.sku || '',
      stock: product.stock,
      status: product.status,
      isFeatured: product.isFeatured,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImages([]);
    setImageError(null);
    reset();
  };

  const onSubmit = (data: ProductFormData) => {
    saveMutation.mutate(data);
  };

  const formatPrice = (price: string | number) => {
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="input pl-9"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input w-auto"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Package className="h-12 w-12 mb-3 text-gray-300" />
            <p>No products found</p>
            <button onClick={openCreate} className="mt-2 text-primary-600 text-sm hover:underline">
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={assetUrl(product.images[0].url)}
                            alt={product.images[0].alt || product.name}
                            className="h-10 w-10 rounded-md object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.mrp !== product.price && (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(product.mrp)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 10 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[product.status] || 'default'}>
                        {product.status}
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="info">Featured</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Name *</label>
              <input {...register('name')} className="input mt-1" placeholder="Product name" />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Category *</label>
              <select {...register('categoryId')} className="input mt-1">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-600 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="label">SKU</label>
              <input {...register('sku')} className="input mt-1" placeholder="e.g. PROD-001" />
            </div>

            <div>
              <label className="label">Price (₹) *</label>
              <input {...register('price')} type="number" step="0.01" className="input mt-1" placeholder="999" />
              {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="label">MRP (₹) *</label>
              <input {...register('mrp')} type="number" step="0.01" className="input mt-1" placeholder="1299" />
              {errors.mrp && <p className="text-red-600 text-xs mt-1">{errors.mrp.message}</p>}
            </div>

            <div>
              <label className="label">Stock</label>
              <input {...register('stock')} type="number" className="input mt-1" min={0} />
            </div>

            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input mt-1">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Short Description</label>
              <input {...register('shortDesc')} className="input mt-1" placeholder="Brief description" />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description *</label>
              <textarea
                {...register('description')}
                className="input mt-1 h-24 resize-none"
                placeholder="Detailed product description (min 10 chars)"
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="label">Images</label>
              <div className="mt-1 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((src, index) => (
                  <div key={`${index}-${src.slice(-24)}`} className="relative aspect-square">
                    <img
                      src={assetUrl(src)}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover border border-gray-200"
                    />
                    {index === 0 ? (
                      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        className="absolute bottom-1 left-1 h-6 w-6 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow hover:bg-white"
                        title="Make cover image"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageAt(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_PRODUCT_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImages}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">{isProcessingImages ? 'Processing…' : 'Add'}</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                onChange={handleImagesSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Up to {MAX_PRODUCT_IMAGES} images, PNG, JPG or WEBP up to 10MB each (resized automatically). The first image is the cover.
              </p>
              {imageError && <p className="text-red-600 text-xs mt-1">{imageError}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register('isFeatured')}
                type="checkbox"
                id="isFeatured"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isFeatured" className="text-sm cursor-pointer">Mark as Featured</label>
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
            <button type="submit" className="btn-primary btn-md" disabled={saveMutation.isPending || isProcessingImages}>
              {saveMutation.isPending ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all images and variants.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
