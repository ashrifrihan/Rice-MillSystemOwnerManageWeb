import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * Lightweight SweetAlert-style popup (no external deps)
 * Props:
 * - isOpen: boolean
 * - type: 'success' | 'error'
 * - title: string
 * - message: string
 * - details: string[]
 * - onClose: () => void
 */
export default function PopupAlert({ isOpen, type = 'success', title, message, details = [], onClose }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const accent = isSuccess
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-red-100 text-red-700 border-red-200';
  const gradient = isSuccess
    ? 'border-2 border-emerald-200'
    : 'border-2 border-red-200';
  const button = isSuccess
    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close popup"
      ></div>

      <div
        role="dialog"
        aria-live="assertive"
        aria-modal="true"
        className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 ${gradient}`}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${accent}`}>
            {isSuccess ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="text-center mb-6">
          {message && <p className="text-lg font-semibold text-gray-800 mb-3">{message}</p>}
          {details.length > 0 && (
            <div
              className={`space-y-2 ${
                isSuccess ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
              } rounded-xl p-4`}
            >
              {details.map((detail, idx) => (
                <p
                  key={idx}
                  className={`text-sm font-medium ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  {detail}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all hover:shadow-lg ${button}`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
