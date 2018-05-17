# Vue Routes Builder

This library allows you to build a vue-router routes with chaining.

### installing

`yarn add -D vue-routes-builder`

### Usage

```ts
// file ./routes.ts
import Routes from "vue-routes-builder";

// creating routes
const routes = new Routes();

// add a route
routes.add("home", () => import("./view/Home.vue"));

// add grouped routes
routes.group({ prefix: "dashboard" }, group => {
  // add a route with default and named view
  group.add("/", () => import("./view/Dashboard.vue"), {
    menu: () => import("./view/dashboard/Menu.vue"),
  });

  // add a route with children routes
  group.add("profile", () => import("./view/dashboard/Profile.vue")).children(children => {
    children.add("/", () => import("./view/dashboard/profile/General.vue"));
    children.add("setting", () => import("./view/dashboard/profile/Setting.vue"));
  });
});

export default routes;
```

```ts
// file ./index.ts
import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
    ...,
    routes: routes.build(),
});

new Vue({...});
```