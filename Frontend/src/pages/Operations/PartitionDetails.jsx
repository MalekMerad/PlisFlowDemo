import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PieChart, Activity, DollarSign, List } from 'lucide-react';
import { getPartitionDetailsService } from '../../services/ApServices/ApServices';
import { useToast } from '../../hooks/useToast';
import { Sidebar } from '../../components/Shared/Sidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const PartitionDetails = () => {
  const { partitionId } = useParams();
  const [searchParams] = useSearchParams();
  const operationId = searchParams.get('operationId');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const currentLocale =
    i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  const formatCurrency = useCallback((amount, locale) => {
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
  }, [i18n.language]);

  const formatDate = useCallback((dateString) => {
    if (!dateString || dateString === 'Initial') return t('partitionDetails.initial', 'Initial');
    try {
      return new Intl.DateTimeFormat(currentLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  }, [currentLocale, t]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!partitionId || !operationId) return;
      try {
        setLoading(true);
        const result = await getPartitionDetailsService(partitionId, operationId);
        if (result) {
          setData(result);
        }
      } catch (error) {
        showToast(
          t('partitionDetails.fetchError', 'Failed to fetch partition details'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [partitionId, operationId]);

  if (loading) {
    return (
      <>
        <Sidebar activeSection="operations" />
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
            <p className="text-gray-400 dark:text-slate-500 text-xs italic">{t('loading', 'Loading...')}</p>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Sidebar activeSection="operations" />
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <p className="text-red-500 dark:text-red-400 text-sm font-medium">
              {t('partitionDetails.noData', 'No data available for this partition.')}
            </p>
            <button onClick={() => navigate(-1)} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm transition-colors">
              <ArrowLeft size={14} /> {t('common.back', 'Back')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const engagementChartData = [
    {
      name: t('partitionDetails.engagements', 'Engagements'),
      Validated: data.stats.engagements.validated || 0,
      Pending: data.stats.engagements.pending || 0,
    },
  ];

  const paymentChartData = [
    {
      name: t('partitionDetails.payments', 'Payments'),
      Validated: data.stats.payments.validated || 0,
      Pending: data.stats.payments.pending || 0,
    },
  ];

  const timelineData = data.timeline.map((item, index) => ({
    id: index,
    displayDate: formatDate(item.date),
    originalDate: item.date,
    remainingBudget: item.remainingBudget,
    amountReduced: item.amountReduced || 0,
    cumulativeReduced: item.cumulativeReduced || 0,
    reference: item.reference || '',
    engagementDescription: item.engagementDescription || '',
  }));


  const CustomLegend = ({ payload }) => {
    // Filter out duplicate entries based on dataKey
    const uniquePayload = payload.filter((entry, index, self) =>
      index === self.findIndex((e) => e.dataKey === entry.dataKey)
    );

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        fontSize: '10px',
        paddingTop: '8px',
        width: '100%'
      }}>
        {uniquePayload.map((entry, index) => (
          <div key={`legend-${entry.dataKey}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: entry.color
            }} />
            <span style={{ color: '#64748b' }}>
              {entry.dataKey === 'Validated'
                ? t('budget.statusLabels.validated', 'Validated')
                : t('budget.statusLabels.pending', 'Pending')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Sidebar activeSection="operations" />
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="flex-1 w-full overflow-x-auto">
          <div className="p-4 md:p-6 lg:p-8 w-full">
            <div className="space-y-4 w-full">
              {/* KPI Summary Cards - Responsive grid with full width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {/* Remaining Budget Card */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-colors">
                  <div className={`p-2 rounded-lg ${data.partition.remainingBudget > 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {t('partitionDetails.remaining_budget', 'Remaining Budget')}
                    </p>
                    <p className={`text-sm font-bold ${data.partition.remainingBudget > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      {formatCurrency(data.partition.remainingBudget, currentLocale)}
                    </p>
                  </div>
                </div>

                {/* Validated Engagements Card */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {t('partitionDetails.validated_engagements', 'Validated Engagements')}
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.stats.engagements.validated}</p>
                  </div>
                </div>

                {/* Pending Payments Card */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <List className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {t('partitionDetails.pending_payments', 'Pending Payments')}
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.stats.payments.pending}</p>
                  </div>
                </div>

                {/* Validated Payments Card */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-colors">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {t('partitionDetails.validated_payments', 'Validated Payments')}
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.stats.payments.validated}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section - Full width responsive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full">

                {/* Engagement Chart */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    {t('partitionDetails.engagementStatus', 'Engagement Status')}
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={engagementChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          width={25}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{
                            borderRadius: '6px',
                            border: 'none',
                            boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#1e293b',
                            color: '#f1f5f9',
                            fontSize: '10px',
                            padding: '4px 8px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: '10px',
                            paddingTop: '8px'
                          }}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => {
                            return value === 'Validated'
                              ? t('budget.statusLabels.validated', 'Validated')
                              : t('budget.statusLabels.pending', 'Pending');
                          }}
                        />
                        <Bar
                          dataKey="Validated"
                          fill="#10b981"
                          radius={[2, 2, 0, 0]}
                          barSize={30}
                        />
                        <Bar
                          dataKey="Pending"
                          fill="#f59e0b"
                          radius={[2, 2, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payment Chart */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    {t('partitionDetails.paymentStatus', 'Payment Status')}
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={paymentChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          width={25}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{
                            borderRadius: '6px',
                            border: 'none',
                            boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#1e293b',
                            color: '#f1f5f9',
                            fontSize: '10px',
                            padding: '4px 8px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: '10px',
                            paddingTop: '8px'
                          }}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => {
                            return value === 'Validated'
                              ? t('budget.statusLabels.validated', 'Validated')
                              : t('budget.statusLabels.pending', 'Pending');
                          }}
                        />
                        <Bar
                          dataKey="Validated"
                          fill="#3b82f6"
                          radius={[2, 2, 0, 0]}
                          barSize={30}
                        />
                        <Bar
                          dataKey="Pending"
                          fill="#f59e0b"
                          radius={[2, 2, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Budget Timeline Chart */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    {t('partitionDetails.budgetEvolution', 'Budget Evolution')}
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timelineData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                        <XAxis
                          dataKey="id"
                          tickFormatter={(value) => timelineData[value]?.displayDate || ''}
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          width={30}
                          domain={[0, data?.partition?.budget || 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '6px',
                            border: 'none',
                            boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#1e293b',
                            color: '#f1f5f9',
                            fontSize: '10px',
                            padding: '8px 12px'
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const dataPoint = payload[0].payload;
                              return (
                                <div style={{
                                  backgroundColor: '#1e293b',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                                  fontSize: '10px'
                                }}>
                                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#f1f5f9' }}>
                                    {t('partitionDetails.date', 'Date')}: {dataPoint.displayDate}
                                  </p>
                                  {dataPoint.amountReduced > 0 && (
                                    <>
                                      <p style={{ margin: '2px 0', color: '#fca5a5' }}>
                                        {t('partitionDetails.deducted_amount', 'Deducted Amount')}: -{formatCurrency(dataPoint.amountReduced, currentLocale)}
                                      </p>
                                      {dataPoint.reference && (
                                        <p style={{ margin: '2px 0', color: '#94a3b8', fontSize: '9px' }}>
                                          {t('partitionDetails.engagement_reference', 'Reference')}: {dataPoint.reference}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="remainingBudget"
                          name={t('partitionDetails.remaining_budget', 'Remaining Budget')}
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 1.5, r: 4 }}
                          activeDot={{ r: 5, fill: '#a78bfa' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Engagements Table - Full width with horizontal scroll on small screens */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors w-full">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t('partitionDetails.engagementsList', 'Engagements History')}
                  </h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('partitionDetails.engagement_reference', 'Reference')}
                        </th>
                        <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('partitionDetails.date', 'Date')}
                        </th>
                        <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                          {t('partitionDetails.amount', 'Amount')}
                        </th>
                        <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('partitionDetails.description', 'Description')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.engagements.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-500 dark:text-slate-400 italic text-xs">
                            {t('partitionDetails.noEngagements', 'No engagements found for this partition.')}
                          </td>
                        </tr>
                      ) : (
                        data.engagements.map((eng, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {eng.reference || '-'}
                            </td>
                            <td className="py-2 px-3 text-xs text-slate-600 dark:text-slate-400">
                              {formatDate(eng.date)}
                            </td>
                            <td className="py-2 px-3 text-xs font-semibold text-right text-slate-800 dark:text-slate-200">
                              {formatCurrency(eng.amount, currentLocale)}
                            </td>
                            <td className="py-2 px-3 text-xs text-slate-600 dark:text-slate-400 break-words">
                              {eng.description || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartitionDetails;