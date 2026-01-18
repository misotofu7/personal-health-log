"use client";

export const StatsCard = ({ title, value, subtitle, icon, gradient }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${gradient || "bg-gradient-to-br from-blue-500 to-purple-500"}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};
