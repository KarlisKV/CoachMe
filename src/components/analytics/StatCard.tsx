interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}
