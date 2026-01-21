# LeadScrape

Enterprise-grade lead scraper for OnCall Automation. Scrapes contractor leads from multiple sources, deduplicates them, and exports to XLSX.

## Features

- **Multi-source scraping**: Google Maps, Yelp (more coming)
- **Smart deduplication**: Fuzzy matching prevents duplicate leads across sources
- **Rate limiting**: Token bucket algorithm respects API limits
- **Proxy rotation**: Built-in support for residential proxies
- **Circuit breakers**: Auto-recovery from API failures
- **XLSX export**: Formatted spreadsheet matching your template

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

| Key | Where to get it | Free tier |
|-----|-----------------|-----------|
| `YELP_API_KEY` | [yelp.com/developers](https://www.yelp.com/developers/v3/manage_app) | 5,000 calls/day |
| `GOOGLE_PLACES_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) | $200/month credit |
| `HUNTER_API_KEY` | [hunter.io](https://hunter.io/api) | 25 searches/month |

### 3. Run a scrape

```bash
# See what would be scraped (dry run)
npm run cli -- scrape --dry-run

# Scrape HVAC contractors from Yelp
npm run cli -- scrape -s yelp -t hvac -l "Westchester County, NY"

# Scrape all trades from all sources
npm run cli -- scrape
```

### 4. Export leads

```bash
# Export to XLSX (default: ./data/exports/leads-YYYY-MM-DD.xlsx)
npm run cli -- export

# Export to specific file
npm run cli -- export -o ./my-leads.xlsx

# Export as CSV
npm run cli -- export --format csv
```

## CLI Commands

### `scrape`

Run the scraping pipeline.

```bash
npm run cli -- scrape [options]

Options:
  -s, --sources <sources>     Comma-separated sources (google,yelp)
  -t, --trades <trades>       Comma-separated trades (hvac,plumbing,electrical,roofing)
  -l, --location <location>   Target location (default: "Westchester County, NY")
  --max-results <number>      Max results per source (default: 100)
  --skip-deduplication        Skip duplicate checking
  --dry-run                   Preview without scraping
```

### `export`

Export leads to XLSX or CSV.

```bash
npm run cli -- export [options]

Options:
  -o, --output <path>         Output file path
  --status <status>           Filter by status (new,enriched,verified,all)
  --trade <trade>             Filter by trade
  --format <format>           Export format (xlsx,csv)
```

### `status`

Show database statistics.

```bash
npm run cli -- status
```

### `enrich`

Enrich leads with email addresses (requires Hunter.io API key).

```bash
npm run cli -- enrich --limit 50
```

## Project Structure

```
LeadScrape/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── config/                # Configuration + environment
│   ├── types/                 # TypeScript interfaces
│   ├── core/
│   │   ├── http/              # HTTP client, rate limiting, proxies
│   │   ├── resilience/        # Circuit breaker, retry logic
│   │   └── deduplication/     # Fuzzy matching
│   ├── scrapers/              # Source-specific scrapers
│   ├── enrichment/            # Email enrichment (Hunter.io)
│   ├── storage/               # SQLite database
│   ├── export/                # XLSX/CSV export
│   └── orchestrator/          # Pipeline coordination
├── data/
│   ├── leads.db               # SQLite database
│   └── exports/               # Generated spreadsheets
└── .env                       # API keys (not committed)
```

## Data Sources

| Source | Method | Status |
|--------|--------|--------|
| Yelp | Fusion API | ✅ Ready |
| Google Maps | Places API | ✅ Ready |
| LinkedIn | Proxycurl API | 🔜 Coming |
| HomeAdvisor | Browser scraping | 🔜 Coming (requires proxies) |
| Angi | Browser scraping | 🔜 Coming (requires proxies) |
| Thumbtack | Browser scraping | 🔜 Coming (requires proxies) |
| BBB | Browser scraping | 🔜 Coming |

## Export Format

The XLSX export matches this template:

| Column | Description |
|--------|-------------|
| Company Name | Business name |
| Contact Name | Owner/decision maker |
| Email | Email address (from enrichment) |
| Phone | Phone number |
| Website | Business website |
| Address | Full address |
| Trade | HVAC, Plumbing, Electrical, Roofing |
| Source | Where the lead was found |
| Notes | Additional info |
| Status | New, Enriched, Verified, Exported |

## Development

```bash
# Run in development mode
npm run cli -- <command>

# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm test
```

## License

Proprietary - OnCall Automation
