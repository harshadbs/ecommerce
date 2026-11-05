'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderTree, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              E-Store
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/categories" className="text-primary-600 font-medium">
                Categories
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-primary-600">
                Products
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-primary-600">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop by Category</h1>
          <p className="text-gray-600 mt-2">Browse our wide range of product categories</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderTree className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
        )}

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
              >
                {child.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="inline-block text-gray-400 text-xs px-2 py-0.5">
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
