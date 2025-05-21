import React, { useEffect, useState, useCallback, useRef } from "react";
import LogsTable from "../components/logs/LogsTable";
import LogsChart from "../components/logs/LogsChart";
import LogsFilter from "../components/logs/LogsFilter";
import { fetchPaginatedLogs } from "../services/logService";
import { LogEntry, ChartDataItem } from "../types";

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState<string>(""); 
  const [currentSearchInput, setCurrentSearchInput] = useState<string>(""); 
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const lastLoadedPageRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const loadLogs = useCallback(
    async (reset: boolean = true): Promise<void> => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);

      try {
        const pageToFetch = reset ? 1 : lastLoadedPageRef.current + 1;

        if (!reset && pageToFetch > totalPages && totalPages > 0) {
          setHasMore(false);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        const { logs: newLogs, total, totalPages: pages } = await fetchPaginatedLogs(
          pageToFetch,
          rowsPerPage,
          { search, levelFilter }
        );

        setTotalLogs(total);
        setTotalPages(pages);
        setHasMore(pageToFetch < pages);

        if (reset) {
          setLogs(newLogs);
          setDisplayedLogs(newLogs);
          lastLoadedPageRef.current = newLogs.length > 0 ? 1 : 0; 
        } else if (newLogs.length > 0) {
          setLogs(prev => [...prev, ...newLogs]);
          setDisplayedLogs(prev => [...prev, ...newLogs]);
          lastLoadedPageRef.current = pageToFetch;
        } else {
          if (!reset) setHasMore(false);
        }

        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error loading logs:", error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
        console.log("loadLogs: finally block. Set isLoading to false, isFetchingRef to false.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowsPerPage, search, levelFilter]
  );

  useEffect(() => {
    lastLoadedPageRef.current = 0;
    setLogs([]);
    setDisplayedLogs([]);
    loadLogs(true);
    const interval = setInterval(() => loadLogs(true), 30000);
    return () => clearInterval(interval);
  }, [rowsPerPage, loadLogs]);

  const loadMoreLogs = useCallback(() => {
    if (isLoading || !hasMore) {
      return;
    }
    loadLogs(false);
  }, [loadLogs, isLoading, hasMore]);

  const hourlyGrouped: Record<string, ChartDataItem> = {};
  logs.forEach((log) => {
    try {
      const date = new Date(log["@timestamp"]);
      if (isNaN(date.getTime())) return;

      const hour = date.getHours().toString().padStart(2, "0");
      const level = log.level || "unknown";

      if (!hourlyGrouped[hour]) {
        hourlyGrouped[hour] = { hour };
      }

      hourlyGrouped[hour][level] = (Number(hourlyGrouped[hour][level]) || 0) + 1;
    } catch (error) {
      console.error("Error processing log for chart:", error);
    }
  });

  const chartData = Object.values(hourlyGrouped).sort((a, b) => a.hour.localeCompare(b.hour));

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(currentSearchInput); 
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Log Viewer</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Last updated: {lastUpdated}</span>
          <button
            onClick={() => loadLogs(true)}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <LogsFilter
          search={currentSearchInput}
          setSearch={setCurrentSearchInput}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          handleSearchSubmit={handleSearchSubmit}
        />
       
      </form>

      <div className="flex items-end justify-between mb-4">
        <div className="font-medium">
          Showing {displayedLogs.length} of {totalLogs} logs
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
            }}
            className="p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <LogsChart chartData={chartData} />

      <div className="mt-4">
        <LogsTable
          logs={displayedLogs}
          onLoadMore={loadMoreLogs}
          hasMore={hasMore}
          isLoading={isLoading}
          maxHeight="60vh"
        />
      </div>
    </div>
  );
};

export default Dashboard;
