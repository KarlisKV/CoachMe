'use client';

import { useState } from 'react';
import { addSessionNote, updateSessionNote } from '@/lib/actions/sessions';
import type { SessionNote } from '@/types/database.types';

interface Props {
  bookingId: string;
  existingNote?: SessionNote | null;
}

export default function SessionNoteForm({ bookingId, existingNote }: Props) {
  const [note, setNote] = useState(existingNote?.note || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!existingNote);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSave() {
    if (!note.trim()) {
      setMessage({ type: 'error', text: 'Note cannot be empty' });
      return;
    }

    setLoading(true);
    try {
      let result;
      if (existingNote) {
        result = await updateSessionNote(existingNote.id, note);
      } else {
        const formData = new FormData();
        formData.set('booking_id', bookingId);
        formData.set('note', note);
        result = await addSessionNote(formData);
      }

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: existingNote ? 'Note updated' : 'Note added' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  if (!isEditing && existingNote) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900">Session Note</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
        <p className="text-gray-600 whitespace-pre-wrap text-sm">{existingNote.note}</p>
        <p className="text-xs text-gray-400 mt-2">
          Updated {new Date(existingNote.updated_at).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-medium text-gray-900 mb-3">
        {existingNote ? 'Edit Session Note' : 'Add Session Note'}
      </h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write notes about the session..."
        className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {message && (
        <div
          className={`mt-2 text-sm p-2 rounded ${
            message.type === 'error'
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Saving...' : 'Save Note'}
        </button>
        {isEditing && existingNote && (
          <button
            onClick={() => {
              setIsEditing(false);
              setNote(existingNote.note);
              setMessage(null);
            }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
