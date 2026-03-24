'use client';

import { Package } from '@/types/database.types';
import { togglePackageActive } from '@/lib/actions/packages';
import { useState } from 'react';

interface PackageCardProps {
  package: Package;
  isOwner?: boolean;
}

export default function PackageCard({ package: pkg, isOwner }: PackageCardProps) {
  const [isActive, setIsActive] = useState(pkg.is_active);
  const [loading, setLoading] = useState(false);

  const pricePerSession = pkg.price / pkg.session_count;

  const handleToggle = async () => {
    setLoading(true);
    const result = await togglePackageActive(pkg.id, !isActive);
    if (result.success) {
      setIsActive(!isActive);
    } else {
      alert(result.error || 'Failed to update package');
    }
    setLoading(false);
  };

  return (
    <div
      className={`rounded-xl shadow-sm border ${
        isActive
          ? 'bg-white border-gray-100'
          : 'bg-gray-50 border-gray-200'
      } p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{pkg.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{pkg.sport}</p>
        </div>
        {isOwner && (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        )}
      </div>

      {pkg.description && (
        <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
      )}

      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Sessions</span>
          <span className="font-semibold">{pkg.session_count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Price</span>
          <span className="text-2xl font-bold text-blue-600">
            €{(pkg.price / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700 text-sm">Price per session</span>
          <span className="font-medium">€{(pricePerSession / 100).toFixed(2)}</span>
        </div>
      </div>

      {!isOwner && (
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Purchase Package
        </button>
      )}
    </div>
  );
}
