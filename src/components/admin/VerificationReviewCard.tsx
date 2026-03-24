'use client';

import { useState } from 'react';
import { reviewVerification } from '@/lib/actions/verification';
import type { VerificationRequestWithCoach } from '@/types/database.types';

interface Props {
  request: VerificationRequestWithCoach;
  onReviewed?: () => void;
}

export default function VerificationReviewCard({ request, onReviewed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const result = await reviewVerification(request.id, 'approved');
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onReviewed?.();
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await reviewVerification(request.id, 'rejected', rejectionReason);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onReviewed?.();
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      {/* Coach Info */}
      <div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {request.coach_profiles.profiles.full_name}
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Email: {request.coach_profiles.profiles.id}</p>
          <p>Sport: {request.coach_profiles.sport}</p>
          <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* ID Document */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">ID Document</h4>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Document: {request.id_document_url}</p>
          <p className="text-xs text-gray-500 mt-2">
            Note: Private storage. Document can be viewed in Supabase console.
          </p>
        </div>
      </div>

      {/* Certification URLs */}
      {request.certification_urls && request.certification_urls.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Certification URLs</h4>
          <ul className="space-y-2">
            {request.certification_urls.map((url, idx) => (
              <li key={idx} className="text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {request.notes && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Applicant Notes</h4>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
            {request.notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {showRejectForm ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (Required)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Explain why you're rejecting this verification request..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="flex-1 bg-red-100 text-red-700 px-4 py-2.5 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
