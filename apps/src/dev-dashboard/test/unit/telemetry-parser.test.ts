import { describe, expect, it } from 'bun:test';
import {
  parseUserAgent,
  resolveIpLocation,
  maskIpAddress,
  createVisitorFingerprint,
  countryCodeToFlag,
  classifyTrafficCategory,
} from '../../src/backend/telemetry-parser';

describe('Tier 1 Unit: Telemetry Parser Engine [LLR-TEL-001] [HLR-DEV-501]', () => {
  it('Arrange, Act, Assert: parses macOS Chrome user agent accurately', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    const parsed = parseUserAgent(ua);

    expect(parsed.osName).toBe('macOS');
    expect(parsed.browserName).toBe('Chrome');
    expect(parsed.browserVersion).toBe('128.0');
    expect(parsed.deviceCategory).toBe('Desktop');
    expect(parsed.architecture).toBe('x86_64');
  });

  it('Arrange, Act, Assert: parses Windows 11 Edge user agent accurately', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';
    const parsed = parseUserAgent(ua);

    expect(parsed.osName).toBe('Windows');
    expect(parsed.osVersion).toBe('11 / 10');
    expect(parsed.browserName).toBe('Edge');
    expect(parsed.deviceCategory).toBe('Desktop');
  });

  it('Arrange, Act, Assert: parses iPhone Mobile Safari user agent accurately', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    const parsed = parseUserAgent(ua);

    expect(parsed.osName).toBe('iOS');
    expect(parsed.osVersion).toBe('18.0');
    expect(parsed.browserName).toBe('Mobile Safari');
    expect(parsed.deviceCategory).toBe('Mobile');
  });

  it('Arrange, Act, Assert: parses Ubuntu Linux Firefox user agent accurately', () => {
    const ua = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0';
    const parsed = parseUserAgent(ua);

    expect(parsed.osName).toBe('Ubuntu Linux');
    expect(parsed.browserName).toBe('Firefox');
    expect(parsed.deviceCategory).toBe('Desktop');
  });

  it('Arrange, Act, Assert: detects automated bots & cURL without throwing', () => {
    const curlUa = 'curl/8.5.0';
    const parsedCurl = parseUserAgent(curlUa);
    expect(parsedCurl.deviceCategory).toBe('Bot');
    expect(parsedCurl.browserName).toBe('cURL');

    const botUa = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    const parsedBot = parseUserAgent(botUa);
    expect(parsedBot.deviceCategory).toBe('Bot');
    expect(parsedBot.browserName).toBe('Googlebot');
  });

  it('Arrange, Act, Assert: resolves local loopback and private subnets offline', () => {
    const local1 = resolveIpLocation('127.0.0.1');
    expect(local1.isLocal).toBe(true);
    expect(local1.city).toBe('Localhost');
    expect(local1.flagEmoji).toBe('🏠');

    const local2 = resolveIpLocation('192.168.1.105');
    expect(local2.isLocal).toBe(true);
  });

  it('Arrange, Act, Assert: resolves public IPs deterministically without network egress', () => {
    const usIp = resolveIpLocation('24.120.45.10');
    expect(usIp.isLocal).toBe(false);
    expect(usIp.countryCode).toBe('US');
    expect(usIp.flagEmoji).toBe('🇺🇸');

    const deIp = resolveIpLocation('88.99.14.22');
    expect(deIp.isLocal).toBe(false);
    expect(deIp.countryCode).toBe('DE');
    expect(deIp.flagEmoji).toBe('🇩🇪');
  });

  it('Arrange, Act, Assert: masks IPv4 addresses correctly for privacy', () => {
    expect(maskIpAddress('192.168.1.42')).toBe('192.168.***.***');
    expect(maskIpAddress('140.82.121.4')).toBe('140.82.***.***');
    expect(maskIpAddress('127.0.0.1')).toBe('127.0.0.***');
  });

  it('Arrange, Act, Assert: creates deterministic visitor fingerprint', () => {
    const fp1 = createVisitorFingerprint('192.168.1.42', 'Mozilla/5.0 Chrome');
    const fp2 = createVisitorFingerprint('192.168.1.99', 'Mozilla/5.0 Chrome'); // Same /24 subnet
    expect(fp1).toBe(fp2);

    const fp3 = createVisitorFingerprint('10.0.0.1', 'Mozilla/5.0 Chrome');
    expect(fp1).not.toBe(fp3);
  });

  it('Arrange, Act, Assert: converts country code to flag emoji', () => {
    expect(countryCodeToFlag('US')).toBe('🇺🇸');
    expect(countryCodeToFlag('DE')).toBe('🇩🇪');
    expect(countryCodeToFlag('GB')).toBe('🇬🇧');
    expect(countryCodeToFlag('JP')).toBe('🇯🇵');
  });

  it('Arrange, Act, Assert: classifies internal health & liveness polls as probe', () => {
    expect(classifyTrafficCategory('/health', 'kube-probe/1.28')).toBe('probe');
    expect(classifyTrafficCategory('/api/services', 'Mozilla/5.0')).toBe('probe');
    expect(classifyTrafficCategory('/api/overview/stats', 'Mozilla/5.0')).toBe('probe');
    expect(classifyTrafficCategory('/api/apps', 'Mozilla/5.0')).toBe('probe');
    expect(classifyTrafficCategory('/readyz', 'curl/8.5.0')).toBe('probe');
    expect(classifyTrafficCategory('/', 'Mozilla/5.0', '127.0.0.1', '1')).toBe('probe');
  });

  it('Arrange, Act, Assert: classifies service-to-service internal calls as mesh', () => {
    expect(classifyTrafficCategory('/api/data', 'curl/8.5.0', '127.0.0.1')).toBe('mesh');
    expect(classifyTrafficCategory('/api/sync', 'ForgeCoreService/1.0', '10.0.0.5')).toBe('mesh');
  });

  it('Arrange, Act, Assert: classifies real user visits as user', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36';
    expect(classifyTrafficCategory('/', ua, '24.120.45.10')).toBe('user');
    expect(classifyTrafficCategory('/docs', ua, '127.0.0.1')).toBe('user');
    expect(classifyTrafficCategory('/dashboard', ua, '192.168.1.50')).toBe('user');
  });
});

