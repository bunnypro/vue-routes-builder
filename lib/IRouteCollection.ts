import { RouteConfig } from "vue-router/types/router";
import { RouteGuardType } from "./RouteGuard";

export interface IRouteCollection {
  count: number;
  build(...parents: IRouteCollection[]): RouteConfig[];
  guards(): RouteGuardType[];
  resolveRoutePath(path: string): string;
}
