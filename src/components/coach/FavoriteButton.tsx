'use client';

import { useState } from 'react';
import { toggleFavorite } from '@/lib/actions/favorites';

interface Props {
  coachId: string;
  isFavorited: boolean;
}

export default function FavoriteButton({ coachId, isFavorited: initialFavorited }: Props) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleFavorite(coachId);
    if (!result.error) {
      setIsFavorited(result.favorited || false);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
