import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import { getHeadStateScript, getAstryxTooltipScript, getAstryxToastScript, getAstryxStyles } from '@forge/ui';

export default defineConfig({
  site: 'http://docs.sgforge.local',
  base: '/docs',
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: 'SG Forge Engineering Portal',
      logo: { src: './public/favicon.svg' },
      customCss: ['./src/styles/custom.css'],
      components: {
        Header: './src/components/AstryxHeader.astro',
        PageTitle: './src/components/AstryxPageTitle.astro',
      },
      head: [
        {
          tag: 'style',
          content: getAstryxStyles(),
        },
        {
          tag: 'script',
          content: getHeadStateScript({ defaultTheme: 'dark' }, false),
        },
        {
          tag: 'script',
          content: getAstryxTooltipScript(),
        },
        {
          tag: 'script',
          content: getAstryxToastScript(),
        },
      ],
      sidebar: [
        {
          label: 'Platform Architecture',
          items: [
            { label: 'Platform Topology & Gateway', slug: 'architecture/topology' },
            { label: 'Core Air-Gap Network', slug: 'architecture/airgap' },
            { label: 'Multi-Tenant Turso DB', slug: 'architecture/database' },
            { label: 'Database Schema Catalog', slug: 'architecture/database-schemas' },
            { label: 'Foundation SDK Architecture', slug: 'architecture/sdk-architecture' },
          ],
        },
        {
          label: 'Core Capabilities',
          items: [
            { label: 'Auth Engine & Session Lifecycle', slug: 'features/auth-session' },
            { label: 'Portal SPA & Sandboxing', slug: 'features/portal-spa' },
            { label: 'Portal Canvas & Command Palette', slug: 'features/portal-modules' },
            { label: 'Astryx UI & Viewports', slug: 'features/astryx-ui' },
            { label: 'Client State & Storage Engine', slug: 'features/client-state' },
            { label: '4-Pillar Observability & RFC 7807', slug: 'features/observability' },
          ],
        },
        {
          label: 'Developer Tools & Operations',
          items: [
            { label: 'Developer Hub & SDK Playground', slug: 'tools/dev-hub' },
            { label: 'Developer Operations Dashboard', slug: 'tools/dev-dashboard' },
            { label: 'Developer CLI & Toolchain', slug: 'tools/cli-toolchain' },
            { label: 'Security & Strix Audit Workflows', slug: 'security/audit-workflows' },
            { label: 'Disaster Recovery & Backups', slug: 'operations/backup-recovery' },
            { label: 'Deployment & Quickstart Guide', slug: 'operations/deployment-quickstart' },
          ],
        },
        {
          label: 'Autonomous Submodules',
          items: [
            { label: 'Submodule Governance', slug: 'submodules/architecture' },
            { label: 'Code Microservice', slug: 'submodules/forge-code' },
            { label: 'Telemetry Microservice', slug: 'submodules/forge-telemetry' },
            { label: 'App Template Microservice', slug: 'submodules/forge-template' },
          ],
        },
        {
          label: 'Standards & Traceability',
          items: [
            { label: 'Living Standards Overview', slug: 'standards/overview' },
            { label: 'Systems Traceability Matrix', slug: 'traceability/matrix' },
            { label: '5-Tier Test Rigor', slug: 'traceability/tests' },
          ],
        },
        {
          label: 'Executive Briefings',
          collapsed: false,
          items: [
            { label: 'Visual Architecture Atlas', slug: 'executive/visual-atlas' },
            { label: 'Platform Vision & Invariants', slug: 'executive/overview' },
            { label: 'Security & Air-Gap Model', slug: 'executive/security' },
          ],
        },
        {
          label: 'System Requirements (SR)',
          collapsed: true,
          autogenerate: { directory: 'sr' },
        },
        {
          label: 'High-Level Requirements (HLR)',
          collapsed: true,
          autogenerate: { directory: 'hlr' },
        },
        {
          label: 'Low-Level Requirements (LLR)',
          collapsed: true,
          autogenerate: { directory: 'llr' },
        },
        {
          label: 'API Contracts',
          collapsed: true,
          items: [
            { label: 'OpenAPI 3.1 Contract Explorer', slug: 'api' },
          ],
        },
      ],
    }),
  ],
});
