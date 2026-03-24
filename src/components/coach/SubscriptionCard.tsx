'use client';

import { createCheckoutSession, createBillingPortalSession } from '@/lib/actions/subscription';
import { SubscriptionStatus } from '@/types/database.types';
import { useState } from 'react';

interface SubscriptionCardProps {
  status: SubscriptionStatus;
  endsAt?: string | null;
  customerId?: string | null;
}

export default function SubscriptionCard({
  status,
  endsAt,
  customerId,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const result = await createCheckoutSession();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert('Failed to start checkout');
    }
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    const result = await createBillingPortalSession();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert('Failed to open billing portal');
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {status === 'inactive' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">💳</div>
            <div>
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="text-gray-600">Subscribe to start receiving bookings</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Monthly price</span>
              <span className="text-2xl font-bold">€30</span>
            </div>
            <div className="text-sm text-gray-600">
              First month free with 30-day trial
            </div>
            <div className="text-sm text-gray-600">
              Cancel anytime, no long-term commitment
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>
      )}

      {status === 'trial' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-2xl font-bold">Free Trial Active</h3>
              <p className="text-gray-600">Enjoy your free month of coaching features</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Trial ends</span>
              <span className="font-semibold text-lg">{formatDate(endsAt)}</span>
            </div>
          </div>

          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Manage Subscription'}
          </button>
        </div>
      )}

      {status === 'active' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-2xl font-bold">Subscription Active</h3>
              <p className="text-gray-600">You're all set to receive bookings</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Next billing date</span>
              <span className="font-semibold text-lg">{formatDate(endsAt)}</span>
            </div>
          </div>

          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Manage Subscription'}
          </button>
        </div>
      )}

      {status === 'cancelled' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">⏸️</div>
            <div>
              <h3 className="text-2xl font-bold">Subscription Cancelled</h3>
              <p className="text-gray-600">Reactivate to continue receiving bookings</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : 'Reactivate Subscription'}
          </button>
        </div>
      )}
    </div>
  );
}
