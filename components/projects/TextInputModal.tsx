"use client";

import { useState } from 'react';

interface TextInputModalProps {
  title: string;
  placeholder?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void> | void;
}

export default function TextInputModal({
  title,
  placeholder,
  open,
  onClose,
  onSubmit,
}: TextInputModalProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError('Please enter a name');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(value.trim());
      setValue('');
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-60"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
