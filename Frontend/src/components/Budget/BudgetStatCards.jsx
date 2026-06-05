import { useTranslation } from 'react-i18next';

export function BudgetStatCards({ cards }) {
  const { t, i18n } = useTranslation();

  const formatCurrency = (amount, locale) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }

    const formattedNumber = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    if (i18n.language === 'ar') {
      return formattedNumber.replace('DZD', 'دج');
    }

    return formattedNumber;
  };

  const getLocale = () => {
    if (i18n.language === 'ar') return 'ar-DZ';
    if (i18n.language === 'en') return 'en-US';
    return 'fr-FR';
  };

  const currentLocale = getLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {cards.map((card) => (
        <article
          key={card.title}
          className="relative overflow-hidden bg-white dark:bg-gradient-to-tr dark:from-slate-900 dark:to-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all hover:shadow-md group w-full"
        >
          {/* Decorative glow */}
          <span className="pointer-events-none absolute -top-3 -right-3 w-16 h-16 bg-blue-400/10 dark:bg-blue-600/15 rounded-full blur-2xl opacity-70 group-hover:scale-110 transition-transform" />

          <div className="flex items-center justify-between gap-4 w-full">
            {/* Content */}
            <div className="flex flex-col items-start text-start flex-1 min-w-0">
              <h3 className="text-xs tracking-widest text-slate-500 dark:text-slate-400 drop-shadow-sm truncate w-full">
                {card.title}
              </h3>
              <div className="flex items-center gap-2 w-full flex-wrap">
                <p className="mt-0.5 text-lg font-bold text-slate-700 dark:text-white select-text transition-colors truncate tracking-tight">
                  {formatCurrency(card.value, currentLocale)}
                </p>
                {card.creditAdjustment !== undefined && card.creditAdjustment !== null && card.creditAdjustment > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      +{formatCurrency(card.creditAdjustment, currentLocale)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {card.icon ? (
              <span
                className="flex items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-800/50 p-2 shadow-inner shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={card.onAction}
              >
                <card.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}