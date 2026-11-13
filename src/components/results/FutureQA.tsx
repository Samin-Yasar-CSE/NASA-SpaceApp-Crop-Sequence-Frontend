import { MessageSquare, Lock } from 'lucide-react';

export default function FutureQA() {
  return (
    <div className="card animate-slide-up opacity-75">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-500">Ask About Your Recommendations</h2>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          <Lock className="h-3 w-3" />
          Coming Soon
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Soon you&apos;ll be able to ask questions about your crop sequence recommendations,
        request explanations for specific suggestions, and explore what-if scenarios.
      </p>

      <div className="flex gap-3 opacity-50 pointer-events-none">
        <input
          type="text"
          disabled
          className="input-field flex-1"
          placeholder="e.g., Why is soybean recommended for season 2?"
        />
        <button disabled className="btn-primary px-4" aria-label="Send question">
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

