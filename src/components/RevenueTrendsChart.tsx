import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Applicant, LanguageMode } from '../types';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

interface RevenueTrendsChartProps {
  lang: LanguageMode;
  applicants: Applicant[];
  onSelectDate?: (date: string) => void;
}

interface DailyDataPoint {
  dateKey: string; // YYYY-MM-DD
  displayDate: string;
  dayName: string;
  weekLabel: string;
  dailyRevenue: number;
  cumulativeRevenue: number;
  applicantsCompletedCount: number;
  applicantNames: string[];
}

export const RevenueTrendsChart: React.FC<RevenueTrendsChartProps> = ({
  lang,
  applicants,
  onSelectDate,
}) => {
  const [chartType, setChartType] = useState<'composed' | 'bar' | 'cumulative'>('composed');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  // Process applicants into daily earnings based on completion date
  const { chartData, weeklySummaries, stats } = useMemo(() => {
    // Collect all applicants who have paid / completed
    const dateMap = new Map<
      string,
      { revenue: number; count: number; names: string[] }
    >();

    // Determine completion date for each applicant
    applicants.forEach((app) => {
      // An applicant generates revenue upon completion/payment
      if (app.amountPaid <= 0) return;

      // Completion date priority: completionDate -> applicationDate -> fallback
      let date = app.completionDate || app.applicationDate;
      if (!date || date.trim() === '') {
        date = '2024-08-15'; // Default fallback for unrecorded date
      }

      const existing = dateMap.get(date) || { revenue: 0, count: 0, names: [] };
      existing.revenue += app.amountPaid;
      existing.count += 1;
      existing.names.push(app.nameEn);
      dateMap.set(date, existing);
    });

    // Sort all dates chronologically
    const sortedDates = Array.from(dateMap.keys()).sort();

    let runningTotal = 0;
    const allData: DailyDataPoint[] = [];

    const weekBuckets: Record<
      string,
      { label: string; labelMr: string; totalRevenue: number; count: number }
    > = {
      W1: { label: 'Week 1 (Aug 1 - 7)', labelMr: 'आठवडा १ (१-७ ऑगस्ट)', totalRevenue: 0, count: 0 },
      W2: { label: 'Week 2 (Aug 8 - 14)', labelMr: 'आठवडा २ (८-१४ ऑगस्ट)', totalRevenue: 0, count: 0 },
      W3: { label: 'Week 3 (Aug 15 - 21)', labelMr: 'आठवडा ३ (१५-२१ ऑगस्ट)', totalRevenue: 0, count: 0 },
      W4: { label: 'Week 4 (Aug 22 - 28)', labelMr: 'आठवडा ४ (२२-२८ ऑगस्ट)', totalRevenue: 0, count: 0 },
      W5: { label: 'Week 5 (Aug 29 - Sep 2)', labelMr: 'आठवडा ५ (२९ ऑगस्ट - २ सप्टेंबर)', totalRevenue: 0, count: 0 },
    };

    sortedDates.forEach((dateStr) => {
      const item = dateMap.get(dateStr)!;
      runningTotal += item.revenue;

      const dateObj = new Date(dateStr);
      const day = dateObj.getDate();
      const monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
      const dayName = dateObj.toLocaleString('en-US', { weekday: 'short' });

      // Determine week bucket
      let weekKey = 'W1';
      if (day <= 7) weekKey = 'W1';
      else if (day <= 14) weekKey = 'W2';
      else if (day <= 21) weekKey = 'W3';
      else if (day <= 28) weekKey = 'W4';
      else weekKey = 'W5';

      if (weekBuckets[weekKey]) {
        weekBuckets[weekKey].totalRevenue += item.revenue;
        weekBuckets[weekKey].count += item.count;
      }

      allData.push({
        dateKey: dateStr,
        displayDate: `${day} ${monthShort}`,
        dayName,
        weekLabel: weekKey,
        dailyRevenue: item.revenue,
        cumulativeRevenue: runningTotal,
        applicantsCompletedCount: item.count,
        applicantNames: item.names,
      });
    });

    // Compute key statistics
    const totalCollected = runningTotal;
    const peakDay = allData.reduce(
      (max, curr) => (curr.dailyRevenue > max.dailyRevenue ? curr : max),
      allData[0] || { dailyRevenue: 0, displayDate: '-' }
    );
    const activeDaysCount = allData.length;
    const avgDailyEarnings = activeDaysCount > 0 ? Math.round(totalCollected / activeDaysCount) : 0;

    return {
      chartData: allData,
      weeklySummaries: weekBuckets,
      stats: {
        totalCollected,
        peakDailyRevenue: peakDay.dailyRevenue,
        peakDate: peakDay.displayDate,
        avgDailyEarnings,
        activeDaysCount,
      },
    };
  }, [applicants]);

  // Filter by selected week
  const filteredData = useMemo(() => {
    if (selectedWeek === 'all') return chartData;
    return chartData.filter((d) => d.weekLabel === selectedWeek);
  }, [chartData, selectedWeek]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {data.dateKey} ({data.dayName})
              </span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
              {data.weekLabel}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {lang === 'en' ? 'Daily Earnings:' : 'दैनिक कमाई:'}
              </span>
              <strong className="font-mono text-emerald-400 text-sm">
                ₹{data.dailyRevenue.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {lang === 'en' ? 'Completed Applicants:' : 'पूर्ण झालेले अर्जदार:'}
              </span>
              <strong className="font-mono text-white">
                {data.applicantsCompletedCount}
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">
                {lang === 'en' ? 'Cumulative Revenue:' : 'एकूण संचित रक्कम:'}
              </span>
              <strong className="font-mono text-cyan-300">
                ₹{data.cumulativeRevenue.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {data.applicantNames.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-0.5">
                {lang === 'en' ? 'Completed Clients:' : 'ग्राहक:'}
              </span>
              <div className="truncate max-w-[200px]">
                {data.applicantNames.slice(0, 3).join(', ')}
                {data.applicantNames.length > 3 && ` +${data.applicantNames.length - 3} more`}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Chart Section Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'en'
                ? 'Weekly Revenue Trends'
                : lang === 'mr'
                ? 'साप्ताहिक उत्पन्न कल व दैनिक कमाई'
                : 'Weekly Revenue Trends / साप्ताहिक उत्पन्न कल'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'en'
              ? 'Visualizing daily earnings based on applicant completion dates and fee collection.'
              : 'अर्जदार पूर्णता तारखेनुसार दैनिक व साप्ताहिक कमाईचे थेट विश्लेषण.'}
          </p>
        </div>

        {/* Chart View & Type Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector Dropdown / Pills */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSelectedWeek('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'All Weeks' : 'सर्व आठवडे'}
            </button>
            <button
              onClick={() => setSelectedWeek('W1')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'W1'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              W1
            </button>
            <button
              onClick={() => setSelectedWeek('W2')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'W2'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              W2
            </button>
            <button
              onClick={() => setSelectedWeek('W3')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'W3'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              W3
            </button>
            <button
              onClick={() => setSelectedWeek('W4')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'W4'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              W4
            </button>
            <button
              onClick={() => setSelectedWeek('W5')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                selectedWeek === 'W5'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              W5
            </button>
          </div>

          {/* Chart Display Mode */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setChartType('composed')}
              title="Daily Bar + Area Trend"
              className={`p-1.5 rounded transition-colors ${
                chartType === 'composed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Daily Bars"
              className={`p-1.5 rounded transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('cumulative')}
              title="Cumulative Growth"
              className={`p-1.5 rounded transition-colors ${
                chartType === 'cumulative'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-200 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'en' ? 'Total Period Earnings' : 'कालावधीतील एकूण जमा'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            48 {lang === 'en' ? 'completed payments' : 'पूर्ण पावत्या'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'en' ? 'Peak Daily Revenue' : 'सर्वोच्च दैनिक कमाई'}
          </span>
          <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            ₹{stats.peakDailyRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {stats.peakDate} {lang === 'en' ? 'record collection' : 'विक्रमी संकलन'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'en' ? 'Daily Average Earnings' : 'दैनिक सरासरी संकलन'}
          </span>
          <span className="text-lg font-bold font-mono text-indigo-700 tabular-nums">
            ₹{stats.avgDailyEarnings.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {lang === 'en' ? 'Across active delivery days' : 'सक्रिय दिवसांची सरासरी'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block uppercase font-medium">
            {lang === 'en' ? 'Selected Scope' : 'निवडलेला कालावधी'}
          </span>
          <span className="text-lg font-bold text-slate-900">
            {selectedWeek === 'all'
              ? 'All 5 Weeks'
              : weeklySummaries[selectedWeek]?.label || selectedWeek}
          </span>
          <span className="text-[11px] text-emerald-700 font-mono font-semibold block mt-0.5">
            ₹
            {(selectedWeek === 'all'
              ? stats.totalCollected
              : weeklySummaries[selectedWeek]?.totalRevenue || 0
            ).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'cumulative' ? (
              <ComposedChart
                data={filteredData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'cumulativeRevenue'
                        ? lang === 'en'
                          ? 'Cumulative Revenue (₹)'
                          : 'संचित एकूण उत्पन्न (₹)'
                        : value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                  name="cumulativeRevenue"
                />
              </ComposedChart>
            ) : chartType === 'bar' ? (
              <ComposedChart
                data={filteredData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'dailyRevenue'
                        ? lang === 'en'
                          ? 'Daily Earnings (₹)'
                          : 'दैनिक संकलन (₹)'
                        : value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="dailyRevenue"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  name="dailyRevenue"
                  cursor="pointer"
                  onClick={(entry: any) => {
                    const date = entry?.payload?.dateKey || entry?.dateKey;
                    if (onSelectDate && date) onSelectDate(date);
                  }}
                />
              </ComposedChart>
            ) : (
              /* Composed: Daily Bars + Area Trendline */
              <ComposedChart
                data={filteredData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'dailyRevenue'
                        ? lang === 'en'
                          ? 'Daily Earnings (₹)'
                          : 'दैनिक संकलन (₹)'
                        : value === 'cumulativeRevenue'
                        ? lang === 'en'
                          ? 'Cumulative Growth (₹)'
                          : 'संचित उत्पन्न (₹)'
                        : value}
                    </span>
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="dailyRevenue"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  name="dailyRevenue"
                  cursor="pointer"
                  onClick={(entry: any) => {
                    const date = entry?.payload?.dateKey || entry?.dateKey;
                    if (onSelectDate && date) onSelectDate(date);
                  }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#0284c7' }}
                  name="cumulativeRevenue"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Weekly Breakdown Cards Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(weeklySummaries).map(([key, item]) => {
            const isSelected = selectedWeek === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedWeek(selectedWeek === key ? 'all' : key)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {key}
                  </span>
                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.count} {lang === 'en' ? 'clients' : 'अर्जदार'}
                  </span>
                </div>
                <div
                  className={`text-xs font-mono font-bold ${
                    isSelected ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  ₹{item.totalRevenue.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
