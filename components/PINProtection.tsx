'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface PINProtectionProps {
  onUnlock: () => void;
}

export default function PINProtection({ onUnlock }: PINProtectionProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin === '8853') {
      // Store in session storage
      sessionStorage.setItem('knowledge_base_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setIsShaking(true);
      setPin('');

      // Reset shake animation after it completes
      setTimeout(() => {
        setIsShaking(false);
        setError(false);
      }, 500);

      inputRef.current?.focus();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      setError(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Knowledge Base Access
          </h1>
          <p className="text-gray-600">
            Enter your PIN to manage the knowledge base
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              PIN Code
            </label>
            <input
              ref={inputRef}
              type="password"
              id="pin"
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
              className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                error
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              } ${isShaking ? 'animate-shake' : ''}`}
              placeholder="••••"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                Incorrect PIN. Please try again.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Unlock
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
