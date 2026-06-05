import React from 'react';
import { FileText, UserCheck, ClipboardList, User, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MiniSidebar from "../components/Shared/MiniSidebar";

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const sections = [
        { id: 'operations', label: t('sidebar.operations'), icon: FileText },
        { id: 'supplier', label: t('sidebar.suppliers'), icon: User },
        { id: 'commission', label: t('sidebar.commission'), icon: UserCheck },
        { id: 'evaluation', label: t('sidebar.evaluation'), icon: ClipboardList },
        { id: 'expenses_tracking', label: t('sidebar.expenses_tracking'), icon: WalletCards },
    ];

    const handleSectionChange = (sectionId) => {
        navigate('/admin', {
            state: { activeSection: sectionId }
        });
    };

    const chunkIntoPairs = (arr) => {
        const result = [];
        for (let i = 0; i < arr.length; i += 2) {
            result.push(arr.slice(i, i + 2));
        }
        return result;
    };

    const pairedSections = chunkIntoPairs(sections);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
            <MiniSidebar />
            <main className="flex flex-1 justify-center items-center p-4">
                <div className="flex flex-col gap-6 max-w-4xl w-full">
                    {pairedSections.map((pair, rowIdx) => (
                        <div
                            key={rowIdx}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
                        >
                            {pair.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={section.id}
                                        onClick={() => handleSectionChange(section.id)}
                                        className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 
                                                   flex flex-col items-center justify-center
                                                   cursor-pointer border-2 border-slate-200 dark:border-slate-800
                                                   hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all
                                                   transform hover:scale-105"
                                    >
                                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-3 flex items-center justify-center">
                                            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-center font-semibold text-gray-800 dark:text-slate-200 text-sm">
                                            {section.label}
                                        </h3>
                                    </div>
                                );
                            })}
                            {pair.length === 1 && (
                                <div className="invisible" />
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
