import { Edit2, ArchiveIcon } from 'lucide-react';
import { useState } from "react";
import { Pagination } from "../Shared/tools/Pagination"

export function AnnouncementsTable({
  announcements,
  handleOpenModal,
  handleDeleteAnnouncement,
  filterStatus = 1,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(announcements.length / rowsPerPage);

  const isActiveView = Number(filterStatus) === 1;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-slate-800 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 sticky top-0 transition-colors">
            <tr>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider"> Numero d'annonce </th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Date publication</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Journal</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Délai</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Date ouverture</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Heure d'ouverture</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Numero d'operation</th>
              <th className="border-b border-gray-300 dark:border-slate-700 px-4 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 transition-colors">
            {currentAnnouncements.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm italic"
                >
                  Aucune annonce trouvée.
                </td>
              </tr>
            ) : (
              currentAnnouncements.map((ann) => (
                <tr key={ann.Id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0 text-center">
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{ann.Numero}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{new Date(ann.Date_Publication).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{ann.Journal}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{ann.Delai}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{new Date(ann.Date_Overture).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300 font-mono">{ann.Heure_Ouverture || "--:--"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{ann.Id_Operation}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-4">
                      {isActiveView ? (
                        <>
                          <button
                            onClick={() => handleOpenModal(ann)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.Id)}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            title="Archiver"
                          >
                            <ArchiveIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className="inline-block text-gray-400 font-bold text-lg px-2 select-none"
                            style={{ letterSpacing: "2px" }}
                          >
                            /
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
      />
    </div>
  );
}
