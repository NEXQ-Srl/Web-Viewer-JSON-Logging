import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchLogs = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    fetch(`${apiUrl}/logs`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b["@timestamp"]) - new Date(a["@timestamp"])
        );
        setLogs(sorted);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((err) => console.error("Error loading logs:", err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtered = logs.filter((log) => {
    const matchesSearch = JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedLogs = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const hourlyGrouped = {};
  filtered.forEach((log) => {
    const date = new Date(log["@timestamp"]);
    const hour = date.getHours().toString().padStart(2, "0");
    const level = log.level || "unknown";

    if (!hourlyGrouped[hour]) {
      hourlyGrouped[hour] = { hour };
    }

    hourlyGrouped[hour][level] = (hourlyGrouped[hour][level] || 0) + 1;
  });

  const chartData = Object.values(hourlyGrouped).sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="p-6 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Log Viewer</h2>
        <div className="flex gap-2 items-center">
          <span className="text-xs opacity-70">Last updated: {lastUpdated}</span>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 flex-col md:flex-row">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full md:w-1/2 dark:bg-gray-800 dark:border-gray-700"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="p-2 border rounded w-full md:w-1/4 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      <div className="mb-8 p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 select-none">
        <h3 className="text-lg font-semibold mb-2">Log Counts by Hour and Level</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} cursor={{ fill: 'transparent' }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={false} />
            <Legend />
            <Bar dataKey="info" stackId="a" fill="#3b82f6" activeBar={false} />
            <Bar dataKey="error" stackId="a" fill="#ef4444" activeBar={false} />
            <Bar dataKey="warn" stackId="a" fill="#facc15" activeBar={false} />
            <Bar dataKey="debug" stackId="a" fill="#10b981" activeBar={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-auto rounded-xl border dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="p-2">Timestamp</th>
              <th className="p-2">Level</th>
              <th className="p-2">Message</th>
              <th className="p-2">Correlation ID</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, index) => (
              <tr key={index} className="border-t dark:border-gray-700">
                <td className="p-2">{formatTimestamp(log["@timestamp"])}</td>
                <td className="p-2">{log.level}</td>
                <td className="p-2">{log.message}</td>
                <td className="p-2">{log.correlationId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-4 gap-4 text-sm">
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
          <option value={50}>50 rows</option>
        </select>

        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
        >
          ← Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default App;
