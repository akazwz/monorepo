import { ConfigRoute } from "@remix-run/dev/dist/config/routes.js";
import { ResolvedWorkerConfig } from "../utils/config.js";
import { OnLoadResult, OnResolveArgs, Plugin, PluginBuild } from "esbuild";

const FILTER_REGEX = /@remix-sas\/build\/magic$/;
const NAMESPACE = 'entry-module';

/**
 * Creates a string representation of the routes to be imported
 */
function createRouteImports(routes: ConfigRoute[]): string {
  return routes.map((route, index) => `import * as route${index} from '${route.file}?worker'`).join(';\n');
}

/**
 * Creates a string representation of each route item.
 */
function createRouteList(routes: ConfigRoute[]): string {
  return routes
    .map(
      (route, index) =>
        `{ file: "${route.file}", path: "${route.path}", module: route${index}, id: "${route.id}", parentId: "${route.parentId}", }`
    )
    .join(',\n');
}

/**
 * The `sw-entry-module` plugin looks for the `FILTER_REGEX`string throught the esbuild entry point and injects all the `@remix-run` routes modules and information
 * that are available in the given configuration into the ESBuild entry point.
 * @param {import('../utils/config').ResolvedWorkerConfig} config The resolved worker config.
 * @returns {import('esbuild').Plugin} Esbuild plugin
 */
export default function entryModulePlugin(config: ResolvedWorkerConfig): Plugin {
  /**
   * @param {import('esbuild').PluginBuild} build The esbuild plugin build object.
   */
  function setup(build: PluginBuild) {
    const onResolve = ({ path }: OnResolveArgs) => ({ path, namespace: NAMESPACE });
    const onLoad = () => {
      const routes = Object.values(config.routes);
      const contents = `
    ${createRouteImports(routes)}

    export const routes = [
      ${createRouteList(routes)}
    ];

    import * as entryWorker from  '${config.entryWorkerFile}?user';
    export const entry = { module: entryWorker };
    `;

      return {
        contents,
        resolveDir: config.appDirectory,
        loader: 'js',
      } as OnLoadResult;
    };
    build.onResolve({ filter: FILTER_REGEX }, onResolve);
    build.onLoad({ filter: FILTER_REGEX, namespace: NAMESPACE }, onLoad);
  }

  return {
    name: 'sw-entry-module',
    setup,
  };
}