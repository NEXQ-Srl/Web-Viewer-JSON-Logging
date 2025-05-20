import React, { useEffect, useState, useCallback } from "react";
import LogsTable from "../components/logs/LogsTable";
import LogsChart from "../components/logs/LogsChart";
import LogsFilter from "../components/logs/LogsFilter";
import { fetchAllLogs } from "../services/logService";
import { LogEntry, ChartDataItem } from "../types";

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const loadLogs = useCallback((): void => {
    fetchAllLogs()
      .then(data => {
        const sorted = data.sort(
          (a, b) => new Date(b["@timestamp"]).getTime() - new Date(a["@timestamp"]).getTime()
        );
        setLogs(sorted);
        setLastUpdated(new Date().toLocaleTimeString());
      });
  }, []);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => loadLogs(), 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadLogs]);

  // Apply filters when search or levelFilter changes
  useEffect(() => {
    setCurrentPage(1);
    
    const filtered = logs.filter((log) => {
      const matchesSearch = JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === "all" || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
    
    setFilteredLogs(filtered);
    setHasMore(filtered.length > rowsPerPage);
    
    // Reset to show first page
    setDisplayedLogs(filtered.slice(0, rowsPerPage));
  }, [search, levelFilter, logs, rowsPerPage]);

  // Load more logs when scrolling
  const loadMoreLogs = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const nextItems = filteredLogs.slice(0, nextPage * rowsPerPage);
      
      setDisplayedLogs(nextItems);
      setCurrentPage(nextPage);
      setHasMore(nextItems.length < filteredLogs.length);
      setIsLoading(false);
    }, 300);
  }, [currentPage, filteredLogs, hasMore, isLoading, rowsPerPage]);

  // Generate chart data
  const hourlyGrouped: Record<string, ChartDataItem> = {};
  filteredLogs.forEach((log) => {
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

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Log Viewer</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Last updated: {lastUpdated}</span>
          <button 
            onClick={() => loadLogs()} 
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <LogsFilter 
        search={search} 
        setSearch={setSearch}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
      />

      <div className="flex items-end justify-between mb-4">
        <div className="font-medium">
          Showing {displayedLogs.length} of {filteredLogs.length} logs
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
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
          maxHeight="60vh" // Set a fixed height for the table container
        />
      </div>
    </div>
  );
};

export default Dashboard;
