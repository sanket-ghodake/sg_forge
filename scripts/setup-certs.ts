#!/usr/bin/env bun
/**
 * @forge/scripts/setup-certs - Automated Local & Intranet TLS Certificate Engine (2026 LTS)
 * Generates an internal air-gapped Root CA and wildcard/SAN server certificates for local dev
 * and private intranet environments. Strictly git-ignored and zero-leakage compliant.
 *
 * Enterprise Clean Architecture Standard
 */

import { execSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { generateCaddyfile } from './generate-proxy';

const REPO_ROOT = process.cwd();
const CERTS_DIR = join(REPO_ROOT, 'proxy', 'certs');
const ENV_PATH = join(REPO_ROOT, '.env');

/** Detect all active local IPv4 addresses (excluding loopback)  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function getLocalIpAddresses(): string[] {
  const nets = networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

/** Check if openssl binary is accessible  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function checkOpenSsl(): boolean {
  try {
    execSync('openssl version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Generate local Root CA and SAN server certificate  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function setupCerts(options: { force?: boolean; silent?: boolean } = {}): {
  success: boolean;
  certPath: string;
  keyPath: string;
  caPath: string;
} {
  mkdirSync(CERTS_DIR, { recursive: true });

  const caKey = join(CERTS_DIR, 'ca.key');
  const caCrt = join(CERTS_DIR, 'ca.crt');
  const serverKey = join(CERTS_DIR, 'key.pem');
  const serverCsr = join(CERTS_DIR, 'server.csr');
  const serverCrt = join(CERTS_DIR, 'cert.pem');
  const sanCnf = join(CERTS_DIR, 'san.cnf');

  if (!options.force && existsSync(serverCrt) && existsSync(serverKey) && existsSync(caCrt)) {
    if (!options.silent) {
      console.log('🔒 [SG Forge] TLS Certificates already exist at proxy/certs/ (use --force to recreate)');
    }
    updateEnvForHttps();
    return { success: true, certPath: serverCrt, keyPath: serverKey, caPath: caCrt };
  }

  if (!checkOpenSsl()) {
    console.error('❌ [SG Forge] OpenSSL is required to generate local certificates.');
    process.exit(1);
  }

  const localIps = getLocalIpAddresses();
  const ipSans = localIps.map((ip, idx) => `IP.${idx + 3} = ${ip}`).join('\n');

  // 1. Create OpenSSL SAN configuration
  const cnfContent = `[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = US
ST = California
L = San Francisco
O = SG Forge
OU = Engineering
CN = localhost

[req_ext]
subjectAltName = @alt_names

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[server_ext]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = *.internal
DNS.4 = *.local
DNS.5 = forge.internal
DNS.6 = app.forge.internal
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
${ipSans}
`;

  writeFileSync(sanCnf, cnfContent, 'utf-8');

  // 2. Generate Internal Root CA (if not present)
  if (!existsSync(caKey) || !existsSync(caCrt) || options.force) {
    if (!options.silent) console.log('🏛️  [SG Forge] Generating Internal Root CA...');
    execSync(
      `openssl genrsa -out "${caKey}" 2048 && openssl req -x509 -new -nodes -key "${caKey}" -sha256 -days 1825 -out "${caCrt}" -config "${sanCnf}" -extensions v3_ca -subj "/C=US/ST=CA/O=SG Forge Local CA/CN=SG Forge Internal Root CA"`,
      { stdio: 'pipe' }
    );
    chmodSync(caKey, 0o600);
  }

  // 3. Generate Server Key & CSR
  if (!options.silent) console.log('🔑 [SG Forge] Generating Server TLS Key & CSR...');
  execSync(`openssl genrsa -out "${serverKey}" 2048`, { stdio: 'pipe' });
  chmodSync(serverKey, 0o600);

  execSync(`openssl req -new -key "${serverKey}" -out "${serverCsr}" -config "${sanCnf}"`, {
    stdio: 'pipe',
  });

  // 4. Sign Server Certificate with Root CA
  if (!options.silent) console.log('📜 [SG Forge] Signing Server Certificate with Root CA...');
  execSync(
    `openssl x509 -req -in "${serverCsr}" -CA "${caCrt}" -CAkey "${caKey}" -CAcreateserial -out "${serverCrt}" -days 825 -sha256 -extfile "${sanCnf}" -extensions server_ext`,
    { stdio: 'pipe' }
  );

  // Clean up transient CSR and serial
  try {
    execSync(`rm -f "${serverCsr}" "${join(CERTS_DIR, 'ca.srl')}" "${sanCnf}"`);
  } catch {}

  // 5. Update .env and Caddyfile
  updateEnvForHttps();
  generateCaddyfile();

  if (!options.silent) {
    console.log('✅ [SG Forge] Intranet TLS Certificates generated successfully!');
    console.log(`   - Root CA:     ${caCrt}`);
    console.log(`   - Server Cert: ${serverCrt}`);
    console.log(`   - Server Key:  ${serverKey} (permissions: 600)`);
    if (localIps.length > 0) {
      console.log(`   - Intranet IPs included in SAN: ${localIps.join(', ')}`);
    }
    console.log('\n💡 To trust the Root CA on your operating system (green padlock):');
    console.log('   Run: ./run.sh trust-cert\n');
  }

  return { success: true, certPath: serverCrt, keyPath: serverKey, caPath: caCrt };
}

/** Wire ENABLE_HTTPS and certificate paths in .env  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function updateEnvForHttps(): void {
  if (!existsSync(ENV_PATH)) return;

  let content = readFileSync(ENV_PATH, 'utf-8');
  let modified = false;

  if (content.includes('# ENABLE_HTTPS="false"') || content.includes('ENABLE_HTTPS="false"')) {
    content = content.replace(/#? ?ENABLE_HTTPS="false"/g, 'ENABLE_HTTPS="true"');
    modified = true;
  } else if (!content.includes('ENABLE_HTTPS=')) {
    content += '\nENABLE_HTTPS="true"\n';
    modified = true;
  }

  if (content.includes('# TLS_CERT_PATH=') || !content.includes('TLS_CERT_PATH=')) {
    content = content.replace(/# TLS_CERT_PATH=.*/g, 'TLS_CERT_PATH="/etc/caddy/certs/cert.pem"');
    if (!content.includes('TLS_CERT_PATH=')) {
      content += 'TLS_CERT_PATH="/etc/caddy/certs/cert.pem"\n';
    }
    modified = true;
  }

  if (content.includes('# TLS_KEY_PATH=') || !content.includes('TLS_KEY_PATH=')) {
    content = content.replace(/# TLS_KEY_PATH=.*/g, 'TLS_KEY_PATH="/etc/caddy/certs/key.pem"');
    if (!content.includes('TLS_KEY_PATH=')) {
      content += 'TLS_KEY_PATH="/etc/caddy/certs/key.pem"\n';
    }
    modified = true;
  }

  process.env.ENABLE_HTTPS = 'true';
  process.env.TLS_CERT_PATH = '/etc/caddy/certs/cert.pem';
  process.env.TLS_KEY_PATH = '/etc/caddy/certs/key.pem';

  if (modified) {
    writeFileSync(ENV_PATH, content, 'utf-8');
  }
}

// Direct CLI invocation
if (import.meta.main) {
  const force = process.argv.includes('--force');
  setupCerts({ force });
}
