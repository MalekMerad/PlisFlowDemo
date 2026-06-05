import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Plus, Search, Filter, CheckCircle, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllAnnonces, newAnnonce, updateAnnonce, deleteAnnonce } from '../../services/Annonces/annonceService';
import { AnnouncementsTable } from './AnnouncementsTable';
import { FormModal } from '../Shared/FormModal';
import { NewAnnounceForm } from './NewAnnounceForm';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';

export const AnnouncementSubSection = forwardRef(({ operationID, Annonces, refreshData }, ref) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const { t } = useTranslation();

  // Archive/Filter States
  const [filterStatus, setFilterStatus] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // For animating deleted rows
  const [fadeOutAnns, setFadeOutAnns] = useState({});
  const [stats, setStats] = useState({ active: 0, archived: 0 });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (Annonces) {
      setLoading(false);
    }
  }, [Annonces]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    operationId: operationID || '',
    numero: '',
    datePublication: new Date().toISOString().split('T')[0],
    journal: '',
    delai: '',
    dateOuverture: '',
    heureOuverture: '',
  });

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      handleOpenModal();
    },
    openEditModal: (announcement) => {
      if (announcement) {
        handleOpenModal(announcement);
      }
    }
  }));

  // Calculate statistics whenever announcements change
  useEffect(() => {
    const activeCount = announcements.filter(ann => {
      if (!ann) return false;
      return Number(ann.Status) === 1 && !fadeOutAnns[ann.Id];
    }).length;

    const archivedCount = announcements.filter(ann => {
      if (!ann) return false;
      return Number(ann.Status) === 0;
    }).length;

    setStats({ active: activeCount, archived: archivedCount });
  }, [announcements, fadeOutAnns]);

  const fetchAnnouncements = async () => {
    const currentAdmin = user?.userId || user?.userid;

    // GUARD: Prevent the API call if required IDs are missing
    if (!currentAdmin || !operationID || operationID === 'undefined') {
      console.log("Fetch aborted: Missing adminID or operationID");
      return;
    }

    setLoading(true);
    try {
      // Pass both IDs to the service
      const response = await getAllAnnonces(currentAdmin, operationID);
      const data = response.annonces || response.data || response;

      const filteredByOperation = Array.isArray(data)
        ? data.filter(a => String(a.Id_Operation) === String(operationID))
        : [];

      const sortedData = [...filteredByOperation].sort((a, b) => {
        if (Number(a.Status) !== Number(b.Status)) {
          return Number(b.Status) - Number(a.Status);
        }
        if (a.Date_Overture && b.Date_Overture) {
          return new Date(b.Date_Overture) - new Date(a.Date_Overture);
        }
        return 0;
      });

      setAnnouncements(sortedData);

    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast(
        t('announcementSubSection.fetchError', 'Impossible de charger les annonces.'),
        'error'
      );
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAndArchiveExpiredAnnouncements = async () => {
    const currentAdmin = user?.userId || user?.userid;
    if (!currentAdmin) return;

    let data = [];
    try {
      const response = await getAllAnnonces(currentAdmin);
      data = response.annonces || response.data || response;
      if (!Array.isArray(data)) data = [];
    } catch {
      return; // Silent fail for background check
    }

    // Only announcements that match our operationID
    data = data.filter(a => String(a.Id_Operation) === String(operationID));

    const now = new Date();
    const expiredAnns = [];

    for (const ann of data) {
      if (!ann.Date_Overture || !ann.Heure_Ouverture) continue;

      try {
        const datePart = ann.Date_Overture.split('T')[0];
        const overtureDateTime = new Date(`${datePart}T${ann.Heure_Ouverture}`);

        if (overtureDateTime instanceof Date && !isNaN(overtureDateTime.getTime())) {
          if (now >= overtureDateTime && Number(ann.Status) === 1) { // Only check active
            expiredAnns.push(ann);
          }
        }
      } catch (err) {
        // Parsing error
      }
    }

    // Archive expired announcements
    for (const ann of expiredAnns) {
      try {
        setFadeOutAnns(prev => ({ ...prev, [ann.Id]: true }));

        setTimeout(async () => {
          try {
            await deleteAnnonce(ann.Id);
            if (refreshData) {
              await refreshData();
            }

            setAnnouncements(prev =>
              prev.map(item =>
                item.Id === ann.Id
                  ? { ...item, Status: 0 } // Mark as archived
                  : item
              )
            );

            setFadeOutAnns(prev => {
              const newState = { ...prev };
              delete newState[ann.Id];
              return newState;
            });

            showToast(
              t(
                'announcementSubSection.autoArchiveSuccess',
                `Annonce N°${ann.Numero} archivée automatiquement - date d'ouverture atteinte.`,
                { numero: ann.Numero }
              ),
              'warning'
            );
          } catch (e) {
            setFadeOutAnns(prev => {
              const newState = { ...prev };
              delete newState[ann.Id];
              return newState;
            });
            showToast(
              t(
                'announcementSubSection.autoArchiveFail',
                `Échec archivage automatique N°${ann.Numero}`,
                { numero: ann.Numero }
              ),
              "error"
            );
          }
        }, 400);
      } catch (e) {
        // Error processing expired announcement
      }
    }
  };

  // Setup 1-minute interval for auto-archival
  useEffect(() => {
    const userId = user?.userId || user?.userid;
    if (!userId) return;

    checkAndArchiveExpiredAnnouncements();

    intervalRef.current = setInterval(() => {
      checkAndArchiveExpiredAnnouncements();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.userId, user?.userid, operationID]);


  useEffect(() => {
    setFadeOutAnns(prev => {
      const announcementIds = new Set(announcements.map(ann => ann?.Id));
      const newFadeOutAnns = {};

      Object.keys(prev).forEach(id => {
        if (announcementIds.has(parseInt(id))) {
          newFadeOutAnns[id] = true;
        }
      });

      return newFadeOutAnns;
    });
  }, [announcements]);

  const handleOpenModal = (announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setNewAnnouncement({
        operationId: announcement.Id_Operation,
        numero: announcement.Numero,
        datePublication: announcement.Date_Publication ? announcement.Date_Publication.split('T')[0] : '',
        journal: announcement.Journal,
        delai: announcement.Delai,
        dateOuverture: announcement.Date_Overture ? announcement.Date_Overture.split('T')[0] : '',
        heureOuverture: announcement.Heure_Ouverture
      });
    } else {
      setEditingAnnouncement(null);
      setNewAnnouncement({
        operationId: operationID || '',
        numero: '',
        datePublication: new Date().toISOString().split('T')[0],
        journal: '',
        delai: '',
        dateOuverture: '',
        heureOuverture: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveAnnouncement = async () => {
    // 1. Construct the data object
    const formData = {
      Id: editingAnnouncement ? (editingAnnouncement.Id || editingAnnouncement.id) : null,
      Id_Operation: newAnnouncement.operationId,
      Numero: newAnnouncement.numero,
      Date_Publication: newAnnouncement.datePublication,
      Journal: newAnnouncement.journal,
      Delai: newAnnouncement.delai,
      Date_Overture: newAnnouncement.dateOuverture,
      // Ensure we only send the time part HH:mm
      Heure_Ouverture: newAnnouncement.heureOuverture,
      adminId: user?.userId || user?.userid
    };

    try {
      let result;
      if (editingAnnouncement) {
        // Pass the formData which now contains the 'Id'
        result = await updateAnnonce(formData);
      } else {
        result = await newAnnonce(formData);
      }

      if (result.success) {
        // Re-fetch to see changes
        await fetchAnnouncements();
        setShowModal(false);
        showToast(
          editingAnnouncement
            ? t('announcementSubSection.editSuccess', 'Annonce modifiée avec succès.')
            : t('announcementSubSection.addSuccess', 'Annonce ajoutée.'),
          'success'
        );
        if (refreshData) refreshData();
      } else if (result.code === 1005) {
        showToast(
          t('announcementSubSection.notFound', 'Erreur : Annonce introuvable dans la base de données.'),
          'error'
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast(
        t('announcementSubSection.saveError', "Erreur lors de l'enregistrement"),
        'error'
      );
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      setFadeOutAnns(prev => ({ ...prev, [id]: true }));

      const result = await deleteAnnonce(id);

      if (result.success) {
        setTimeout(() => {
          setAnnouncements(prev =>
            prev.map(ann =>
              ann.Id === id
                ? { ...ann, Status: 0 }
                : ann
            )
          );

          setFadeOutAnns(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
          });

          showToast(
            t('announcementSubSection.archiveSuccess', 'Annonce archivée avec succès.'),
            'success'
          );
        }, 400);
      } else {
        setFadeOutAnns(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        showToast(
          t('announcementSubSection.archiveError', "Erreur lors de l'archivage."),
          'error'
        );
      }
    } catch (error) {
      setFadeOutAnns(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      showToast(
        t('announcementSubSection.archiveError', "Erreur lors de l'archivage."),
        'error'
      );
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (!ann || !ann.Id) return false;
    const annStatus = ann.Status !== undefined ? Number(ann.Status) : null;
    const currentFilter = Number(filterStatus);

    // Filter by status
    if (annStatus !== currentFilter) {
      return false;
    }
    // Fade-out filter for actives
    if (fadeOutAnns[ann.Id] && filterStatus === 1) {
      return false;
    }

    // In this case, let's just allow searching by operationId, journal or numero directly
    const term = searchTerm.trim().toLowerCase();
    const opId = (ann.Id_Operation || '').toString().toLowerCase();
    const journal = (ann.Journal || '').toLowerCase();
    const annNum = (ann.Numero || '').toLowerCase();

    const matchesSearch = (
      opId.includes(term) ||
      journal.includes(term) ||
      annNum.includes(term)
    );

    return matchesSearch;
  });

  const rowClassNameForAnn = (ann) => {
    if (fadeOutAnns[ann.Id]) {
      return 'fade-out-row fading';
    }
    return 'fade-out-row';
  };

  if (loading) return (
    <div className="p-6 text-center text-slate-500 dark:text-slate-400 italic font-medium transition-colors">{t('announcementSubSection.loading', 'Chargement...')}</div>
  );

  return (
    <>
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAnnouncement}
        title={editingAnnouncement ? t('operationDetails.editAnnouncement', "Modifier l'annonce") : t('operationDetails.newAnnouncement', 'Nouvelle Annonce')}
        saveText={editingAnnouncement ? t('edit', 'Modifier') : t('add', 'Ajouter')}
      >
        <NewAnnounceForm
          newAnnouncement={newAnnouncement}
          setNewAnnouncement={setNewAnnouncement}
          isEditing={editingAnnouncement}
          announcements={announcements}
        />
      </FormModal>
      <style>
        {`
        .fade-out-row {
          opacity: 1;
          pointer-events: auto;
          transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
        }
        .fade-out-row.fading {
          opacity: 0.25;
          transition: opacity 0.4s cubic-bezier(.4,0,.2,1);
          pointer-events: none;
        }
        `}
      </style>
    </>
  );
});
