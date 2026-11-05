'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Badge, ConfirmDialog } from '@/components/ui';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string };
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (filter) params.set('approved', filter);
      const res = await api.get(`/reviews?${params.toString()}`);
      return res.data;
    },
  });

  const reviews: Review[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setRejectTarget(null);
    },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-600 mt-1">Moderate product reviews</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'false' },
          { label: 'Approved', value: 'true' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.value ? 'bg-primary-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="card flex flex-col items-center justify-center h-48 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
            <p>No reviews found</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <Badge variant={review.isApproved ? 'success' : 'warning'}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    {review.isVerified && <Badge variant="info">Verified Purchase</Badge>}
                  </div>
                  {review.title && <p className="font-medium text-gray-900">{review.title}</p>}
                  {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>By: <strong>{review.user.name}</strong> ({review.user.email})</span>
                    <span>Product: <strong>{review.product.name}</strong></span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!review.isApproved && (
                    <button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={approveMutation.isPending}
                      className="p-2 rounded-md hover:bg-green-50 text-green-600"
                      title="Approve"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setRejectTarget(review)}
                    className="p-2 rounded-md hover:bg-red-50 text-red-600"
                    title="Reject & Delete"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline btn-sm">Previous</button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="btn-outline btn-sm">Next</button>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={() => rejectTarget && rejectMutation.mutate(rejectTarget.id)} title="Reject Review" message="This will permanently delete the review. Continue?" isLoading={rejectMutation.isPending} />
    </div>
  );
}
