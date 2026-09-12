/**
 * @forge/scripts - Tier 1 Integration Tests: Dynamic Docker Lifecycle & Endpoint Resolver
 * 3A Pattern (Arrange, Act, Assert) - 100% Deterministic & Safe Execution
 * Big Tech Clean Architecture & Verification Gate Standard
 */

import { describe, expect, it } from 'bun:test';
import {
  getGatewayConfig,
  resolveCoreServices,
  resolveForgeApps,
  validateTarget,
  printBanner,
} from '../docker-resolver';

describe('Tier 1: Dynamic Docker Lifecycle & Endpoint Banner Resolver [HLR-SDK-301] [LLR-SDK-001] [LLR-SDK-005]', () => {
  // --------------------------------------------------------------------------
  // 1. Gateway Protocol and Port Resolution
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: resolves dev gateway endpoints dynamically with port 8080', () => {
    // Arrange & Act
    const config = getGatewayConfig('dev');

    // Assert
    expect(config.primary).toContain('localhost');
    expect(config.enableHttp).toBe(true);
    expect(config.httpPort).toBe('8080');
    expect(config.http).toBe('http://localhost:8080');
  });

  it('Arrange, Act, Assert: resolves prod gateway endpoints omitting default port 80/443', () => {
    // Arrange & Act
    const config = getGatewayConfig('prod');

    // Assert
    expect(config.primary).toBe('http://localhost');
    expect(config.enableHttp).toBe(true);
    expect(config.httpPort).toBe('80');
  });

  // --------------------------------------------------------------------------
  // 2. Core Service Resolution
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: resolves active core services in dev stack', () => {
    // Arrange & Act
    const { active, inactive } = resolveCoreServices('dev', 'all');

    // Assert
    expect(active).toContain('proxy');
    expect(active).toContain('portal');
    expect(active).toContain('auth');
    expect(active).toContain('docs');
    expect(active).toContain('dev-dashboard');
    expect(active).toContain('dev-hub');
    expect(active).toContain('autoheal');
    expect(inactive).not.toContain('portal');
  });

  it('Arrange, Act, Assert: resolves prod stack with db-backup and core services', () => {
    // Arrange & Act
    const { active } = resolveCoreServices('prod', 'all');

    // Assert
    expect(active).toContain('proxy');
    expect(active).toContain('db-backup');
  });

  // --------------------------------------------------------------------------
  // 3. Standalone Forge Apps Discovery
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: discovers active standalone forge apps from .env and skips app-template', () => {
    // Arrange & Act
    const { active, inactive } = resolveForgeApps();

    // Assert
    expect(active).toContain('telemetry');
    expect(active).toContain('code');
    expect(active).not.toContain('app-template');
    expect(inactive).not.toContain('app-template');
  });

  it('Arrange, Act, Assert: filters forge apps when specific target is supplied', () => {
    // Arrange & Act
    const { active } = resolveForgeApps('telemetry');

    // Assert
    expect(active).toEqual(['telemetry']);
  });

  // --------------------------------------------------------------------------
  // 4. Target Validation Logic
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: validates existing registered core app', () => {
    // Arrange & Act
    const val = validateTarget('portal');

    // Assert
    expect(val.valid).toBe(true);
    expect(val.type).toBe('core');
    expect(val.name).toBe('portal');
  });

  it('Arrange, Act, Assert: validates existing registered forge app', () => {
    // Arrange & Act
    const val = validateTarget('telemetry');

    // Assert
    expect(val.valid).toBe(true);
    expect(val.type).toBe('forge');
    expect(val.name).toBe('telemetry');
    expect(val.service?.port).toBe(8087);
  });

  it('Arrange, Act, Assert: rejects app-template when not registered in .env', () => {
    // Arrange & Act
    const val = validateTarget('app-template');

    // Assert
    expect(val.valid).toBe(false);
    expect(val.type).toBe('forge');
    expect(val.message).toContain('is not declared or active in .env');
  });

  it('Arrange, Act, Assert: rejects non-existent unknown app target', () => {
    // Arrange & Act
    const val = validateTarget('random-service-xyz');

    // Assert
    expect(val.valid).toBe(false);
    expect(val.type).toBe('unknown');
    expect(val.message).toContain('Unknown service or app');
  });

  // --------------------------------------------------------------------------
  // 5. Banner Generation
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: printBanner executes without error for dev and prod', () => {
    // Arrange: capture console
    const origLog = console.log;
    let devOutput = '';
    console.log = (...args: unknown[]) => {
      devOutput += `${args.join(' ')}\n`;
    };

    try {
      // Act
      printBanner('dev');
      printBanner('prod');
      printBanner('dev', 'telemetry');

      // Assert
      expect(devOutput).toContain('Stack running in DEV mode');
      expect(devOutput).toContain('Stack running in PROD mode');
      expect(devOutput).toContain("Service 'telemetry' is up and verified");
    } finally {
      console.log = origLog;
    }
  });
});
