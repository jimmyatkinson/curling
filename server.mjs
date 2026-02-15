import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static frontend (index.html, etc.)
app.use(express.static("."));
app.use(express.json());

const WORLD_CURLING_BASE =
  "https://livescores.worldcurling.org/og/aspnet/standingsall.aspx";
const WORLD_CURLING_GAMES =
  "https://livescores.worldcurling.org/og/aspnet/games.aspx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SMACK_POSTS_FILE = path.join(__dirname, "smack-posts.json");

/**
 * Fetch and parse a standings table from World Curling.
 * eventId: 1 = Men, 2 = Women (per site nav).
 */
async function fetchStandingsForEvent(eventId) {
  const url = `${WORLD_CURLING_BASE}?EventID=${eventId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "FantasyOlympicCurling/1.0 (+for personal, low-volume use; contact site owner if needed)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.error(
        `World Curling HTTP ${res.status} for EventID=${eventId} at ${url}`
      );
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let targetTable;
    $("table").each((_, table) => {
      const headerText = $(table).text().toLowerCase();
      if (
        headerText.includes("rank") &&
        headerText.includes("team") &&
        headerText.includes("wins") &&
        headerText.includes("losses")
      ) {
        targetTable = table;
        return false;
      }
      return true;
    });

    if (!targetTable) {
      console.error(
        `Could not locate standings table for EventID=${eventId} at ${url}`
      );
      return [];
    }

    const rows = [];
    const $table = $(targetTable);

    $table.find("tr").each((rowIndex, tr) => {
      if (rowIndex === 0) return;

      const $row = $(tr);
      const team = $row
        .find("a[href*='teamDetail']")
        .first()
        .text()
        .trim();
      if (!team) return;

      const nums = [];
      $row.find("td").each((_, td) => {
        const cellText = $(td).text().trim();
        if (/^\d+$/.test(cellText)) {
          nums.push(Number.parseInt(cellText, 10));
        }
      });

      if (nums.length < 4) {
        rows.push({ team, games: 0, wins: 0, losses: 0 });
        return;
      }

      const [, games, wins, losses] = nums;
      rows.push({ team, games: games ?? 0, wins: wins ?? 0, losses: losses ?? 0 });
    });

    return rows;
  } catch (err) {
    console.error(
      `Error fetching/parsing World Curling standings for EventID=${eventId} at ${url}:`,
      err
    );
    return [];
  }
}

function normalizeUtcDateTime(rawDate, rawTime) {
  const dateText = (rawDate || "").trim();
  const timeText = (rawTime || "").trim();
  if (!dateText || !timeText) return null;

  const dateMatch = dateText.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;

  const day = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10);
  const yearRaw = Number.parseInt(dateMatch[3], 10);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const hours = Number.parseInt(timeMatch[1], 10);
  const minutes = Number.parseInt(timeMatch[2], 10);

  const stamp = Date.UTC(year, month - 1, day, hours, minutes, 0);
  if (Number.isNaN(stamp)) return null;
  return new Date(stamp).toISOString();
}

function extractCode(teamName) {
  if (!teamName) return "";
  return teamName.split("-")[0].trim().toUpperCase();
}

function looksLikeUpcomingStatus(status) {
  const value = (status || "").trim().toLowerCase();
  if (!value) return true;
  if (value.includes("final") || value.includes("finished") || value.includes("completed")) {
    return false;
  }
  return true;
}

async function fetchUpcomingGamesForEvent(eventId, label) {
  const url = `${WORLD_CURLING_GAMES}?EventID=${eventId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FantasyOlympicCurling/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      console.error(`World Curling games HTTP ${res.status} for EventID=${eventId}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const games = [];

    $("tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 6) return;

      const teamLinks = $(tr).find("a[href*='teamDetail']");
      if (teamLinks.length < 2) return;

      const teamA = $(teamLinks[0]).text().trim();
      const teamB = $(teamLinks[1]).text().trim();
      if (!teamA || !teamB) return;

      const cells = [];
      tds.each((__, td) => cells.push($(td).text().replace(/\s+/g, " ").trim()));

      const date = cells[0] || "";
      const time = cells[1] || "";
      const status = cells.find((c) => /scheduled|live|final|start|complete|finished/i.test(c)) || "";
      const startTime = normalizeUtcDateTime(date, time);

      if (!startTime || !looksLikeUpcomingStatus(status)) return;

      games.push({
        event: label,
        teamA,
        teamB,
        teamACode: extractCode(teamA),
        teamBCode: extractCode(teamB),
        startTime,
        status: status || "Scheduled",
      });
    });

    return games;
  } catch (err) {
    console.error(`Error fetching/parsing games for EventID=${eventId}:`, err);
    return [];
  }
}

async function fetchUpcomingGames() {
  const [menGames, womenGames] = await Promise.all([
    fetchUpcomingGamesForEvent(1, "Men"),
    fetchUpcomingGamesForEvent(2, "Women"),
  ]);

  const all = [...menGames, ...womenGames]
    .filter((game) => Date.parse(game.startTime) >= Date.now() - 30 * 60 * 1000)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

  return all;
}

let smackPosts = [];
let smackPostId = 1;

async function loadSmackPostsFromDisk() {
  try {
    const raw = await fs.readFile(SMACK_POSTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    smackPosts = parsed.filter((post) => typeof post?.message === "string");
    const maxId = smackPosts.reduce(
      (acc, post) => (typeof post.id === "number" && post.id > acc ? post.id : acc),
      0
    );
    smackPostId = maxId + 1;
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed to load smack posts from disk:", err);
    }
  }
}

async function saveSmackPostsToDisk() {
  try {
    await fs.writeFile(SMACK_POSTS_FILE, JSON.stringify(smackPosts, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist smack posts:", err);
  }
}

app.get("/api/smack", (req, res) => {
  res.json({ posts: smackPosts });
});

app.post("/api/smack", async (req, res) => {
  const nameRaw = typeof req.body?.name === "string" ? req.body.name : "Anonymous";
  const messageRaw = typeof req.body?.message === "string" ? req.body.message : "";

  const name = nameRaw.trim().slice(0, 40) || "Anonymous";
  const message = messageRaw.trim().slice(0, 300);

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const post = {
    id: smackPostId++,
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  smackPosts.unshift(post);
  try {
    await saveSmackPostsToDisk();
  } catch (err) {
    console.error("Failed to persist smack posts:", err);
  }

  return res.status(201).json({ post });
});

let cache = {
  men: null,
  women: null,
  upcoming: null,
  updatedAt: null,
};

let lastFetchTime = 0;
const MIN_FETCH_INTERVAL_MS = 30 * 1000;

app.get("/api/standings", async (req, res) => {
  try {
    const now = Date.now();

    if (
      cache.men &&
      cache.women &&
      cache.upcoming &&
      now - lastFetchTime < MIN_FETCH_INTERVAL_MS
    ) {
      return res.json(cache);
    }

    const [men, women, upcoming] = await Promise.all([
      fetchStandingsForEvent(1),
      fetchStandingsForEvent(2),
      fetchUpcomingGames(),
    ]);

    cache = {
      men,
      women,
      upcoming,
      updatedAt: new Date().toISOString(),
    };
    lastFetchTime = now;

    return res.json(cache);
  } catch (err) {
    console.error("Error fetching standings from World Curling:", err);
    return res.status(500).json({
      error: "Failed to fetch standings from World Curling.",
      detail: err.message,
    });
  }
});

await loadSmackPostsFromDisk();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
