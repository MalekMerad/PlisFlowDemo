/**
 * SubmitLoader – reusable overlay loader for async submit actions.
 *
 * Props:
 *  - isVisible  {boolean}  Whether the overlay is shown
 *  - message    {string}   Text shown next to the spinner
 */
export default function SubmitLoader({ isVisible, message }) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-lg">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-lg p-4 flex items-center gap-3 border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <svg
          className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}
