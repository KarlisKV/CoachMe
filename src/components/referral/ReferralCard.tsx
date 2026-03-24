'use client';

import { useState, useEffect } from 'react';
import { getReferralStats, generateReferralCode } from '@/lib/actions/referrals';

export default function ReferralCard() {
  const [code, setCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  async function loadReferralData() {
    try {
      setIsLoading(true);
      const stats = await getReferralStats();
      if (stats.referralCode) {
        setCode(stats.referralCode);
      } else {
        const newCode = await generateReferralCode();
        setCode(newCode);
      }
      setReferralCount(stats.successfulReferrals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy() {
    const shareUrl = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500">Loading referral data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${code}`;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Your Referral Program</h3>

      <div className="space-y-4">
        {/* Referral Code */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
          <div className="flex gap-2">
            <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-gray-300 font-mono font-semibold text-gray-900 text-center">
              {code}
            </code>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Message */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Share This Link</p>
          <div className="bg-white rounded-lg p-3 border border-gray-300 text-sm text-gray-600 font-mono break-all">
            {shareUrl}
          </div>
        </div>

        {/* Referral Count */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Successful Referrals</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{referralCount}</p>
        </div>

        {/* Share Preview */}
        <div className="bg-white rounded-lg p-4 border border-gray-300">
          <p className="text-sm font-medium text-gray-900 mb-2">Share Message Preview</p>
          <p className="text-sm text-gray-600">
            "Join me on CoachMe! Get personalized coaching from verified experts. Use my referral code {code} and we both get benefits!"
          </p>
        </div>
      </div>
    </div>
  );
}
