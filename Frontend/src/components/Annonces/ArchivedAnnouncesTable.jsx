import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionModalAnnonceArchive } from "../Retriat Cahier de charge/SectionModalAnnonceArchive";
import { SectionsModal } from "../Shared/SectionsModal";
import { Archive, ChevronDown } from "lucide-react";
import { SpecificationsTable } from "../Retriat Cahier de charge/SpecificationsTable";

function formatDate(dateString, t) {
  if (!dateString) return t("common.notAvailable", "N/A");
  return new Date(dateString).toLocaleDateString(t("lang.locale", "fr-FR"), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString, t) {
  if (!timeString) return t("common.notAvailable", "");
  return new Date(timeString).toLocaleTimeString(t("lang.locale", "fr-FR"), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ArchivedAnnouncesTable = ({ announces, suppliers }) => {
  const { t } = useTranslation();
  const [openAnnonceId, setOpenAnnonceId] = useState(null);

  const archived = Array.isArray(announces)
    ? announces.filter((ann) => ann?.Status === 0 || ann?.ReceptionEnded)
    : [];

  if (!archived.length) return null;

  return (
    <SectionsModal
      icon={<Archive size={15} />}
      title={t("operationDetails.archivedAnnouncements", "Annonces Archivées")}
      className="mt-6"
      showButton={false}
    >
      <div className="space-y-3">
        {archived.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-slate-500 py-6 text-xs italic">
            {t("announcements.noArchived", "Aucune annonce archivée trouvée.")}
          </div>
        ) : (
          <>
            {/* Table header with explicit widths */}
            <div className="flex text-xs mb-2 px-6 justify-center text-center">
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "15%" }}>
                {t("announcements.announcementNumber", "Numéro d'annonce")}
              </div>
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "17%" }}>
                {t("announcements.publicationDate", "Date de publication")}
              </div>
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "18%" }}>
                {t("announcements.journal", "Journal")}
              </div>
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "12%" }}>
                {t("announcements.delay", "Délai")}
              </div>
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "22%" }}>
                {t("announcements.openingDateTime", "Date & Heure d'ouverture")}
              </div>
              <div className="mb-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold" style={{ width: "10%" }}>
                {t("announcements.specificationsCountLabel", "Nb soumission")}
              </div>
            </div>
            {archived.map((ann) => {
              const isOpen = openAnnonceId === ann.id;
              const specs = Array.isArray(suppliers)
                ? suppliers.filter((s) => String(s.AnnonceID) === String(ann.id) || String(s.AnnonceID) === String(ann.Id))
                : [];
              const specsCount = specs.length;

              return (
                <div
                  key={ann.id}
                  className="rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors"
                >
                  <div
                    onClick={() => setOpenAnnonceId(isOpen ? null : ann.id)}
                    className={`
                      flex items-center justify-between p-2 cursor-pointer transition
                      border-l-4
                      ${isOpen
                        ? "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-slate-400 dark:border-slate-500"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"}
                    `}
                  >
                    <div className="flex items-center gap-2 w-full justify-center">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                      <div className="w-full">
                        <div className="flex text-[10px] justify-center items-center text-center">
                          <div className="mb-2 flex justify-center items-center" style={{ width: "15%" }}>
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-[10px]">
                              {ann.Numero || t("common.notAvailable", "")}
                            </p>
                          </div>
                          <div className="mb-2 flex justify-center items-center" style={{ width: "17%" }}>
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-[10px]">
                              {ann.Date_Publication
                                ? formatDate(ann.Date_Publication, t)
                                : t("common.notAvailable", "")}
                            </p>
                          </div>
                          <div className="mb-2 flex justify-center items-center" style={{ width: "18%" }}>
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-[10px]">
                              {ann.Journal || t("common.notAvailable", "")}
                            </p>
                          </div>
                          <div className="mb-2 flex justify-center items-center" style={{ width: "12%" }}>
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-[10px]">
                              {ann.Delai !== undefined && ann.Delai !== null
                                ? ann.Delai
                                : t("common.notAvailable", "/")}
                            </p>
                          </div>
                          <div className="mb-2 flex justify-center items-center" style={{ width: "22%" }}>
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-[10px]">
                              {(ann.Date_Overture || ann.Heure_Ouverture) ? (
                                <>
                                  {ann.Date_Overture
                                    ? formatDate(ann.Date_Overture, t)
                                    : t("common.notAvailable", "")}
                                  {" "}
                                  {ann.Heure_Ouverture
                                    ? formatTime(ann.Heure_Ouverture, t)
                                    : ""}
                                </>
                              ) : (
                                t("common.notAvailable", "")
                              )}
                            </p>
                          </div>
                          <div className="mb-2 flex justify-center items-center" style={{ width: "10%" }}>
                            <span className="font-medium text-slate-800 dark:text-slate-100 text-[10px]">
                              {specsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Expanded Section */}
                  {isOpen && specsCount !== 0 && (
                    <SectionModalAnnonceArchive showButton={false}>
                      <SpecificationsTable specifications={specs} />
                    </SectionModalAnnonceArchive>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </SectionsModal>
  );
}

export default ArchivedAnnouncesTable;
