import React from 'react';



const labelMap = {
  NumOperation: "Numéro d'opération",
  ServContract: "Service de passation des marchés",
  Objectif: "Objectif de l'opération",
  VisaNum: "Numéro de visa",
  DateVisa: "Date de visa",
  TravalieType: "Type de travail",
  BudgetType: "Type de budget",
  MethodAttribuation: "Méthode d'attribution"
};

const fields = [
  {
    key: "NumOperation",
    label: "Numéro d'opération"
  },
  {
    key: "ServContract",
    label: "Service de passation des marchés"
  },
  {
    key: "Objectif",
    label: "Objectif de l'opération"
  },
  {
    key: "VisaNum",
    label: "Numéro de visa"
  },
  {
    key: "DateVisa",
    label: "Date de visa"
  },
  {
    key: "TravalieType",
    label: "Type de travail"
  },
  {
    key: "BudgetType",
    label: "Type de budget"
  },
  {
    key: "MethodAttribuation",
    label: "Méthode d'attribution"
  }
];

const parseFlexibleDate = (value) => {
  if (!value || typeof value !== "string") return null;

  // Format: JJ/MM/AAAA (French)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // Format: AAAA/MM/JJ (Reversed)
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
    const [year, month, day] = value.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  // ISO or fallback
  const d = new Date(value);
  return isNaN(d) ? null : d;
};

const formatValue = (key, value) => {
  if (key === "DateVisa" && value) {
    const parsedDate = parseFlexibleDate(value);

    if (!parsedDate) {
      return <span className="text-red-500 italic">Date invalide</span>;
    }

    return parsedDate.toLocaleDateString("fr-FR");
  }

  return value !== undefined && value !== null
    ? value
    : <span className="text-gray-400 italic">Non renseigné</span>;
};



const OperationDetails = ({ operation }) => {

  console.log('OperationDetails Operation :', operation)
  return (
    <div className="space-y-6 py-3">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.NumOperation} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("NumOperation", operation.NumOperation)}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.ServContract} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("ServContract", operation.ServiceDeContract)}
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {labelMap.Objectif} <span className="text-red-500">*</span>
        </label>
        <div className="rounded border px-3 py-2 bg-gray-50 min-h-[38px]">
          {formatValue("Objectif", operation.Objectif)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.VisaNum} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("VisaNum", operation.VisaNumber)}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.DateVisa} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("DateVisa", operation.VisaDate)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.TravalieType} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("TravalieType", operation.TypeTravail)}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.BudgetType} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("BudgetType", operation.TypeBudget)}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {labelMap.MethodAttribuation} <span className="text-red-500">*</span>
          </label>
          <div className="rounded border px-3 py-2 bg-gray-50">
            {formatValue("MethodAttribuation", operation.ModeAttribution)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationDetails;
