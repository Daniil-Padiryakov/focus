// @ts-nocheck
import { Knex } from 'knex';

/**
 * Query Analyzer Utility
 * Помогает анализировать slow queries и optimize performance
 */

export class QueryAnalyzer {
  constructor(private knex: Knex) {}

  /**
   * Analyze query execution plan
   *
   * @example
   * const query = knex('users').where({ email: 'test@example.com' });
   * await queryAnalyzer.explain(query);
   */
  async explain(query: Knex.QueryBuilder): Promise<void> {
    const sql = query.toSQL().sql;
    const bindings = query.toSQL().bindings;

    console.log('\n📊 Query Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔍 SQL:');
    console.log(sql);
    console.log('\n📌 Bindings:', bindings);

    // EXPLAIN ANALYZE (показывает actual execution)
    console.log('\n📈 Execution Plan:');
    const plan = await this.knex.raw(`EXPLAIN ANALYZE ${sql}`, bindings);

    plan.rows.forEach((row: any) => {
      console.log(row['QUERY PLAN']);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Find slow queries (queries taking > threshold ms)
   */
  async findSlowQueries(thresholdMs: number = 100): Promise<void> {
    // Enable slow query logging (PostgreSQL specific)
    await this.knex.raw(`
      ALTER DATABASE ${process.env.DATABASE_NAME}
      SET log_min_duration_statement = ${thresholdMs};
    `);

    console.log(`✅ Slow query logging enabled (threshold: ${thresholdMs}ms)`);
    console.log('   Check PostgreSQL logs for slow queries');
  }

  /**
   * Get table statistics (размер, row count, indexes)
   */
  async getTableStats(tableName: string): Promise<void> {
    console.log(`\n📊 Table Statistics: ${tableName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Table size
    const sizeResult = await this.knex.raw(
      `
      SELECT 
        pg_size_pretty(pg_total_relation_size(?)) AS total_size,
        pg_size_pretty(pg_relation_size(?)) AS table_size,
        pg_size_pretty(pg_indexes_size(?)) AS indexes_size
    `,
      [tableName, tableName, tableName],
    );

    console.log('\n💾 Size:');
    console.log('  Total:   ', sizeResult.rows[0].total_size);
    console.log('  Table:   ', sizeResult.rows[0].table_size);
    console.log('  Indexes: ', sizeResult.rows[0].indexes_size);

    // Row count
    const countResult = await this.knex(tableName).count('* as count');
    console.log('\n📈 Rows:', countResult[0].count);

    // Indexes
    const indexesResult = await this.knex.raw(
      `
            SELECT indexname,
                   indexdef
            FROM pg_indexes
            WHERE tablename = ?
        `,
      [tableName],
    );

    console.log('\n🔗 Indexes:');
    indexesResult.rows.forEach((idx: any) => {
      console.log(`  - ${idx.indexname}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Update table statistics (для query planner)
   */
  async analyzeTable(tableName: string): Promise<void> {
    await this.knex.raw(`ANALYZE ${tableName}`);
    console.log(`✅ Analyzed table: ${tableName}`);
  }

  /**
   * Get unused indexes (candidates для removal)
   */
  async getUnusedIndexes() {
    const result: any = await this.knex.raw(`
            SELECT
                schemaname,
                relname as tablename,        -- ✅ relname это имя таблицы
                indexrelname as indexname,    -- ✅ indexrelname это имя индекса
                idx_scan as index_scans
            FROM pg_stat_user_indexes
            WHERE idx_scan = 0
              AND indexrelname NOT LIKE '%_pkey'
              AND indexrelname NOT LIKE '%_unique'
            ORDER BY schemaname, relname, indexrelname;
        `);

    console.log('\n📊 Unused Indexes:\n');

    if (result.rows.length === 0) {
      console.log('✅ No unused indexes found! All indexes are being used.\n');
      return;
    }

    console.table(result.rows);

    console.log(`\n⚠️  Found ${result.rows.length} unused index(es)`);
    console.log(
      '💡 Consider dropping them to save disk space and improve write performance\n',
    );
  }
}
