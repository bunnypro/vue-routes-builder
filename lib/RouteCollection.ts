import { Component, Dictionary, RouteConfig } from "vue-router/types/router";
import { tap, flatten } from "./util";
import { RouteGuardType } from "./RouteGuard";
import { Route, RouteBuilderConfig } from "./Route";

export interface RouteGroupConfig {
  prefix?: string;
  guards?: RouteGuardType[];
}

export interface IRouteCollection {
  count: number;
  build(...parents: IRouteCollection[]): RouteConfig[];
  guards(): RouteGuardType[];
  resolveRoutePath(path: string): string;
}

export class RouteCollection implements IRouteCollection {
  private readonly _prefix: string;
  private readonly _guards: RouteGuardType[];
  private readonly _routes: (Route | IRouteCollection)[] = [];

  constructor(prefix?: string, guards?: RouteGuardType[]) {
    this._prefix = prefix || "/";
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

  append(routes: RouteCollection): void {
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

  resolveRoutePath(path: string): string {
    return `/${this._prefix}/${path}`.replace(/\/+/g, "/");
  }
}

export class RouteChildren extends RouteCollection {
  resolveRoutePath(path: string): string {
    const rPath = super.resolveRoutePath(path);

    return rPath === "/" ? "/" : rPath.replace(/^\/+/g, "");
  }
}

export class WrappedRouteCollection implements IRouteCollection {
  private readonly _prefix: string;
  private readonly _guards: RouteGuardType[];
  private readonly _routes: IRouteCollection;

  constructor(config: RouteGroupConfig, routes: IRouteCollection) {
    this._prefix = config.prefix || "/";
    this._routes = routes;
    this._guards = config.guards || [];
  }

  get count(): number {
    return this._routes.count;
  }

  guards(): RouteGuardType[] {
    return [...this._routes.guards(), ...this._guards];
  }

  build(...parents: IRouteCollection[]): RouteConfig[] {
    return this._routes.build(...parents, this);
  }

  resolveRoutePath(path: string): string {
    return `${this._prefix}/${path}`;
  }
}
