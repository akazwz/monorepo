import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { PWAPluginContext } from '../../types';

describe('Remix PWA Vite Bundler Plugin', () => {
  let plugin: any;
  let mockPWAContext: PWAPluginContext;

  beforeEach(async () => {
    mockPWAContext = {
      isDev: true,
      isRemixDevServer: true,
    } as unknown as PWAPluginContext;

    const _plugin = (await import('../bundler')).BundlerPlugin;
    plugin = _plugin(mockPWAContext);
  });

  describe('Plugin configuration suite', () => {
    test('should return a plugin object', () => {
      expect(plugin).not.toBe(null);
      expect(plugin).toBeTypeOf('object');
    });

    test('should have the correct name', () => {
      expect(plugin.name).toBe('vite-plugin-remix-pwa:bundler');
    });

    test('should have a buildStart hook', () => {
      expect(plugin.buildStart).toBeTypeOf('function');
    });

    test('should have a configureServer hook', () => {
      expect(plugin.configureServer).toBeTypeOf('function');
    });
  });

  describe('configureServer hook suite', () => {
    test('should not do anything if not in a Remix dev server', async () => {
      mockPWAContext.isRemixDevServer = false;
      const configureServerSpy = vi.spyOn(plugin, 'configureServer');

      await plugin.configureServer({ hot: { invalidate: vi.fn() } });

      expect(configureServerSpy).toHaveBeenCalled();
      const returnedPromise = configureServerSpy.mock.results[0].value;
      expect(returnedPromise).toBeInstanceOf(Promise);
      expect(await returnedPromise).toBeUndefined();
    });
  });

  describe('buildStart hook suite', () => {
    test('should not do anything if not in a Remix dev server', async () => {
      mockPWAContext.isRemixDevServer = false;
      const buildStartSpy = vi.spyOn(plugin, 'buildStart');

      await plugin.buildStart();

      expect(buildStartSpy).toHaveBeenCalled();
      const returnedPromise = buildStartSpy.mock.results[0].value;
      expect(returnedPromise).toBeInstanceOf(Promise);
      expect(await returnedPromise).toBeUndefined();
    });

    test.skip('should build the worker and log the time', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleTimeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => {});

      // Todo: Mock the buildWorker, if you can

      plugin.buildStart();

      expect(consoleTimeSpy).toHaveBeenCalledWith('💿 Built Service Worker in');
      expect(consoleSpy).toHaveBeenCalledWith('🏗️ Building Service Worker in development mode...');
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('💿 Built Service Worker in');

      consoleSpy.mockRestore();
      consoleTimeSpy.mockRestore();
      consoleTimeEndSpy.mockRestore();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });
});
