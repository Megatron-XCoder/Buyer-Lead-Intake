import type { BuyerHistory, User } from "@prisma/client";
import { Clock } from "lucide-react";

interface BuyerHistoryProps {
  histories: (BuyerHistory & { user: User })[];
}

export default function BuyerHistory({ histories }: BuyerHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDiff = (diffString: string) => {
    try {
      const diff = JSON.parse(diffString);
      
      if (diff.action === "created") {
        return "Lead created";
      }
      
      return Object.entries(diff).map(([field, change]: [string, any]) => {
        if (typeof change === "object" && change.old !== undefined && change.new !== undefined) {
          return `${field}: "${change.old}" → "${change.new}"`;
        }
        return `${field} updated`;
      }).join(", ");
    } catch {
      return "Updated";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Changes</h3>
      
      {histories.length === 0 ? (
        <p className="text-gray-500 text-sm">No changes recorded</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {histories.map((history, index) => (
              <li key={history.id}>
                <div className="relative pb-8">
                  {index !== histories.length - 1 && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <Clock className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDiff(history.diff)}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {history.user.name || history.user.email}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-xs text-gray-500">
                        <time>{formatDate(history.changedAt)}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}