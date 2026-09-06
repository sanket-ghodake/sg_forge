/**
 * Ambient type declarations for Astro content collections
 * Provides types for virtual module 'astro:content' across monorepo TypeScript compilation.
 */

declare module 'astro:content' {
  export type SchemaContext = {
    image: () => any;
  };
  export function defineCollection(config: any): any;
  export const z: any;
  export function getCollection(collection: string, filter?: any): Promise<any[]>;
  export function getEntry(collection: string, slug: string): Promise<any>;
}
