import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static frontend (index.html, etc.)
app.use(express.static("."));

const WORLD_CURLING_BASE =
  "https://livescores.worldcurling.org/og/aspnet/standingsall.aspx";

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

    // Heuristic: find the first table that has a header row containing "Rank" and "Team" and "Wins" and "Losses"
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
        return false; // break
      }
    });

    if (!targetTable) {
      console.error(
        `Could not locate standings table for EventID=${eventId} at ${url}`
      );
      return [];
    }

    const rows = [];
    const $table = $(targetTable);

    // Assume first row is header; parse subsequent rows
    $table.find("tr").each((rowIndex, tr) => {
      // Skip header
      if (rowIndex === 0) return;

      const $row = $(tr);

      // Team name from the team detail link (e.g. "CAN - Canada")
      const team = $row
        .find("a[href*='teamDetail']")
        .first()
        .text()
        .trim();
      if (!team) return;

      // Extract integer-only cell values from this row.
      // We intentionally look at each <td> separately and only keep cells whose
      // text is a plain integer (no decimals or hyphens). This avoids pulling
      // in per-end scores or LSD values that previously polluted wins/losses.
      const nums = [];
      $row.find("td").each((_, td) => {
        const cellText = $(td).text().trim();
        if (/^\d+$/.test(cellText)) {
          nums.push(Number.parseInt(cellText, 10));
        }
      });

      // Expect at least: rank, games, wins, losses.
      if (nums.length < 4) {
        rows.push({
          team,
          games: 0,
          wins: 0,
          losses: 0,
        });
        return;
      }

      // First number is rank, next three are games / wins / losses.
      const [, games, wins, losses] = nums;

      rows.push({
        team,
        games: games ?? 0,
        wins: wins ?? 0,
        losses: losses ?? 0,
      });
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

// Simple in-memory cache to avoid hammering World Curling.
let cache = {
  men: null,
  women: null,
  updatedAt: null,
};

let lastFetchTime = 0;
const MIN_FETCH_INTERVAL_MS = 30 * 1000; // 30 seconds

app.get("/api/standings", async (req, res) => {
  try {
    const now = Date.now();

    // Basic throttle + cache
    if (cache.men && cache.women && now - lastFetchTime < MIN_FETCH_INTERVAL_MS) {
      return res.json(cache);
    }

    const [men, women] = await Promise.all([
      fetchStandingsForEvent(1), // Men
      fetchStandingsForEvent(2), // Women
    ]);

    cache = {
      men,
      women,
      updatedAt: new Date().toISOString(),
    };
    lastFetchTime = now;

    res.json(cache);
  } catch (err) {
    console.error("Error fetching standings from World Curling:", err);
    res.status(500).json({
      error: "Failed to fetch standings from World Curling.",
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

