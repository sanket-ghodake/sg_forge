/**
 * @forge/docs
 * Living Documentation Core Microservice.
 * @requirements [SR-DOC-001] [HLR-HUB-601] [LLR-SDK-005]
 */

export * from './config';
export * from './server';

/**
 * Service descriptor for @forge/docs.
 * @requirements [SR-DOC-001] [HLR-HUB-601] [LLR-SDK-005]
 */
export const docsService = {
  name: 'docs',
  version: '2.0.0',
  port: 3005,
  path: '/docs',
  status: 'ready',
};
