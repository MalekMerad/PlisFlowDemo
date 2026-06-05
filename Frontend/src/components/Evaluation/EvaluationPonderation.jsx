import React, { useState, useEffect } from "react";
import { Lock, CheckCircle } from "lucide-react";

const EvaluationPonderation = ({ 
  operationId,
  initialWeights,
  isLocked: initialIsLocked,
  onWeightChange,
  onLock 
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weightingOptions = [
    { id: 1, technique: 70, financier: 30, label: "70% Technique / 30% Financier" },
    { id: 2, technique: 60, financier: 40, label: "60% Technique / 40% Financier" },
    { id: 3, technique: 50, financier: 50, label: "50% Technique / 50% Financier" },
  ];

  // Sync with props whenever they change
  useEffect(() => {
    console.log('EvaluationPonderation received props:', {
      initialWeights,
      initialIsLocked,
      operationId
    });
    
    setIsLocked(initialIsLocked || false);
    
    // Set selected option based on initial weights from DB
    if (initialWeights?.TechnicalWeight && initialWeights?.FinancialWeight) {
      console.log('Setting selected option based on weights:', initialWeights);
      
      const matchingOption = weightingOptions.find(
        option => option.technique === initialWeights.TechnicalWeight && 
                  option.financier === initialWeights.FinancialWeight
      );
      
      console.log('Matching option found:', matchingOption);
      
      if (matchingOption) {
        setSelectedOption(matchingOption.id);
      } else {
        // If weights don't match any predefined option, clear selection
        setSelectedOption(null);
      }
    } else {
      console.log('No weights provided, clearing selection');
      setSelectedOption(null);
    }
  }, [initialWeights, initialIsLocked, operationId]); // Re-run when props change

  const handleValidate = async () => {
    if (!selectedOption || isLocked || isSubmitting) return;

    const selected = weightingOptions.find(opt => opt.id === selectedOption);
    
    setIsSubmitting(true);
    try {
      // Call the weight change handler
      await onWeightChange(
        operationId,
        selected.technique,
        selected.financier
      );
      
      // Note: isLocked will be updated by the useEffect when props change
      // after the parent component refetches the data
      
    } catch (error) {
      console.error("Error setting weights:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-slate-700 px-4 py-2">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          Pondération de l'Évaluation
        </h3>
      </div>

      <div className="p-4">
        {/* Subtitle */}
        <p className="text-xs text-gray-600 mb-3">
          Choisissez la pondération officielle pour cette opération
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {weightingOptions.map((option) => {
            const isSelected = option.id === selectedOption;
            return (
              <button
                key={option.id}
                onClick={() => !isLocked && setSelectedOption(option.id)}
                disabled={isLocked}
                className={`
                  relative flex items-center p-3 rounded-lg border transition-all text-left w-full font-semibold
                  ${isSelected 
                    ? isLocked 
                      ? "bg-green-50 border-green-200" 
                      : "bg-slate-700 border-slate-700 text-white"
                    : "bg-white border-gray-200 text-slate-700 hover:border-slate-300"
                  }
                  ${isLocked && !isSelected ? "opacity-60 cursor-not-allowed" : ""}
                  ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Number with circle background */}
                <span className={`
                  flex items-center justify-center w-5 h-5 rounded-full mr-2 text-xs font-medium flex-shrink-0
                  ${isSelected 
                    ? isLocked
                      ? "bg-green-600 text-white"
                      : "bg-white text-slate-700"
                    : "bg-slate-200 text-slate-700"
                  }
                `}>
                  {option.id}
                </span>
                
                {/* Label Text */}
                <span className="text-[10px] font-medium leading-tight flex-1">
                  {option.label}
                </span>

                {/* Selected indicator when locked */}
                {isSelected && isLocked && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 ml-1 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lock Status Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800">
                Pondération {isLocked ? 'verrouillée' : 'non verrouillée'}
                {isLocked && selectedOption && (
                  <>: {weightingOptions.find(o => o.id === selectedOption)?.label}</>
                )}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {isLocked 
                  ? "Vous ne pouvez plus changer cette pondération."
                  : "Sélectionnez une pondération et validez pour verrouiller"}
              </p>
            </div>
          </div>
          {!isLocked && (
            <button
              type="button"
              onClick={handleValidate}
              disabled={!selectedOption || isSubmitting}
              className="ml-4 bg-slate-700 text-white text-xs font-semibold py-1.5 px-4 rounded transition-all shadow-sm hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? 'Validation...' : 'Valider'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationPonderation;