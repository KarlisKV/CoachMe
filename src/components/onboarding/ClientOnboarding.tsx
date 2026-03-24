'use client';

import { useState } from 'react';
import { completeClientOnboarding } from '@/lib/actions/onboarding';
import { useRouter } from 'next/navigation';

const SPORTS = [
  'Basketball',
  'Tennis',
  'Soccer',
  'Running',
  'Swimming',
  'Gym',
  'Yoga',
  'Pilates',
  'Boxing',
  'CrossFit',
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'Just getting started' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Very experienced' },
];

export default function ClientOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Sports interests
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [customSport, setCustomSport] = useState('');

  // Step 2: Skill level and bio
  const [fullName, setFullName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');
  const [bio, setBio] = useState('');

  function handleSportToggle(sport: string) {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  }

  function handleAddCustomSport() {
    if (customSport.trim() && !selectedSports.includes(customSport)) {
      setSelectedSports(prev => [...prev, customSport]);
      setCustomSport('');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Final submit
    if (!skillLevel) {
      setError('Please select a skill level');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('skill_level', skillLevel);
    formData.append('sports_interests', selectedSports.join(','));
    formData.append('bio', bio);

    const result = await completeClientOnboarding(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Step {step} of 2</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Step 1: Sports interests */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What sports interest you?</h2>
                <p className="text-gray-600">Help us find the right coaches for you</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select sports</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPORTS.map(sport => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportToggle(sport)}
                      className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium text-center ${
                        selectedSports.includes(sport)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or add a custom sport</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Rock climbing"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSport}
                    className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {selectedSports.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSports.map(sport => (
                      <div
                        key={sport}
                        className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {sport}
                        <button
                          type="button"
                          onClick={() => setSelectedSports(prev => prev.filter(s => s !== sport))}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Skill level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your skill level</h2>
                <p className="text-gray-600">This helps match you with the right coach</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Skill level</label>
                <div className="grid grid-cols-1 gap-3">
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setSkillLevel(level.id as any)}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        skillLevel === level.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{level.label}</p>
                      <p className="text-sm text-gray-500">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Tell coaches about yourself..."
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : step === 2 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
