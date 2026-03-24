'use client';

import { useState } from 'react';
import { updateClientProfile, uploadAvatar } from '@/lib/actions/client';
import type { Profile, ClientProfile } from '@/types/database.types';

interface Props {
  profile: Profile;
  clientProfile: ClientProfile;
}

export default function ClientProfileForm({ profile, clientProfile }: Props) {
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
    if (result.error) setError(result.error);
    else if (result.url) setAvatarUrl(result.url);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateClientProfile(formData);
    if (result.error) setError(result.error);
    else setSuccess(true);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">Profile updated!</div>}

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input name="full_name" defaultValue={profile.full_name} required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea name="bio" rows={3} defaultValue={profile.bio || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Tell coaches about yourself..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
        <select name="skill_level" defaultValue={clientProfile.skill_level || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sports Interests</label>
        <input name="sports_interests" defaultValue={clientProfile.sports_interests?.join(', ') || ''}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Tennis, Swimming, Running (comma-separated)" />
      </div>

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
