import React, { useRef, useEffect } from 'react';
import { formatTimestamp } from '../../services/logService';
import { LogEntry } from '../../types';
import { formatTimeAgo } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LogsTableProps {
  logs: LogEntry[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  maxHeight?: string;
}

const LogLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const getStyles = () => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-300 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-300 dark:border-blue-800';
      case 'debug':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-300 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs border ${getStyles()}`}>
      {level}
    </span>
  );
};

const LogsTable: React.FC<LogsTableProps> = ({ 
  logs, 
  onLoadMore,
  hasMore,
  isLoading,
  maxHeight = '50vh'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "50px",
        threshold: 0,
      }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="relative rounded-md border">
      <div 
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            <tr className="text-left [&>th]:p-3 border-b">
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
              <th>Correlation ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-muted/40 transition-colors">
                <td className="p-3">
                  <div className="flex flex-col">
                    <span>{formatTimestamp(log["@timestamp"])}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(log["@timestamp"])}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <LogLevelBadge level={log.level} />
                </td>
                <td className="p-3 max-w-lg truncate">{log.message}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{log.correlationId || "-"}</td>
              </tr>
            ))}
            
            {isLoading && (
              <tr>
                <td colSpan={4}>
                  <div className="flex justify-center items-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading more logs...</span>
                  </div>
                </td>
              </tr>
            )}
            
            {hasMore && !isLoading && (
              <tr>
                <td colSpan={4}>
                  <button 
                    className="w-full py-3 text-center text-sm text-blue-500 hover:underline"
                    onClick={() => !isLoading && hasMore && onLoadMore()}
                  >
                    Load more logs
                  </button>
                </td>
              </tr>
            )}
            
            {!hasMore && logs.length > 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  End of logs
                </td>
              </tr>
            )}
            
            {logs.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No logs found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div ref={sentinelRef} style={{ height: '1px' }} />
      </div>
    </div>
  );
};

export default LogsTable;
