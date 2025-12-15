import { Shield, AlertTriangle } from "lucide-react";

interface TrustBadgeProps {
  score: number;
}

export function TrustBadge({ score }: TrustBadgeProps) {
  // 80-100: High Trust (Green)
  // 50-79: Moderate Trust (Yellow)
  // 0-49: Low Trust (Red)

  if (score >= 80) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
        <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
        <span className="text-xs font-medium text-green-700 dark:text-green-300">
          High Trust
        </span>
      </div>
    );
  }

  if (score >= 50) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
        <Shield className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
          Moderate Trust
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
      <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      <span className="text-xs font-medium text-red-700 dark:text-red-300">
        Low Trust - Be Careful
      </span>
    </div>
  );
}
