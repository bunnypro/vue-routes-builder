import { Component, Dictionary, RouteConfig } from "vue-router/types/router";
import { tap, flatten } from "./util";
import { IRouteCollection } from "./IRouteCollection";
import { RouteGuardType } from "./RouteGuard";
import { WrappedRouteCollection } from "./WrappedRouteCollection";
import { Route, RouteBuilderConfig } from "./Route";

export interface RouteGroupConfig {
  prefix?: string;
  guards?: RouteGuardType[];
}

export class RouteCollection implements IRouteCollection {
  private readonly _prefix: string;
  private readonly _guards: RouteGuardType[];
  private readonly _routes: (Route | IRouteCollection)[] = [];

  constructor(prefix?: string, guards?: RouteGuardType[]) {
    this._prefix = this.resolvePrefixPath(prefix || "/");
    this._guards = guards || [];
  }

  get count(): number {
    return this._routes.length;
  }

  add(path: string, view?: Component, views?: Dictionary<Component>, config: RouteBuilderConfig = {}): Route {
    return tap(new Route(path, view, views, config), Array.prototype.push.bind(this._routes));
  }

  group(config: RouteGroupConfig, group: RouteCollection | ((routes: RouteCollection) => void)): void {
    if (group instanceof RouteCollection) {
      this._routes.push(new WrappedRouteCollection(config, group));
      return;
    }

    this._routes.push(tap(new RouteCollection(config.prefix, config.guards), group));
  }

  append(routes: RouteCollection) {
    this._routes.push(routes);
  }

  guards(): RouteGuardType[] {
    return [...this._guards];
  }

  build(...parents: IRouteCollection[]): RouteConfig[] {
    return flatten<RouteConfig>(
      this._routes.map(route => {
        return route.build(...parents, this);
      }),
    );
  }

  protected resolvePrefixPath(path: string): string {
    const rPath = `/${path}`.replace(/\/+/g, "/");

    return rPath === "/" ? rPath : rPath.replace(/\/+$/g, "");
  }

  resolveRoutePath(path: string): string {
    return `${this._prefix}/${path}`.replace(/\/+/g, "/");
  }
}

export class RouteChildren extends RouteCollection {
  protected resolvePrefixPath(path: string): string {
    const rPath = super.resolvePrefixPath(path);

    return rPath === "/" ? "/" : rPath.replace(/^\/+/g, "");
  }

  resolveRoutePath(path: string): string {
    const rPath = super.resolveRoutePath(path);

    return rPath === "/" ? "/" : rPath.replace(/^\/+/g, "");
  }
}
