import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Plus, Filter, ChevronRight } from 'lucide-react';
import SessionManagerModal from '../Shared/SessionManagerModal';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from "../../hooks/useToast";
import { getSessionsWithOperationsService, createSessionService } from '../../services/Evaluation/evaluationServices';

export function EvaluationSection() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchData = async () => {
    if (!user) {
      console.log("User not loaded yet");
      return;
    }

    const adminId = user.userId;

    if (!adminId) {
      console.error("No user ID found in user object:", user);
      return;
    }

    setIsLoading(true);
    try {
      const sessionsData = await getSessionsWithOperationsService(adminId);

      // Handle Sessions
      if (sessionsData && sessionsData.success && Array.isArray(sessionsData.data)) {
        setSessions(sessionsData.data);
        setFilteredSessions(sessionsData.data);
      } else if (Array.isArray(sessionsData)) {
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
      } else {
        console.error("Invalid sessions response:", sessionsData);
        setSessions([]);
        setFilteredSessions([]);
      }

    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Apply date filter
  useEffect(() => {
    if (!dateFilter) {
      setFilteredSessions(sessions);
    } else {
      const filterDate = new Date(dateFilter).toDateString();
      const filtered = sessions.filter(session => {
        const sessionDate = new Date(session.SessionDateTime).toDateString();
        return sessionDate === filterDate;
      });
      setFilteredSessions(filtered);
    }
  }, [dateFilter, sessions]);

  const clearDateFilter = () => {
    setDateFilter('');
    setShowDateFilter(false);
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const lang = i18n.language?.substring(0, 2) || 'fr';
    const currentLocale = lang === 'ar' ? 'ar-DZ' : (lang === 'en' ? 'en-US' : 'fr-FR');

    return {
      full: date.toLocaleDateString(currentLocale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      short: date.toLocaleDateString(currentLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString(currentLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  const handleCreateSession = async ({ selectedDateTime, selectedOperations }) => {
    if (!selectedOperations || selectedOperations.length === 0) {
      showToast(t('evaluation.selectAtLeastOneOperation'), "error");
      return { success: false };
    }

    if (!user?.userId) {
      showToast(t('evaluation.notAuthenticated'), "error");
      return { success: false };
    }

    try {
      // Format the datetime properly for SQL Server
      let formattedDateTime = selectedDateTime;
      if (formattedDateTime.length === 16 && formattedDateTime.includes('T')) {
        formattedDateTime = `${formattedDateTime}:00`;
      }

      // Prepare operations data for API
      const operationsData = selectedOperations.map(op => ({
        OperationId: op.id || op.OperationId,
        Reference: op.Numero || op.reference,
        Titre: op.Objet || op.titre
      }));

      // Create session with operations
      const response = await createSessionService(
        formattedDateTime,
        operationsData,
        user.userId
      );

      if (response.success && response.session) {
        showToast(t('evaluation.sessionCreatedSuccess'), "success");
        await fetchData();
        return { success: true, sessionId: response.sessionId || response.session.SessionID };
      } else {
        showToast(response.message || t('evaluation.sessionCreateError'), "error");
        return { success: false };
      }
    } catch (error) {
      console.error("Error creating session:", error);
      showToast(t('evaluation.sessionCreateError'), "error");
      return { success: false };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="text-sm text-gray-500 dark:text-slate-400">{t('evaluation.loading')}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-slate-950 transition-colors overflow-auto">
      <div className="p-4 md:p-6 lg:p-8 w-full">
        <div className="space-y-4 w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('evaluation.title')}</h2>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{t('evaluation.manageSessions')}</p>
            </div>
            <button
              onClick={() => setShowSessionModal(true)}
              className="px-2 py-1 bg-slate-700 dark:bg-slate-800 cursor-pointer text-white rounded text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {t('evaluation.newSession')}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg p-3 shadow-sm transition-colors w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{t('evaluation.filterByDate')}:</span>
                <div className="relative">
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-[11px] text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  >
                    <Filter className="w-3 h-3" />
                    {dateFilter ? formatSessionDate(dateFilter).short : t('evaluation.allSessions')}
                  </button>

                  {showDateFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10 transition-colors">
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          setShowDateFilter(false);
                        }}
                        className="text-xs border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      {dateFilter && (
                        <button
                          onClick={clearDateFilter}
                          className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 w-full text-center"
                        >
                          {t('evaluation.clearFilter')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {t('evaluation.sessionsFound', { count: filteredSessions.length })}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3 w-full">
            {filteredSessions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg p-8 text-center transition-colors w-full">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t('evaluation.noSessionFound')}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                  {dateFilter
                    ? t('evaluation.noSessionForDate')
                    : t('evaluation.startByCreatingNewSession')}
                </p>
                {!dateFilter && (
                  <button
                    onClick={() => setShowSessionModal(true)}
                    className="px-4 py-2 bg-slate-700 dark:bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('evaluation.createSession')}
                  </button>
                )}
              </div>
            ) : (
              filteredSessions.map((session, index) => {
                const dateFormatted = formatSessionDate(session.SessionDateTime);
                const operations = session.operations || [];
                const totalOperations = operations.length;

                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md flex items-center justify-between py-3 px-4 w-full"
                  >
                    <div className="flex items-center gap-4 flex-1 flex-wrap">
                      {/* Date/Time Info */}
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded p-1.5 transition-colors">
                          <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div dir="auto">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-100" dir="auto">
                            {dateFormatted.full}
                          </div>
                        </div>
                      </div>

                      {/* Stats Badges */}
                      <div className="flex items-center gap-2 ml-4">
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded bg-opacity-70 dark:bg-opacity-50 text-[10px] font-medium transition-colors">
                          {t('evaluation.operationCount', { count: totalOperations, defaultValue: `${totalOperations} Opérations` })}
                        </span>
                      </div>
                    </div>

                    {/* Details Button */}
                    <button
                      onClick={() => navigate(`/session/${session.SessionID}`)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-100 rounded text-[11px] font-medium transition cursor-pointer"
                    >
                      {t('operations.viewDetails', { defaultValue: 'Détails' })}
                      <ChevronRight className="w-3 h-3" style={{ transform: i18n.language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Session Manager Modal */}
      <SessionManagerModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}