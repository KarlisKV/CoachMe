'use client';

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
}

export default function AnalyticsChart({ data, title }: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const normalizedMaxValue = maxValue === 0 ? 1 : maxValue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / normalizedMaxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
