const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config(); // cerca automaticamente il file .env nella root del progetto

const app = express();
const PORT = 5000;

app.use(cors());

function getTodayLogFilename() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `app-${yyyy}-${mm}-${dd}.log`;
}

app.get("/api/logs", (req, res) => {
  const folderPath = path.resolve(__dirname, "../../", process.env.LOG_FOLDER_PATH);
  const filePath = path.join(folderPath, getTodayLogFilename());

  console.log("📂 Cartella logs:", folderPath);
  console.log("📄 File atteso:", filePath);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "File non trovato o errore di lettura" });
    }

    const lines = data
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    res.json(lines);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
