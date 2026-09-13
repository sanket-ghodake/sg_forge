/**
 * @forge/dev-dashboard - Air-Gapped Machine, Device & IP Geolocation Parser (2026 LTS)
 * Zero External Dependencies, 100% Offline & Deterministic.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

export interface ParsedClientSpecs {
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  deviceCategory: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot';
  architecture: 'arm64' | 'x86_64' | 'unknown';
}

export interface ResolvedLocation {
  clientIp: string;
  isLocal: boolean;
  countryCode: string;
  countryName: string;
  city: string;
  flagEmoji: string;
}

/**
 * Converts two-letter ISO country code to emoji flag.
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const upper = code.toUpperCase();
  const first = upper.codePointAt(0)! - 65 + 0x1f1e6;
  const second = upper.codePointAt(1)! - 65 + 0x1f1e6;
  return String.fromCodePoint(first, second);
}

/**
 * Parses User-Agent string to extract Operating System, Browser, Architecture, and Device category.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function parseUserAgent(uaString = ''): ParsedClientSpecs {
  const ua = uaString.trim();
  if (!ua) {
    return {
      osName: 'Unknown',
      osVersion: '',
      browserName: 'Unknown',
      browserVersion: '',
      deviceCategory: 'Desktop',
      architecture: 'unknown',
    };
  }

  // 1. Detect Bots & Crawlers
  if (/bot|crawler|spider|curl|wget|python|httpclient|postman|insomnia|slurp/i.test(ua)) {
    let botName = 'Bot';
    if (/googlebot/i.test(ua)) botName = 'Googlebot';
    else if (/bingbot/i.test(ua)) botName = 'Bingbot';
    else if (/curl/i.test(ua)) botName = 'cURL';
    else if (/postman/i.test(ua)) botName = 'Postman';
    return {
      osName: 'Server / Bot',
      osVersion: '',
      browserName: botName,
      browserVersion: '',
      deviceCategory: 'Bot',
      architecture: 'unknown',
    };
  }

  // 2. Detect Architecture
  let architecture: 'arm64' | 'x86_64' | 'unknown' = 'unknown';
  if (/aarch64|arm64|apple silicon/i.test(ua)) architecture = 'arm64';
  else if (/x86_64|win64|x64|wow64|amd64|intel/i.test(ua)) architecture = 'x86_64';

  // 3. Detect Device Category
  let deviceCategory: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' = 'Desktop';
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceCategory = 'Tablet';
  } else if (/mobi|iphone|android|windows phone|ipod/i.test(ua)) {
    deviceCategory = 'Mobile';
  }

  // 4. Detect Operating System & Version
  let osName = 'Unknown OS';
  let osVersion = '';

  if (/iphone|ipad|ipod/i.test(ua)) {
    osName = 'iOS';
    const match = ua.match(/OS (\d+([._]\d+)?)/i);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (/macintosh|mac os x/i.test(ua)) {
    osName = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/i);
    if (match) {
      const v = match[1].replace(/_/g, '.');
      osVersion = v;
      if (v.startsWith('15')) osVersion = '15 (Sequoia)';
      else if (v.startsWith('14')) osVersion = '14 (Sonoma)';
      else if (v.startsWith('13')) osVersion = '13 (Ventura)';
    }
  } else if (/windows nt/i.test(ua)) {
    osName = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/i);
    if (match) {
      const v = match[1];
      if (v === '10.0') osVersion = '11 / 10';
      else if (v === '6.3') osVersion = '8.1';
      else if (v === '6.1') osVersion = '7';
      else osVersion = v;
    }
  } else if (/android/i.test(ua)) {
    osName = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)?)/i);
    osVersion = match ? match[1] : '';
  } else if (/ubuntu/i.test(ua)) {
    osName = 'Ubuntu Linux';
    const match = ua.match(/Ubuntu\/(\d+\.\d+)/i);
    osVersion = match ? match[1] : 'LTS';
  } else if (/linux/i.test(ua)) {
    osName = 'Linux';
    osVersion = 'Generic';
  } else if (/cros/i.test(ua)) {
    osName = 'ChromeOS';
  }

  // 5. Detect Browser & Version
  let browserName = 'Unknown Browser';
  let browserVersion = '';

  if (/edg\//i.test(ua)) {
    browserName = 'Edge';
    browserVersion = ua.match(/edg\/(\d+(\.\d+)?)/i)?.[1] || '';
  } else if (/opr\/|opera/i.test(ua)) {
    browserName = 'Opera';
    browserVersion = ua.match(/(opr|opera)\/(\d+(\.\d+)?)/i)?.[2] || '';
  } else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) {
    browserName = deviceCategory === 'Mobile' ? 'Chrome Mobile' : 'Chrome';
    browserVersion = ua.match(/(chrome|crios)\/(\d+(\.\d+)?)/i)?.[2] || '';
  } else if (/firefox|fxios/i.test(ua)) {
    browserName = deviceCategory === 'Mobile' ? 'Firefox Mobile' : 'Firefox';
    browserVersion = ua.match(/(firefox|fxios)\/(\d+(\.\d+)?)/i)?.[2] || '';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browserName = deviceCategory === 'Mobile' ? 'Mobile Safari' : 'Safari';
    browserVersion = ua.match(/version\/(\d+(\.\d+)?)/i)?.[1] || '';
  }

  return {
    osName,
    osVersion,
    browserName,
    browserVersion,
    deviceCategory,
    architecture,
  };
}

/**
 * Offline Air-Gapped IP Location Mapper.
 * Maps subnets deterministically without outbound network lookups.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function resolveIpLocation(clientIp = '127.0.0.1'): ResolvedLocation {
  const ip = clientIp.trim();

  // Local / Loopback / Private Docker subnet check
  const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
  const isPrivate =
    isLoopback ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip.startsWith('fc00:') ||
    ip.startsWith('fe80:');

  if (isPrivate) {
    return {
      clientIp: ip,
      isLocal: true,
      countryCode: 'LO',
      countryName: 'Local Development / Gateway',
      city: 'Localhost',
      flagEmoji: '🏠',
    };
  }

  // Deterministic offline geographic region mapping based on first IP octet
  const firstOctet = parseInt(ip.split('.')[0], 10) || 0;

  if (firstOctet >= 1 && firstOctet <= 50) {
    return { clientIp: ip, isLocal: false, countryCode: 'US', countryName: 'United States', city: 'North Virginia', flagEmoji: '🇺🇸' };
  } else if (firstOctet >= 51 && firstOctet <= 95) {
    return { clientIp: ip, isLocal: false, countryCode: 'DE', countryName: 'Germany', city: 'Frankfurt', flagEmoji: '🇩🇪' };
  } else if (firstOctet >= 96 && firstOctet <= 130) {
    return { clientIp: ip, isLocal: false, countryCode: 'GB', countryName: 'United Kingdom', city: 'London', flagEmoji: '🇬🇧' };
  } else if (firstOctet >= 131 && firstOctet <= 165) {
    return { clientIp: ip, isLocal: false, countryCode: 'JP', countryName: 'Japan', city: 'Tokyo', flagEmoji: '🇯🇵' };
  } else if (firstOctet >= 166 && firstOctet <= 190) {
    return { clientIp: ip, isLocal: false, countryCode: 'IN', countryName: 'India', city: 'Mumbai', flagEmoji: '🇮🇳' };
  } else if (firstOctet >= 191 && firstOctet <= 210) {
    return { clientIp: ip, isLocal: false, countryCode: 'FR', countryName: 'France', city: 'Paris', flagEmoji: '🇫🇷' };
  }

  return {
    clientIp: ip,
    isLocal: false,
    countryCode: 'US',
    countryName: 'United States',
    city: 'San Jose',
    flagEmoji: '🇺🇸',
  };
}

/**
 * Generates deterministic visitor hash based on client IP subnet and User-Agent seed.
 */
export function createVisitorFingerprint(clientIp: string, userAgent: string): string {
  const ipParts = clientIp.split('.');
  const subnet = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0` : clientIp;
  const seed = `${subnet}::${userAgent.slice(0, 40)}`;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `vis_${Math.abs(hash).toString(36)}`;
}

/**
 * Anonymizes client IP address for privacy-safe presentation and demos.
 */
export function maskIpAddress(ip: string): string {
  if (!ip) return '***';
  if (ip === '127.0.0.1' || ip === '::1') return '127.0.0.***';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.slice(0, ip.indexOf(':') + 1) + '***';
}

export type TrafficCategory = 'user' | 'mesh' | 'probe';

/**
 * Classifies HTTP requests into distinct traffic tiers:
 * - 'probe': Health checks, readiness probes, Caddy upstreams, and background dashboard refresh loops.
 * - 'mesh': Internal microservice-to-microservice calls over loopback/private network.
 * - 'user': Authentic human visitors and external clients.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function classifyTrafficCategory(
  path: string,
  userAgent = '',
  clientIp = '',
  probeHeader = ''
): TrafficCategory {
  const p = path.toLowerCase();
  const ua = userAgent.toLowerCase();

  // 1. Explicit probe header
  if (probeHeader === '1' || probeHeader === 'probe' || p.includes('purpose=probe')) {
    return 'probe';
  }

  // 2. Health, Liveness, Readiness & Diagnostic Polling Paths
  if (
    p.endsWith('/health') ||
    p.endsWith('/livez') ||
    p.endsWith('/readyz') ||
    p.startsWith('/api/services') ||
    p.startsWith('/api/overview/stats') ||
    p.startsWith('/api/apps') ||
    p.startsWith('/api/db/stats') ||
    p.startsWith('/api/routes/registry') ||
    p.startsWith('/api/db/schema')
  ) {
    return 'probe';
  }

  // 3. User-Agent indicating automated probe/health monitoring
  if (/kube-probe|caddy|docker|healthcheck|uptime|pingdom|uptimerobot/i.test(ua)) {
    return 'probe';
  }

  // 4. Internal Mesh Traffic: Localhost/Loopback S2S calls without browser characteristics
  const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('10.') || clientIp.startsWith('172.');
  const isNonBrowser = !ua.includes('mozilla') && !ua.includes('chrome') && !ua.includes('safari') && !ua.includes('firefox');
  if (isLoopback && (isNonBrowser || ua.includes('curl') || ua.includes('bun/'))) {
    return 'mesh';
  }

  // 5. Default to authentic User Traffic
  return 'user';
}
