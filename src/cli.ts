#!/usr/bin/env node
/**
 * LeadScrape CLI
 */

import { Command } from 'commander';
import { config, hasApiKey } from './config/index.js';
import { initDatabase, closeDatabase } from './storage/sqlite.client.js';
import {
  findLeads,
  countLeadsByStatus,
  countLeadsBySource,
  countLeadsByTrade,
  getTotalLeadCount,
} from './storage/lead.repository.js';
import { runScrape, getScrapableSources } from './orchestrator/scrape.orchestrator.js';
import { exportToXlsx, exportToCsv } from './export/xlsx.exporter.js';
import { createLogger } from './utils/logger.js';
import { Trade, LeadSource, LeadStatus } from './types/index.js';

const logger = createLogger('cli');
const program = new Command();

program
  .name('leadscrape')
  .description('Enterprise lead scraper for OnCall Automation')
  .version('1.0.0');

/**
 * Scrape command
 */
program
  .command('scrape')
  .description('Run lead scraping pipeline')
  .option(
    '-s, --sources <sources>',
    'Comma-separated sources (google,yelp,bbb,homeadvisor,angi,thumbtack,linkedin)',
    'all'
  )
  .option(
    '-t, --trades <trades>',
    'Comma-separated trades (hvac,plumbing,electrical,roofing)',
    'all'
  )
  .option(
    '-l, --location <location>',
    'Target location',
    'Westchester County, NY'
  )
  .option('--max-results <number>', 'Max results per source', '100')
  .option('--skip-enrichment', 'Skip email enrichment step', false)
  .option('--skip-deduplication', 'Skip deduplication step', false)
  .option('--dry-run', 'Preview what would be scraped without executing', false)
  .action(async (options) => {
    await initDatabase();

    const sourceMap: Record<string, LeadSource> = {
      google: LeadSource.GOOGLE_MAPS,
      yelp: LeadSource.YELP,
      linkedin: LeadSource.LINKEDIN,
      homeadvisor: LeadSource.HOMEADVISOR,
      angi: LeadSource.ANGI,
      thumbtack: LeadSource.THUMBTACK,
      bbb: LeadSource.BBB,
    };

    const tradeMap: Record<string, Trade> = {
      hvac: Trade.HVAC,
      plumbing: Trade.PLUMBING,
      electrical: Trade.ELECTRICAL,
      roofing: Trade.ROOFING,
    };

    // Parse sources
    let sources: LeadSource[];
    if (options.sources === 'all') {
      sources = getScrapableSources();
    } else {
      sources = options.sources
        .split(',')
        .map((s: string) => sourceMap[s.trim().toLowerCase()])
        .filter(Boolean);
    }

    // Parse trades
    const trades =
      options.trades === 'all'
        ? [Trade.HVAC, Trade.PLUMBING, Trade.ELECTRICAL, Trade.ROOFING]
        : options.trades
            .split(',')
            .map((t: string) => tradeMap[t.trim().toLowerCase()])
            .filter(Boolean);

    // Parse location
    const locationParts = options.location.split(',').map((p: string) => p.trim());
    const location: { city?: string; county?: string; state?: string } = {};

    // Simple parsing: assume "City, State" or "County, State" format
    if (locationParts.length >= 2) {
      const lastPart = locationParts[locationParts.length - 1];
      if (lastPart && lastPart.length === 2) {
        location.state = lastPart;
      }
      const firstPart = locationParts[0];
      if (firstPart) {
        if (firstPart.toLowerCase().includes('county')) {
          location.county = firstPart;
        } else {
          location.city = firstPart;
        }
      }
    } else if (locationParts[0]) {
      location.city = locationParts[0];
    }

    console.log('\n🔍 LeadScrape Configuration:');
    console.log(`   Location: ${options.location}`);
    console.log(`   Trades: ${trades.join(', ')}`);
    console.log(`   Sources: ${sources.join(', ')}`);
    console.log(`   Max results per source: ${options.maxResults}`);
    console.log(`   Skip deduplication: ${options.skipDeduplication}`);

    // Check API keys
    console.log('\n🔑 API Key Status:');
    console.log(
      `   Google Places: ${hasApiKey('GOOGLE_PLACES_API_KEY') ? '✓' : '✗ Not configured'}`
    );
    console.log(
      `   Yelp Fusion: ${hasApiKey('YELP_API_KEY') ? '✓' : '✗ Not configured'}`
    );
    console.log(
      `   Hunter.io: ${hasApiKey('HUNTER_API_KEY') ? '✓' : '✗ Not configured'}`
    );
    console.log(
      `   Proxycurl: ${hasApiKey('PROXYCURL_API_KEY') ? '✓' : '✗ Not configured'}`
    );

    if (options.dryRun) {
      console.log('\n⚠️  DRY RUN - No scraping will occur');
      console.log('\nWould scrape:');
      for (const source of sources) {
        for (const trade of trades) {
          console.log(`   - ${trade} from ${source} in ${options.location}`);
        }
      }
      await closeDatabase();
      return;
    }

    // Run the actual scrape
    console.log('\n🚀 Starting scrape...\n');

    try {
      const result = await runScrape({
        sources,
        trades,
        location,
        maxResultsPerSource: parseInt(options.maxResults, 10),
        skipDeduplication: options.skipDeduplication,
        onProgress: (progress) => {
          if (progress.status === 'starting') {
            console.log(`📡 Starting ${progress.source}...`);
          } else if (progress.status === 'scraping') {
            process.stdout.write(
              `\r   Found: ${progress.found} | Saved: ${progress.saved} | Duplicates: ${progress.duplicates}`
            );
          } else if (progress.status === 'complete') {
            console.log(
              `\n✅ ${progress.source}: ${progress.found} found, ${progress.saved} saved, ${progress.duplicates} duplicates`
            );
          } else if (progress.status === 'error') {
            console.log(`\n❌ ${progress.source}: ${progress.error}`);
          }
        },
      });

      console.log('\n📊 Scrape Summary:');
      console.log(`   Total found: ${result.totalFound}`);
      console.log(`   Total saved: ${result.totalSaved}`);
      console.log(`   Total duplicates: ${result.totalDuplicates}`);

      if (result.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        for (const error of result.errors) {
          console.log(`   ${error.source}: ${error.error}`);
        }
      }
    } catch (error) {
      console.error(`\n❌ Scrape failed: ${error}`);
    }

    await closeDatabase();
  });

/**
 * Enrich command
 */
program
  .command('enrich')
  .description('Enrich existing leads with email data')
  .option('--limit <number>', 'Max leads to enrich', '100')
  .option('--provider <provider>', 'Enrichment provider (hunter,apollo)', 'hunter')
  .action(async (options) => {
    await initDatabase();

    const limit = parseInt(options.limit, 10);
    console.log(`\n📧 Enriching up to ${limit} leads using ${options.provider}`);

    // Find leads without emails
    const leads = findLeads({
      hasEmail: false,
      status: [LeadStatus.NEW, LeadStatus.ENRICHED],
      limit,
    });

    console.log(`   Found ${leads.length} leads without emails`);

    if (leads.length === 0) {
      console.log('   No leads to enrich');
      await closeDatabase();
      return;
    }

    // TODO: Implement enrichment
    console.log('\n🚧 Enrichment not yet implemented');
    console.log('   To add email enrichment:');
    console.log('   1. Get a Hunter.io API key from https://hunter.io/api');
    console.log('   2. Set HUNTER_API_KEY in your .env file');
    console.log('   3. Run this command again');

    await closeDatabase();
  });

/**
 * Export command
 */
program
  .command('export')
  .description('Export leads to XLSX')
  .option('-o, --output <path>', 'Output file path')
  .option('--status <status>', 'Filter by status (new,enriched,verified,all)', 'all')
  .option('--trade <trade>', 'Filter by trade')
  .option('--format <format>', 'Export format (xlsx,csv)', 'xlsx')
  .action(async (options) => {
    await initDatabase();

    const statusMap: Record<string, LeadStatus> = {
      new: LeadStatus.NEW,
      enriched: LeadStatus.ENRICHED,
      verified: LeadStatus.VERIFIED,
      exported: LeadStatus.EXPORTED,
    };

    const tradeMap: Record<string, Trade> = {
      hvac: Trade.HVAC,
      plumbing: Trade.PLUMBING,
      electrical: Trade.ELECTRICAL,
      roofing: Trade.ROOFING,
    };

    const filters: Parameters<typeof findLeads>[0] = {};

    if (options.status !== 'all') {
      filters.status = statusMap[options.status.toLowerCase()];
    }

    if (options.trade) {
      filters.trade = tradeMap[options.trade.toLowerCase()];
    }

    console.log('\n📊 Exporting leads...');

    try {
      let result: { path: string; count: number };

      if (options.format === 'csv') {
        result = await exportToCsv(options.output, filters);
      } else {
        result = await exportToXlsx(options.output, filters);
      }

      if (result.count === 0) {
        console.log('   No leads to export');
      } else {
        console.log(`   ✅ Exported ${result.count} leads to ${result.path}`);
      }
    } catch (error) {
      console.error(`   ❌ Export failed: ${error}`);
    }

    await closeDatabase();
  });

/**
 * Status command
 */
program
  .command('status')
  .description('Show scraping statistics and database status')
  .action(async () => {
    await initDatabase();

    const total = getTotalLeadCount();
    const byStatus = countLeadsByStatus();
    const bySource = countLeadsBySource();
    const byTrade = countLeadsByTrade();

    console.log('\n📈 LeadScrape Statistics\n');
    console.log(`Total leads: ${total}\n`);

    if (Object.keys(byStatus).length > 0) {
      console.log('By Status:');
      for (const [status, count] of Object.entries(byStatus)) {
        console.log(`   ${status}: ${count}`);
      }
    }

    if (Object.keys(bySource).length > 0) {
      console.log('\nBy Source:');
      for (const [source, count] of Object.entries(bySource)) {
        console.log(`   ${source}: ${count}`);
      }
    }

    if (Object.keys(byTrade).length > 0) {
      console.log('\nBy Trade:');
      for (const [trade, count] of Object.entries(byTrade)) {
        console.log(`   ${trade}: ${count}`);
      }
    }

    console.log('\n🔑 Configuration:');
    console.log(`   Database: ${config.DATABASE_PATH}`);
    console.log(`   Export path: ${config.EXPORT_PATH}`);
    console.log(`   Redis: ${config.REDIS_HOST}:${config.REDIS_PORT}`);

    console.log('\n🔌 Available Scrapers:');
    const scrapers = getScrapableSources();
    for (const scraper of scrapers) {
      console.log(`   - ${scraper}`);
    }

    await closeDatabase();
  });

/**
 * Dedupe command
 */
program
  .command('dedupe')
  .description('Run deduplication on existing leads')
  .option('--threshold <number>', 'Similarity threshold (0-1)', '0.7')
  .option('--dry-run', 'Preview duplicates without merging', false)
  .action(async (options) => {
    await initDatabase();

    const threshold = parseFloat(options.threshold);
    console.log(`\n🔄 Running deduplication with threshold ${threshold}`);

    if (options.dryRun) {
      console.log('   DRY RUN - No changes will be made');
    }

    // TODO: Implement standalone deduplication
    console.log('\n🚧 Standalone deduplication not yet implemented');
    console.log('   Note: Deduplication runs automatically during scraping.');

    await closeDatabase();
  });

// Handle errors
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  // Commander throws on --help and --version, which is fine
  if (error instanceof Error) {
    const errorCode = (error as { code?: string }).code;
    const isHelpOrVersionExit =
      errorCode === 'commander.help' ||
      errorCode === 'commander.helpDisplayed' ||
      errorCode === 'commander.version';
    if (!isHelpOrVersionExit) {
      logger.error(error.message);
      process.exit(1);
    }
  }
}
