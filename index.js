// index.js
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { AbortController } from "abort-controller"; // <-- Add this line if needed

dotenv.config();

const API_KEY = process.env.API_KEY;
const CACHE_FILE = "cache.json";

// Utility: Load cache
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return { headlines: [], everything: [] };
  return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
}

// Utility: Save Cache
function saveCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

// Fetch with Error Handling
async function safeFetch(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Invalid response: " + res.status);

    const json = await res.json();
    if (!json.articles) throw new Error("Malformed response (missing articles field)");

    return json.articles;

  } catch (err) {
    console.error("Fetch Error:", err.message);
    return null;
  }
}

// Fetch news from two endpoints
async function fetchNews() {
  console.log("Fetching data from NewsAPI...");

  const headlinesUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
  const everythingUrl = `https://newsapi.org/v2/everything?q=technology&apiKey=${API_KEY}`;

  const headlines = await safeFetch(headlinesUrl);
  const everything = await safeFetch(everythingUrl);

  if (!headlines || !everything) {
    console.log("Using cached data (API failed).");
    return loadCache();
  }

  const cache = { headlines, everything };
  saveCache(cache);
  return cache;
}

// List with filter
function listArticles(articles, filter = "") {
  console.log("\n=== Articles List ===");

  const filtered = filter
    ? articles.filter(a => a.title.toLowerCase().includes(filter.toLowerCase()))
    : articles;

  filtered.forEach((a, i) => {
    console.log(`${i + 1}. ${a.title} (${a.source.name})`);
  });
}

// View details by ID
function viewArticle(articles, id) {
  const idx = id - 1;
  if (!articles[idx]) {
    console.log("Invalid ID");
    return;
  }

  const a = articles[idx];
  console.log("\n=== Article Details ===");
  console.log("Title:", a.title);
  console.log("Author:", a.author);
  console.log("Source:", a.source.name);
  console.log("Description:", a.description);
  console.log("URL:", a.url);
  console.log("======================\n");
}

// CLI Logic
async function main() {
  const cache = await fetchNews();

  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case "list-headlines":
      listArticles(cache.headlines, param);
      break;

    case "list-tech":
      listArticles(cache.everything, param);
      break;

    case "view-headline":
      viewArticle(cache.headlines, parseInt(param));
      break;

    case "view-tech":
      viewArticle(cache.everything, parseInt(param));
      break;

    default:
      console.log(`
Commands:
  list-headlines [filter]   - List top headlines
  list-tech [filter]        - List technology news
  view-headline <id>        - Show detailed headline
  view-tech <id>            - Show detailed tech news
`);
  }
}

main();
