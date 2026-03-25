'use client';

import { useState } from 'react';
import { updateCoachProfile, uploadAvatar } from '@/lib/actions/coach';
import type { Profile, CoachProfile } from '@/types/database.types';

interface Props {
  profile: Profile;
  coachProfile: CoachProfile;
}

export default function CoachProfileForm({ profile, coachProfile }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    const result = await uploadAvatar(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      setAvatarUrl(result.url);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateCoachProfile(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">Profile updated!</div>}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              {profile.full_name.charAt(0)}
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm text-blue-600 hover:underline">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input name="full_name" defaultValue={profile.full_name} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Sport</label>
          <input name="sport" defaultValue={coachProfile.sport} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">All Sports (comma-separated)</label>
        <input name="sports" defaultValue={coachProfile.sports?.join(', ') || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="e.g., Basketball, Soccer, Tennis" />
        <p className="text-xs text-gray-500 mt-1">Enter multiple sports separated by commas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
          <input name="specialty" defaultValue={coachProfile.specialty || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
            placeholder="e.g., Sprint training" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input name="location" defaultValue={coachProfile.location || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
            placeholder="e.g., New York, NY" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
          <input name="hourly_rate" type="number" min="0" step="0.01"
            defaultValue={coachProfile.hourly_rate || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input name="experience_years" type="number" min="0"
            defaultValue={coachProfile.experience_years || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" rows={4} defaultValue={coachProfile.description || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="Tell clients about yourself and your coaching style..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea name="bio" rows={2} defaultValue={profile.bio || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="A short bio about yourself" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input name="contact_email" type="email" defaultValue={coachProfile.contact_email || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input name="contact_phone" type="tel" defaultValue={coachProfile.contact_phone || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Methods</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment_methods" value="cash"
              defaultChecked={coachProfile.payment_methods === 'cash'}
              className="w-4 h-4" />
            <span className="text-gray-700">Cash only</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment_methods" value="card"
              defaultChecked={coachProfile.payment_methods === 'card'}
              className="w-4 h-4" />
            <span className="text-gray-700">Card only</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment_methods" value="both"
              defaultChecked={coachProfile.payment_methods === 'both' || !coachProfile.payment_methods}
              className="w-4 h-4" />
            <span className="text-gray-700">Both cash and card</span>
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
