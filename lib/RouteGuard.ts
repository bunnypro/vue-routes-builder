import Vue from "vue";
import { Route, RawLocation, VueRouter } from "vue-router/types/router";

export type RouteGuardHanldeResult = RawLocation | boolean | ((vm: Vue) => any) | void;

export abstract class RouteGuard {
  abstract handle(router: VueRouter, from: Route, to: Route): RouteGuardHanldeResult | Promise<RouteGuardHanldeResult>;
}

export type RouteGuardType = RouteGuard | ((router: VueRouter, to: Route, from: Route) => RouteGuardHanldeResult);
