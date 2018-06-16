import {
  Dictionary,
  Component,
  RouteConfig,
  RedirectOption,
  NavigationGuard,
  RoutePropsFunction,
  PathToRegexpOptions,
} from "vue-router/types/router";
import { tap, pipe, flatMap } from "./util";
import { RouteGuardType, RouteGuard, RouteGuardResult } from "./RouteGuard";
import { RouteChildren, IRouteCollection, RouteChildrenWrapper, RouteCollection } from "./RouteCollection";

export interface RouteBuilderConfig {
  name?: string;
  redirect?: RedirectOption;
  alias?: string | string[];
  meta?: any;
  beforeEnter?: NavigationGuard;
  props?: boolean | Object | RoutePropsFunction;
  caseSensitive?: boolean;
  pathToRegexpOptions?: PathToRegexpOptions;
}

export class Route {
  private readonly _path: string;
  private readonly _components: Dictionary<Component>;
  private readonly _config: RouteBuilderConfig;
  private _children: RouteChildren | RouteChildrenWrapper;
  private readonly _guards: RouteGuardType[] = [];

  constructor(path: string, view?: Component, config: RouteBuilderConfig = {}) {
    this._path = path;
    if (view) {
      this._components = { default: view };
    }
    this._config = config;
  }

  guard(...guards: RouteGuardType[]): Route {
    this._guards.push(...guards);

    return this;
  }

  children(children: RouteCollection | ((routes: RouteChildren) => void)): void {
    if (children instanceof RouteCollection) {
      this._children = new RouteChildrenWrapper({}, children);
      return;
    }

    this._children = tap(new RouteChildren(), children);
  }

  build(...parents: IRouteCollection[]): RouteConfig {
    return tap({ ...this._config, components: { ...this._components } } as RouteConfig, config => {
      const pathResolvers = parents
        .map(route => route.resolveRoutePath.bind(route))
        .reverse()
        .concat(this.resolvePath);

      config.path = pipe(
        this._path,
        ...pathResolvers,
      );

      if (this._children && this._children.count > 0) {
        config.children = this._children.build();
      }

      if (!config.beforeEnter || !(config.beforeEnter instanceof Function)) {
        const guards = flatMap<IRouteCollection, RouteGuardType>(parents, parent => parent.guards()).concat(
          ...this._guards,
        );

        if (guards.length > 0) {
          config.beforeEnter = (to, from, next) => {
            return this.recursiveGuardsResolver(guards, to, from).then(({ result }) => {
              if (result !== true && result !== undefined && result !== null) {
                next(result);
                return;
              }

              next();
            });
          };
        }
      }
    });
  }

  private resolvePath(path: string): string {
    const rPath = path.replace(/\/+/g, "/");

    return rPath === "/" ? "/" : rPath.replace(/\/+$/g, "");
  }

  private recursiveGuardsResolver(guards: RouteGuardType[], to, from): Promise<{ result?: any }> {
    const _guards = [...guards];
    return new Promise((resolve, reject) => {
      const guard = _guards.shift();
      const result = guard instanceof RouteGuard ? guard.handle(to, from) : guard(to, from);

      const handle = value => {
        if ((value !== true && value !== undefined && value !== null) || _guards.length === 0) {
          resolve({ result: value });
          return;
        }

        this.recursiveGuardsResolver(_guards, to, from)
          .then(resolve)
          .catch(reject);
        return;
      };

      if (result instanceof Promise) {
        result.then(handle).catch(reject);
        return;
      }

      handle(result);
      return;
    });
  }
}
