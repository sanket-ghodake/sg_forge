/**
 * @forge/sdk - Enterprise Foundation SDK: Client & Micro-App Bridge (v2.0.0 LTS)
 * Client-Side PostMessage Handshake & Unified Workspace Bridge.
 */

import type { PostMessageEvent, UserContext } from '@forge/types';

/**
 * Options for configuring the ForgeClient PostMessage bridge.
 * @requirements [HLR-PORTAL-202] [LLR-SUB-006]
 */
export interface ForgeClientOptions {
  onThemeChange?: (theme: 'light' | 'dark') => void;
  targetOrigin?: string;
}

/**
 * Client-Side PostMessage handshake and unified workspace bridge for micro-apps.
 * @requirements [HLR-PORTAL-202] [LLR-SUB-006]
 */
export class ForgeClient {
  public user!: UserContext;
  public token!: string;
  public theme: 'light' | 'dark' = 'dark';

  private constructor() {}

  public static async init(options: ForgeClientOptions = {}): Promise<ForgeClient> {
    const client = new ForgeClient();

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<PostMessageEvent>) => {
        if (event.data?.type === 'FORGE_APP_CONTEXT') {
          const { user, token, theme } = event.data.payload;
          client.user = user;
          client.token = token;
          client.theme = theme;

          if (options.onThemeChange) {
            options.onThemeChange(theme);
          }

          window.removeEventListener('message', handleMessage);
          resolve(client);
        }
      };

      window.addEventListener('message', handleMessage);

      // Signal ready to parent portal
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: 'FORGE_APP_INIT', payload: { appId: window.location.pathname } },
          '*'
        );
      } else {
        // Fallback for standalone local development
        client.user = {
          id: 'dev_user',
          name: 'Developer Local',
          email: 'dev@local.forge',
          role: 'admin',
        };
        client.token = 'mock_local_dev_token';
        resolve(client);
      }
    });
  }

  public async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    return window.fetch(url, { ...init, headers });
  }
}
