# youtube-analytics-cli

YouTube Analytics CLI for AI agents (and humans). Pull channel and video statistics, run analytics reports with flexible dimensions and filters, manage analytics groups, and more.

**Works with:** OpenClaw, Claude Code, Cursor, Codex, and any agent that can run shell commands.

## Installation

```bash
npm install -g youtube-analytics-cli
```

Or run directly: `npx youtube-analytics-cli --help`

## How it works

Built on the official [YouTube Data API v3](https://developers.google.com/youtube/v3) and [YouTube Analytics API v2](https://developers.google.com/youtube/analytics). Uses native `fetch` with no external dependencies beyond `commander`. Every command outputs structured JSON to stdout, ready for agents to parse without extra processing.

Core endpoints covered:

- **[Channels](https://developers.google.com/youtube/v3/docs/channels/list)** -- get channel details and statistics
- **[Videos](https://developers.google.com/youtube/v3/docs/videos/list)** -- get video details and statistics
- **[Reports](https://developers.google.com/youtube/analytics/reference/reports/query)** -- run YouTube Analytics reports (views, likes, subscribers, etc.)
- **[Groups](https://developers.google.com/youtube/analytics/reference/groups/list)** -- manage analytics groups

## Setup

### Authentication

This CLI supports two authentication methods:

| Method | Use case | Commands |
|--------|----------|----------|
| **API key** | Public data (channels, videos) | `channels <id>`, `videos` |
| **OAuth 2.0** | Private data + analytics | All commands (required for `report`, `groups`, `group-items`, `channels` without ID) |

### Option 1: API key only (public data)

For read-only access to public channel and video data:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **YouTube Data API v3**.
3. Create an API key under "Credentials".

### Option 2: OAuth 2.0 (full access)

For analytics reports and private channel data:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable both **YouTube Data API v3** and **YouTube Analytics API**.
3. Create an **OAuth 2.0 Client ID** (Desktop app type) under "Credentials".
4. Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) or your own flow to obtain a refresh token with the required scopes:
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/yt-analytics.readonly`

> **Note:** Service accounts do NOT work with YouTube APIs. You must use OAuth 2.0 with a refresh token.

### Place credentials

Choose one of these options:

```bash
# Option A: Default path (recommended)
mkdir -p ~/.config/youtube-analytics-cli
cat > ~/.config/youtube-analytics-cli/credentials.json << EOF
{
  "api_key": "YOUR_API_KEY",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
EOF

# Option B: Environment variables
export YOUTUBE_API_KEY=your_api_key
export YOUTUBE_CLIENT_ID=your_client_id
export YOUTUBE_CLIENT_SECRET=your_client_secret
export YOUTUBE_REFRESH_TOKEN=your_refresh_token

# Option C: Pass per command
youtube-analytics-cli --credentials /path/to/credentials.json channels
```

Credentials are resolved in this order:
1. `--credentials <path>` flag
2. `YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` env vars
3. `~/.config/youtube-analytics-cli/credentials.json` (auto-detected)

## Usage

All commands output pretty-printed JSON by default. Use `--format compact` for compact single-line JSON.

### channels

Get channel details. Omit ID to get the authenticated user's channel (requires OAuth).

```bash
youtube-analytics-cli channels UCxxxxxxxxxxxxxx
youtube-analytics-cli channels                    # your own channel (OAuth required)
youtube-analytics-cli channels UCxxxxxxxxxxxxxx --part snippet,statistics,brandingSettings
```

Options:
- `--part <parts>` -- parts to include (default: `snippet,statistics,contentDetails`)

### videos

Get video details by IDs (comma-separated).

```bash
youtube-analytics-cli videos dQw4w9WgXcQ
youtube-analytics-cli videos dQw4w9WgXcQ,jNQXAC9IVRw --part snippet,statistics,contentDetails
```

Options:
- `--part <parts>` -- parts to include (default: `snippet,statistics,contentDetails`)

### report

Run a YouTube Analytics report. Requires OAuth.

```bash
# Daily views and likes for the last 30 days
youtube-analytics-cli report \
  --metrics views,likes,subscribersGained \
  --start-date 2026-02-15 \
  --end-date 2026-03-17 \
  --dimensions day

# Per-video breakdown
youtube-analytics-cli report \
  --metrics views,estimatedMinutesWatched,averageViewDuration \
  --start-date 2026-01-01 \
  --end-date 2026-03-17 \
  --dimensions video \
  --sort -views \
  --max-results 10

# Country breakdown for a specific video
youtube-analytics-cli report \
  --metrics views,likes \
  --start-date 2026-01-01 \
  --end-date 2026-03-17 \
  --dimensions country \
  --filters video==dQw4w9WgXcQ
```

Options:
- `--metrics <m>` -- metrics to retrieve (required, e.g. `views,likes,subscribersGained`)
- `--start-date <d>` -- start date YYYY-MM-DD (required)
- `--end-date <d>` -- end date YYYY-MM-DD (required)
- `--dimensions <d>` -- dimensions (e.g. `day`, `video`, `country`)
- `--filters <f>` -- filters (e.g. `video==VIDEO_ID;country==US`)
- `--sort <s>` -- sort order (e.g. `-views` for descending)
- `--max-results <n>` -- max rows to return
- `--ids <ids>` -- channel or content owner (default: `channel==MINE`)
- `--currency <code>` -- currency code (e.g. `USD`)

### groups

List YouTube Analytics groups. Requires OAuth.

```bash
youtube-analytics-cli groups
youtube-analytics-cli groups --id GROUP_ID
```

Options:
- `--id <id>` -- retrieve specific group(s) by ID (comma-separated)

### group-items

List items in a YouTube Analytics group. Requires OAuth.

```bash
youtube-analytics-cli group-items GROUP_ID
```

## Error output

Errors are written to stderr as JSON with an `error` field and a non-zero exit code:

```json
{"error": "OAuth credentials required (client_id, client_secret, refresh_token). API key alone is not sufficient for this command."}
```

## API Reference

- YouTube Data API v3: https://developers.google.com/youtube/v3
- YouTube Analytics API v2: https://developers.google.com/youtube/analytics

## Related

- [google-analytics-cli](https://github.com/Bin-Huang/google-analytics-cli) -- Google Analytics
- [google-search-console-cli](https://github.com/Bin-Huang/google-search-console-cli) -- Google Search Console
- [x-analytics-cli](https://github.com/Bin-Huang/x-analytics-cli) -- X Analytics
- [x-ads-cli](https://github.com/Bin-Huang/x-ads-cli) -- X Ads
- [meta-ads-open-cli](https://github.com/Bin-Huang/meta-ads-open-cli) -- Meta Ads

## License

Apache-2.0
