#!/usr/bin/env ts-node

import { DatabaseProvider } from '../database.provider';
import { QueryAnalyzer } from './query-analyzer';

/**
 * CLI для database analysis
 *
 * Usage:
 *   ts-node analyze-cli.ts table-stats users
 *   ts-node analyze-cli.ts unused-indexes
 */

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  const knex = await DatabaseProvider.getConnection();
  const analyzer = new QueryAnalyzer(knex);

  switch (command) {
    case 'table-stats':
      if (!arg) {
        console.error('Usage: analyze-cli.ts table-stats <table_name>');
        process.exit(1);
      }
      await analyzer.getTableStats(arg);
      break;

    case 'unused-indexes':
      await analyzer.getUnusedIndexes();
      break;

    case 'analyze':
      if (!arg) {
        console.error('Usage: analyze-cli.ts analyze <table_name>');
        process.exit(1);
      }
      await analyzer.analyzeTable(arg);
      break;

    default:
      console.log('Available commands:');
      console.log('  table-stats <table>  - Show table statistics');
      console.log('  unused-indexes       - Find unused indexes');
      console.log('  analyze <table>      - Update table statistics');
  }

  await DatabaseProvider.close();
}

main().catch(console.error);
