import React from 'react';

const colorMap = {
  "Lots": "w-0.5 h-4 border-blue-500 border-l-2",
  "Cahiers de Charges": "w-1 h-3 border-emerald-500 border-l-2",
};

export const SectionModalAnnonceArchive = ({
  title,
  children,
}) => {
  const color = colorMap[title] || "border-gray-300";

  return (
    <section className="bg-white dark:bg-slate-900 rounded shadow-sm overflow-hidden">
      <div className="p-4">
        {children}
      </div>
    </section>
  );
};
