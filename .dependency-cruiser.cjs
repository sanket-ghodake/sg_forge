/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are strictly forbidden across the codebase.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-cross-forge-app-imports',
      severity: 'error',
      comment: 'Micro-apps in forge-apps/* must never import directly from another micro-app.',
      from: {
        path: '^forge-apps/([^/]+)/',
      },
      to: {
        path: '^forge-apps/([^/]+)/',
        pathNot: '^forge-apps/$1/',
      },
    },
    {
      name: 'ui-cannot-import-db-drivers',
      severity: 'error',
      comment: 'Frontend UI code (portal/components) must never directly import database drivers or models.',
      from: {
        path: '^(apps/src/portal|apps/src/ui)',
      },
      to: {
        path: '(@libsql/client|drizzle-orm/libsql|init-all-databases)',
      },
    },
    {
      name: 'no-relative-traversal-sprawl',
      severity: 'error',
      comment: 'Relative imports must not traverse more than 2 directory levels. Use @forge/* aliases instead.',
      from: {},
      to: {
        path: '\\.\\./\\.\\./\\.\\.',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|dist|\\.astro|\\.next',
    },
    exclude: {
      path: 'node_modules|dist|\\.astro|\\.next',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
