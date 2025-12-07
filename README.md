# News CLI

Simple command-line tool to fetch and browse news articles from NewsAPI. Grabs top US headlines and tech news, caches them locally so you can still browse even if the API is down.

## Setup

You'll need a NewsAPI key (free tier works fine). Get one at https://newsapi.org/register

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root:
```
API_KEY=your_api_key_here
```

That's it. The app will automatically cache articles to `cache.json` so you can still use it offline or when the API is having issues.

## Usage

Run commands like this:

```bash
# List all top headlines
node index.js list-headlines

# Search headlines (case-insensitive)
node index.js list-headlines election

# List tech news
node index.js list-tech

# Filter tech news
node index.js list-tech AI

# View a specific headline (use the number from the list)
node index.js view-headline 3

# View a specific tech article
node index.js view-tech 5
```

## How it works

On each run, it tries to fetch fresh data from NewsAPI. If that fails (network issues, API down, invalid key, etc.), it falls back to the cached data from `cache.json`. The cache gets updated whenever a successful fetch happens.

There's a 5-second timeout on API requests, so it won't hang forever if something's wrong.

## Notes

- Free NewsAPI tier has rate limits, so don't go crazy with requests
- The cache file (`cache.json`) gets created automatically
- If you see 401 errors, check that your API key is correct in the `.env` file
