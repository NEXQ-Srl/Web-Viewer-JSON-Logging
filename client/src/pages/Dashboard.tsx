import React, { useEffect, useState, useCallback, useRef } from "react";
import LogsTable from "../components/logs/LogsTable";
import LogsChart from "../components/logs/LogsChart";
import LogsFilter from "../components/logs/LogsFilter";
import { fetchPaginatedLogs } from "../services/logService";
import { LogEntry, ChartDataItem } from "../types";
import { subDays } from 'date-fns'; 

interface ChartFilter {
  hour?: string;
  date?: string;
  level: string;
}

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState<string>(""); 
  const [currentSearchInput, setCurrentSearchInput] = useState<string>(""); 
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);  const [isLoading, setIsLoading] = useState<boolean>(false);  
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartViewMode, setChartViewMode] = useState<'hour' | 'day'>('hour');
  const lastLoadedPageRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const [chartFilter, setChartFilter] = useState<ChartFilter | null>(null); 
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 1)); 
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); 

  const loadLogs = useCallback(
    async (reset: boolean = true): Promise<void> => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);

      try {        const pageToFetch = reset ? 1 : lastLoadedPageRef.current + 1;

        if (!reset && pageToFetch > totalPages && totalPages > 0) {
          setHasMore(false);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        const { logs: newLogs, total, totalPages: pages, audit } = await fetchPaginatedLogs(
          pageToFetch,
          rowsPerPage,
          { search, levelFilter, startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }
        );        setTotalLogs(total);
        setTotalPages(pages);
        setHasMore(pageToFetch < pages);
        
        if (startDate && endDate) {
          const diffInDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffInDays > 1) {
            setChartViewMode('day');
            setChartData(audit.byDay);
          } else {
            setChartViewMode('hour');
            setChartData(audit.byHour);
          }
        } else {
          setChartViewMode('hour');
          setChartData(audit.byHour);
        }

        if (reset) {
          setLogs(newLogs);
          lastLoadedPageRef.current = newLogs.length > 0 ? 1 : 0; 
        } else if (newLogs.length > 0) {
          setLogs(prev => [...prev, ...newLogs]);
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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowsPerPage, search, levelFilter, startDate, endDate] 
  );

  useEffect(() => {
    lastLoadedPageRef.current = 0;
    setLogs([]);
    loadLogs(true);
    const interval = setInterval(() => loadLogs(true), 30000);
    return () => clearInterval(interval);
  }, [rowsPerPage, loadLogs]);

  const loadMoreLogs = useCallback(() => {
    if (isLoading || !hasMore) {
      return;
    }
    loadLogs(false);  }, [loadLogs, isLoading, hasMore]);

  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(currentSearchInput);
    setChartFilter(null); 
  };

  const handleChartSegmentClick = useCallback((filter: ChartFilter | null) => {
    setChartFilter(current => {
      if (current && filter && current.hour === filter.hour && current.level === filter.level) {
        return null;
      }
      return filter;
    });
  }, []);
  const displayedLogs = React.useMemo(() => {
    if (!chartFilter) {
      return logs; 
    }
    return logs.filter(log => {
      try {
        const logDate = new Date(log["@timestamp"]);
        if (isNaN(logDate.getTime())) return false;
        
        if (chartFilter.hour !== undefined) {
          const logHour = logDate.getHours().toString().padStart(2, "0");
          const logLevel = log.level?.toLowerCase();
          return logHour === chartFilter.hour && logLevel === chartFilter.level.toLowerCase();
        } else if (chartFilter.date !== undefined) {
          const year = logDate.getFullYear();
          const month = (logDate.getMonth() + 1).toString().padStart(2, "0");
          const day = logDate.getDate().toString().padStart(2, "0");
          const logDateStr = `${year}-${month}-${day}`;
          const logLevel = log.level?.toLowerCase();
          
          return logDateStr === chartFilter.date && logLevel === chartFilter.level.toLowerCase();
        }
        
        return false;
      } catch (error) {
        console.error("Error filtering log by chart selection:", error);
        return false;
      }
    });
  }, [logs, chartFilter]);

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
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
       
      </form>      {chartFilter && (
        <div className="my-2 flex items-center">
          <span className="text-sm mr-2">
            Chart filter active: 
            {chartFilter.hour ? ` Hour ${chartFilter.hour}` : 
             chartFilter.date ? ` Date ${new Date(chartFilter.date).toLocaleDateString()}` : ''}, 
            Level {chartFilter.level}
          </span>
          <button 
            onClick={() => setChartFilter(null)} 
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Chart Filter
          </button>
        </div>
      )}

      <div className="flex items-end justify-between mb-4">        <div className="font-medium">
          Showing {displayedLogs.length} of {totalLogs} logs (filtered from {logs.length} loaded logs)
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Chart View: <span className="font-medium capitalize">{chartViewMode}</span>
          </span>
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
            <option value={50}>50</option>            <option value={100}>100</option>
          </select>
          </div>
        </div>
      </div>

      <LogsChart
        chartData={chartData} 
        onSegmentClick={handleChartSegmentClick} 
        viewMode={chartViewMode}
      />

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
