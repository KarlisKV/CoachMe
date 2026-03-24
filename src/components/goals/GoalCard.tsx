'use client';

import { Goal } from '@/types/database.types';
import { useState } from 'react';
import { updateGoalStatus, deleteGoal } from '@/lib/actions/goals';

interface GoalCardProps {
  goal: Goal & { coach_profiles?: any };
  coachName?: string;
}

export default function GoalCard({ goal, coachName }: GoalCardProps) {
  const [status, setStatus] = useState(goal.status);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleMarkAchieved = async () => {
    try {
      await updateGoalStatus(goal.id, 'achieved');
      setStatus('achieved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      // Component will be removed by parent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      setIsDeleting(false);
    }
  };

  const isAchieved = status === 'achieved';

  return (
    <div
      className={`rounded-xl shadow-sm border p-4 transition-colors ${
        isAchieved
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`font-semibold ${
            isAchieved ? 'text-green-800 line-through' : 'text-gray-900'
          }`}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
            <span>Created {new Date(goal.created_at).toLocaleDateString()}</span>
            {coachName && (
              <>
                <span>•</span>
                <span>Coach: {coachName}</span>
              </>
            )}
            {isAchieved && goal.achieved_at && (
              <>
                <span>•</span>
                <span className="text-green-700">
                  Achieved {new Date(goal.achieved_at).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isAchieved && (
            <button
              onClick={handleMarkAchieved}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Mark Achieved
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
