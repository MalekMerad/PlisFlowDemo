import React from "react";

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
    <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-slate-500 w-24 flex-shrink-0 pt-0.5">
      {label}
    </span>
    <span 
      className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap break-words"
    >
      {value || 'N/A'}
    </span>
  </div>
);

export default DetailRow;
