const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());

function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLogFilePath() {
  const folderPath = path.resolve(__dirname, "../../", process.env.LOG_FOLDER_PATH);
  const dateStr = getTodayDateString();

  let fileName;
  if (process.env.LOG_TYPE === "json") {
    fileName = `app-${dateStr}.log`;
  } else if (process.env.LOG_TYPE === "plain") {
    fileName = `logNova.${dateStr}.log`;
  } else {
    throw new Error("❌ Tipo di log non supportato. Usa 'json' o 'plain'.");
  }

  const fullPath = path.join(folderPath, fileName);
  console.log("📄 Tipo di log:", process.env.LOG_TYPE);
  console.log("📂 Cartella logs:", folderPath);
  console.log("📄 File atteso:", fullPath);
  return fullPath;
}

function parseLogData(data) {
  if (process.env.LOG_TYPE === "json") {
    return data
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn("❌ JSON non valido:", line);
          return null;
        }
      })
      .filter(Boolean);
  } else if (process.env.LOG_TYPE === "plain") {
    return data
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        console.log("🔍 Riga grezza:", line);

        // parsing manuale tra parentesi quadre
        const timestampStart = line.indexOf("[") + 1;
        const timestampEnd = line.indexOf("]");
        const timestamp = line.slice(timestampStart, timestampEnd);

        const levelStart = line.indexOf("[", timestampEnd) + 1;
        const levelEnd = line.indexOf("]", levelStart);
        const level = line.slice(levelStart, levelEnd);

        const moduleStart = line.indexOf("[", levelEnd) + 1;
        const moduleEnd = line.indexOf("]", moduleStart);
        const module = line.slice(moduleStart, moduleEnd);

        const contextStart = line.indexOf("[", moduleEnd) + 1;
        const contextEnd = line.indexOf("]", contextStart);
        const context = line.slice(contextStart, contextEnd);

        const message = line.slice(contextEnd + 2).trim();

        if (!timestamp || !level || !module || !context || !message) {
          console.warn("❌ Riga incompleta:", line);
          return null;
        }

        return {
          "@timestamp": timestamp,
          level: level.toLowerCase(),
          module,
          context,
          message,
          correlationId: null
        };
      })
      .filter(Boolean);
  } else {
    console.error("❌ Tipo di log non supportato:", process.env.LOG_TYPE);
    return [];
  }
}



app.get("/api/logs", (req, res) => {
  const filePath = getLogFilePath();

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Errore nella lettura del file:", err.message);
      return res.status(404).json({ error: "File non trovato o errore di lettura" });
    }

    const parsedLogs = parseLogData(data);
    res.json(parsedLogs);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
