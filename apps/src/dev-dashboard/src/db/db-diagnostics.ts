/**
 * @forge/dev-dashboard - Microservice Database Diagnostics & Telemetry (2026 LTS)
 * Provides real-time storage metrics, PRAGMA diagnostics, and ER graph relationship extraction.
 * Enterprise SRE & Astryx Enterprise Standards
 */

import { Database } from 'bun:sqlite';
import { existsSync, statSync } from 'node:fs';
import { getSafeDbPath } from './db';

/**
 * DbTelemetryStats
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export interface DbTelemetryStats {
  dbName: string;
  fileSizeBytes: number;
  walSizeBytes: number;
  shmSizeBytes: number;
  totalSizeBytes: number;
  pageSizeBytes: number;
  pageCount: number;
  freelistCount: number;
  journalMode: string;
  cacheSize: number;
  schemaVersion: number;
  integrityStatus: string;
  tableCount: number;
  indexCount: number;
  totalRecordsEstimated: number;
  timestamp: number;
}

/**
 * SchemaGraphNode
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export interface SchemaGraphNode {
  name: string;
  type: string;
  rowCount: number;
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: boolean;
    pk: boolean;
    defaultValue: string | null;
  }>;
  indexes: Array<{
    name: string;
    unique: boolean;
    columns: string[];
  }>;
}

/**
 * SchemaGraphEdge
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export interface SchemaGraphEdge {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  onUpdate: string;
  onDelete: string;
}

/**
 * SchemaGraphResponse
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export interface SchemaGraphResponse {
  dbName: string;
  nodes: SchemaGraphNode[];
  edges: SchemaGraphEdge[];
  tableCount: number;
  relationshipCount: number;
}

/**
 * DatabaseDiagnosticsManager
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export class DatabaseDiagnosticsManager {
  /**
   * Retrieves comprehensive low-overhead real-time storage and PRAGMA metrics for a database
   */
  public getDatabaseTelemetry(dbName: string): DbTelemetryStats | { error: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) {
      return { error: `Database file ${dbName} not found or invalid name` };
    }

    try {
      const stats = statSync(targetPath);
      const walPath = `${targetPath}-wal`;
      const shmPath = `${targetPath}-shm`;
      const walSize = existsSync(walPath) ? statSync(walPath).size : 0;
      const shmSize = existsSync(shmPath) ? statSync(shmPath).size : 0;

      const dbInstance = new Database(targetPath, { readonly: true });

      const pageSizeRow = dbInstance.query('PRAGMA page_size;').get() as any;
      const pageCountRow = dbInstance.query('PRAGMA page_count;').get() as any;
      const freelistRow = dbInstance.query('PRAGMA freelist_count;').get() as any;
      const journalRow = dbInstance.query('PRAGMA journal_mode;').get() as any;
      const cacheRow = dbInstance.query('PRAGMA cache_size;').get() as any;
      const schemaVerRow = dbInstance.query('PRAGMA schema_version;').get() as any;
      const integrityRow = dbInstance.query('PRAGMA quick_check(1);').get() as any;

      const tables = dbInstance.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all() as Array<{ name: string }>;
      const indexes = dbInstance.query("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';").all() as Array<{ name: string }>;

      let totalRecords = 0;
      for (const t of tables) {
        try {
          const sanitized = t.name.replace(/[^a-zA-Z0-9_]/g, '');
          const countRow = dbInstance.query(`SELECT COUNT(*) as c FROM "${sanitized}";`).get() as any;
          if (countRow?.c) totalRecords += Number(countRow.c);
        } catch {
          // Ignore table lock or virtual table count errors
        }
      }

      dbInstance.close();

      return {
        dbName,
        fileSizeBytes: stats.size,
        walSizeBytes: walSize,
        shmSizeBytes: shmSize,
        totalSizeBytes: stats.size + walSize + shmSize,
        pageSizeBytes: pageSizeRow ? Object.values(pageSizeRow)[0] as number : 4096,
        pageCount: pageCountRow ? Object.values(pageCountRow)[0] as number : 0,
        freelistCount: freelistRow ? Object.values(freelistRow)[0] as number : 0,
        journalMode: journalRow ? String(Object.values(journalRow)[0]) : 'wal',
        cacheSize: cacheRow ? Object.values(cacheRow)[0] as number : -2000,
        schemaVersion: schemaVerRow ? Object.values(schemaVerRow)[0] as number : 0,
        integrityStatus: integrityRow ? String(Object.values(integrityRow)[0]) : 'ok',
        tableCount: tables.length,
        indexCount: indexes.length,
        totalRecordsEstimated: totalRecords,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      return { error: err.message || String(err) };
    }
  }

  /**
   * Generates a complete Schema Graph with nodes, columns, types, indexes, and foreign-key edges
   */
  public getDatabaseSchemaGraph(dbName: string): SchemaGraphResponse | { error: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) {
      return { error: `Database file ${dbName} not found or invalid name` };
    }

    try {
      const dbInstance = new Database(targetPath, { readonly: true });
      const tableRows = dbInstance.query("SELECT name, type FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;").all() as Array<{ name: string; type: string }>;

      const nodes: SchemaGraphNode[] = [];
      const edges: SchemaGraphEdge[] = [];

      for (const t of tableRows) {
        const sanitized = t.name.replace(/[^a-zA-Z0-9_]/g, '');
        const colInfo = dbInstance.query(`PRAGMA table_info("${sanitized}");`).all() as any[];
        const countRow = dbInstance.query(`SELECT COUNT(*) as c FROM "${sanitized}";`).get() as any;
        const fkList = dbInstance.query(`PRAGMA foreign_key_list("${sanitized}");`).all() as any[];
        const indexList = dbInstance.query(`PRAGMA index_list("${sanitized}");`).all() as any[];

        const columns = colInfo.map((c) => ({
          cid: Number(c.cid),
          name: String(c.name),
          type: String(c.type || 'TEXT').toUpperCase(),
          notnull: Boolean(c.notnull),
          pk: Boolean(c.pk),
          defaultValue: c.dflt_value !== null && c.dflt_value !== undefined ? String(c.dflt_value) : null,
        }));

        const indexes: Array<{ name: string; unique: boolean; columns: string[] }> = [];
        for (const idx of indexList) {
          const idxInfo = dbInstance.query(`PRAGMA index_info("${idx.name}");`).all() as any[];
          indexes.push({
            name: idx.name,
            unique: Boolean(idx.unique),
            columns: idxInfo.map((i) => i.name),
          });
        }

        for (const fk of fkList) {
          edges.push({
            fromTable: t.name,
            fromColumn: String(fk.from),
            toTable: String(fk.table),
            toColumn: String(fk.to),
            onUpdate: String(fk.on_update || 'NO ACTION'),
            onDelete: String(fk.on_delete || 'NO ACTION'),
          });
        }

        nodes.push({
          name: t.name,
          type: t.type,
          rowCount: countRow?.c ? Number(countRow.c) : 0,
          columns,
          indexes,
        });
      }

      dbInstance.close();

      return {
        dbName,
        nodes,
        edges,
        tableCount: nodes.length,
        relationshipCount: edges.length,
      };
    } catch (err: any) {
      return { error: err.message || String(err) };
    }
  }
}

/**
 * dbDiagnostics
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export const dbDiagnostics = new DatabaseDiagnosticsManager();
