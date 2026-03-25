'use client';

import { useState } from 'react';
import { submitVerification } from '@/lib/actions/verification';
import type { VerificationStatus, VerificationRequest } from '@/types/database.types';

interface Props {
  currentStatus: VerificationStatus;
  existingRequest?: VerificationRequest | null;
}

export default function VerificationForm({ currentStatus, existingRequest }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await submitVerification(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setFileName(null);
      const form = document.getElementById('verification-form') as HTMLFormElement;
      if (form) form.reset();
    }
    setLoading(false);
  }

  // Verified status
  if (currentStatus === 'verified') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">Your identity has been verified</h3>
            <p className="text-sm text-green-700 mt-1">You're all set to coach on CoachMe.</p>
          </div>
        </div>
      </div>
    );
  }

  // Pending status
  if (currentStatus === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⏳</div>
          <div>
            <h3 className="font-semibold text-yellow-900">Verification under review</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your verification request was submitted on {existingRequest?.created_at && new Date(existingRequest.created_at).toLocaleDateString()}.
              We'll review it shortly and notify you of the result.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected status
  if (currentStatus === 'rejected') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">✗</div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Verification rejected</h3>
              {existingRequest?.rejection_reason && (
                <p className="text-sm text-red-700 mt-2">
                  Reason: {existingRequest.rejection_reason}
                </p>
              )}
              <p className="text-sm text-red-700 mt-2">You can resubmit your verification below.</p>
            </div>
          </div>
        </div>

        <form id="verification-form" action={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">Verification submitted!</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Document (Required)
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  name="id_document"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFileName(file?.name || null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  required
                />
              </div>
              {fileName && (
                <span className="text-sm text-gray-600 truncate">{fileName}</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload a photo or scan of your government ID (passport, driver's license, etc.)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certification URLs (Optional)
            </label>
            <textarea
              name="certification_urls"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
              placeholder="Enter certification URLs, one per line&#10;e.g., https://example.com/cert1&#10;https://example.com/cert2"
            />
            <p className="text-xs text-gray-500 mt-1">Links to verify your coaching certifications</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
              placeholder="Add any additional information about your qualifications..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Resubmit Verification'}
          </button>
        </form>
      </div>
    );
  }

  // Unverified status - show submission form
  return (
    <form id="verification-form" action={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">Verification submitted successfully! Our team will review it shortly.</div>}

      <div>
        <h3 className="font-semibold text-lg mb-2 text-gray-900">Verify Your Identity</h3>
        <p className="text-gray-600 text-sm">To build trust with clients, please verify your identity by uploading a government-issued ID.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Document (Required)
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              name="id_document"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file?.name || null);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>
          {fileName && (
            <span className="text-sm text-gray-600 truncate">{fileName}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">Upload a photo or scan of your government ID (passport, driver's license, etc.)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certification URLs (Optional)
        </label>
        <textarea
          name="certification_urls"
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="Enter certification URLs, one per line&#10;e.g., https://example.com/cert1&#10;https://example.com/cert2"
        />
        <p className="text-xs text-gray-500 mt-1">Links to verify your coaching certifications</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="Add any additional information about your qualifications..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Verification'}
      </button>
    </form>
  );
}
