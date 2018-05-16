import { Route, Location } from "vue-router";

export type RouteGuardReturn = string | boolean | void | Location | ((vm: any) => any);

export abstract class RouteGuard {
    abstract handle(to: Route, from: Route): RouteGuardReturn;
}