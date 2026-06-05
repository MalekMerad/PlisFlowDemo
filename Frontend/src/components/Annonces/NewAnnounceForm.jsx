import { useEffect, useRef } from "react";
import { addDays } from '../../utils/dateFormat';
import { useTranslation } from 'react-i18next';

export function NewAnnounceForm({ newAnnouncement, setNewAnnouncement, isEditing }) {
    const { t } = useTranslation();
    const lastAutoUpdateRef = useRef(null);

    useEffect(() => {
        const { datePublication, delai } = newAnnouncement;

        if (datePublication && delai && /^\d+$/.test(delai)) {
            const calculated = addDays(datePublication, delai);

            setNewAnnouncement(n => {
                lastAutoUpdateRef.current = calculated;
                return { ...n, dateOuverture: calculated };
            });
        }
    }, [newAnnouncement.datePublication, newAnnouncement.delai]);

    const inputBaseClasses = "w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all text-xs";
    const labelBaseClasses = "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap w-4 min-w-[100px]">
                            {t('announceForm.numero')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newAnnouncement.numero}
                            onChange={e => setNewAnnouncement({ ...newAnnouncement, numero: e.target.value })}
                            className={`${inputBaseClasses} ${isEditing ? 'cursor-default' : ''} flex-1 ml-[+7%]`}
                            placeholder={t('announceForm.numeroPlaceholder', { defaultValue: "Ex: 2024/01" })}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap min-w-[100px] ml-[+7%]">
                            {t('announceForm.journal')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newAnnouncement.journal}
                            onChange={e => setNewAnnouncement({ ...newAnnouncement, journal: e.target.value })}
                            className={`${inputBaseClasses} flex-1`}
                            placeholder={t('announceForm.journalPlaceholder', { defaultValue: "Ex: BOMOP" })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap w-[38%] min-w-[100px]">
                            {t('announceForm.datePublication')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={newAnnouncement.datePublication}
                            onChange={e => setNewAnnouncement({ ...newAnnouncement, datePublication: e.target.value })}
                            className={`${inputBaseClasses} flex-1 ml-[+7%]`}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap w-[53%] min-w-[100px] ml-[+7%]">
                            {t('announceForm.delai')} <span className="text-red-500">*</span> ({t('announceForm.jours', { defaultValue: 'jours' })})
                        </label>
                        <input
                            type="number"
                            value={newAnnouncement.delai}
                            onChange={e => setNewAnnouncement({ ...newAnnouncement, delai: e.target.value })}
                            className={`${inputBaseClasses} flex-1`}
                            placeholder={t('announceForm.delaiPlaceholder', { defaultValue: "21" })}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap w-[38%] min-w-[100px]">
                            {t('announceForm.dateOuverture')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={newAnnouncement.dateOuverture}
                            onChange={e => {
                                setNewAnnouncement({ ...newAnnouncement, dateOuverture: e.target.value });
                                lastAutoUpdateRef.current = null;
                            }}
                            className={`${inputBaseClasses} flex-1 ml-[+7%]`}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium mb-0.5 whitespace-nowrap w-[68%] min-w-[100px] ml-[+7%]">
                            {t('announceForm.heureOuverture')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={newAnnouncement.heureOuverture || ''}
                            onChange={e =>
                                setNewAnnouncement({ ...newAnnouncement, heureOuverture: e.target.value })
                            }
                            className={`${inputBaseClasses} flex-1`}
                            placeholder={t('announceForm.heureOuverturePlaceholder', { defaultValue: "hh:mm" })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}