import { Route } from "vue-router";

export abstract class RouteGuard {
    abstract handle(to: Route, from: Route): boolean | string;
}