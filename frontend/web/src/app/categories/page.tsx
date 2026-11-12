'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderTree, ArrowRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories/tree');
        setCategories(res.data.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ShopLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl">Shop by Category</h1>
          <p className="text-secondary-600 mt-2">Browse our wide range of product categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500 text-lg">No categories available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="card card-hover group block overflow-hidden rounded-2xl"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-secondary-100 relative overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderTree className="h-16 w-16 text-secondary-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-xl text-ink">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-secondary-500 mt-1 line-clamp-2">{category.description}</p>
        )}

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className="inline-block bg-secondary-100 text-secondary-600 text-xs px-2 py-0.5 rounded-full"
              >
                {child.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="inline-block text-secondary-400 text-xs px-2 py-0.5">
                +{category.children.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center text-sm text-primary-600 font-medium">
          Browse Products
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
