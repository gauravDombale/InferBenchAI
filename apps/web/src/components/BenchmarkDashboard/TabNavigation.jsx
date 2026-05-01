import { BarChart2, TrendingUp, Table as TableIcon } from "lucide-react";

export function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: "metrics",
      label: "Performance Charts",
      icon: <BarChart2 size={16} />,
    },
    { id: "stats", label: "Stats & P50/P95", icon: <TrendingUp size={16} /> },
    { id: "results", label: "Raw Data", icon: <TableIcon size={16} /> },
  ];

  return (
    <div className="flex gap-2 border-b border-white/8 pb-4 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === t.id
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
