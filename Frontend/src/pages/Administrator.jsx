import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Sidebar } from '../components/Shared/Sidebar';
import { OperationsSection } from '../components/Operations/OperationsSection';
import { SpecificationsSection } from '../components/Retriat Cahier de charge/SpecificationsSection';
import { SuppliersSection } from '../components/Suppliers/SuppliersSection';
import { CommissionSection } from '../components/CommissionMembres/CommissionSection';
import { EvaluationSection } from '../components/Evaluation/EvaluationSection';
import { BudgetOperationsSection } from '../components/Budget/BudgetOperationsSection';

export function Administrator() {
    const location = useLocation();

    const [activeSection, setActiveSection] = useState(
        location.state?.activeSection || 'operations'
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'operations':
                return <OperationsSection />;
            case 'supplier':
                return <SuppliersSection />;
            case 'cahierDeCharge':
                return <SpecificationsSection />;
            case 'commission':
                return <CommissionSection />;
            case 'evaluation':
                return <EvaluationSection />;
            case 'expenses_tracking':
                return <BudgetOperationsSection />;
            default:
                return <OperationsSection />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
            {/* Header */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            {/* Content - Remove any width constraints here */}
            <main className="flex-1 overflow-y-auto w-full">
                {renderSection()}
            </main>
        </div>
    );
}
