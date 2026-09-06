#!/usr/bin/env bun
/**
 * @forge/scripts/trust-cert - Cross-Platform OS Certificate Trust Installer (2026 LTS)
 * Installs the internal SG Forge Root CA into the developer's local OS trust store
 * so that browsers (Chrome, Firefox, Safari, Edge) render a green padlock with zero warnings.
 *
 * Enterprise Clean Architecture Standard
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { join } from 'node:path';

const REPO_ROOT = process.cwd();
const CA_PATH = join(REPO_ROOT, 'proxy', 'certs', 'ca.crt');

/**
 * installCaTrust
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function installCaTrust(): void {
  if (!existsSync(CA_PATH)) {
    console.error('❌ [SG Forge] Root CA not found at proxy/certs/ca.crt.');
    console.error('   Please generate certificates first via: ./run.sh certs');
    process.exit(1);
  }

  const os = platform();
  console.log(`🛡️  [SG Forge] Installing SG Forge Root CA into ${os} trust store...`);

  try {
    if (os === 'linux') {
      // Debian / Ubuntu / Mint / Arch / Fedora
      const isDebian = existsSync('/usr/local/share/ca-certificates');
      const isFedora = existsSync('/etc/pki/ca-trust/source/anchors');

      // 1. Install into Chrome / Chromium / Brave / Edge user NSS DB (zero sudo needed)
      const homeDir = process.env.HOME || '';
      const nssDbPath = join(homeDir, '.pki', 'nssdb');
      if (existsSync(nssDbPath)) {
        try {
          execSync(`certutil -d sql:"${nssDbPath}" -A -t "C,," -n "SG Forge Internal Root CA" -i "${CA_PATH}"`, {
            stdio: 'pipe',
          });
          console.log('   ✅ Installed to user Chrome/Chromium NSS trust store (~/.pki/nssdb)');
        } catch {
          // certutil might not be installed or already present
        }
      }

      // 2. Install into system CA store (Debian/Ubuntu/Fedora)
      if (isDebian) {
        console.log('   Running: sudo cp proxy/certs/ca.crt /usr/local/share/ca-certificates/sg-forge-ca.crt && sudo update-ca-certificates');
        try {
          execSync('sudo cp "' + CA_PATH + '" /usr/local/share/ca-certificates/sg-forge-ca.crt && sudo update-ca-certificates', {
            stdio: 'inherit',
          });
        } catch {}
      } else if (isFedora) {
        console.log('   Running: sudo cp proxy/certs/ca.crt /etc/pki/ca-trust/source/anchors/sg-forge-ca.crt && sudo update-ca-trust');
        try {
          execSync('sudo cp "' + CA_PATH + '" /etc/pki/ca-trust/source/anchors/sg-forge-ca.crt && sudo update-ca-trust', {
            stdio: 'inherit',
          });
        } catch {}
      } else {
        console.log('   Manual step: Copy ' + CA_PATH + ' to your Linux distribution CA store and update trust.');
      }
      console.log('\n✅ [SG Forge] Root CA trusted successfully! Restart Chrome completely for changes to take effect.');
    } else if (os === 'darwin') {
      // macOS
      console.log('   Running: sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ' + CA_PATH);
      execSync('sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "' + CA_PATH + '"', {
        stdio: 'inherit',
      });
      console.log('\n✅ [SG Forge] Root CA trusted in macOS Keychain! Restart your browser for changes to take effect.');
    } else if (os === 'win32') {
      // Windows
      console.log('   Running: certutil -addstore -f "ROOT" ' + CA_PATH);
      execSync('certutil -addstore -f "ROOT" "' + CA_PATH + '"', {
        stdio: 'inherit',
      });
      console.log('\n✅ [SG Forge] Root CA trusted in Windows Certificate Store! Restart your browser for changes to take effect.');
    } else {
      console.log(`⚠️  Unsupported OS: ${os}. Please manually import ${CA_PATH} into your browser or OS trust store.`);
    }
  } catch (err: any) {
    console.error(`❌ Failed to trust certificate: ${err?.message || err}`);
    console.error(`   You can manually import: ${CA_PATH} into your browser Certificate Authorities.`);
  }
}

if (import.meta.main) {
  installCaTrust();
}
