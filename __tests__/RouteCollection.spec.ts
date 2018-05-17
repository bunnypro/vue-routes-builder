import { RouteCollection, RouteCollectionConfig } from "../lib/RouteCollection";
import { RouteGuard, RouteGuardHanldeResult } from "../lib/Route";
import { Route as VueRoute } from "vue-router/types/router";

describe("RouteCollection", () => {
  let routes: RouteCollection;

  const Home = { template: "<div>Home</div>" };
  const About = { template: "<div>About</div>" };

  function initRoutes(config?: RouteCollectionConfig) {
    routes = new RouteCollection(config);
  }

  test("can add routes", () => {
    initRoutes();

    routes.add("/", Home);
    routes.add("about", About);

    expect(routes.build()).toEqual([
      {
        path: "/",
        components: { default: Home },
      },
      {
        path: "/about",
        components: { default: About },
      },
    ]);
  });

  test("can add named view route", () => {
    initRoutes();

    routes.add("/home", null, {
      home: Home,
      about: About,
    });

    expect(routes.build()).toEqual([
      {
        path: "/home",
        components: {
          home: Home,
          about: About,
        },
      },
    ]);
  });

  test("can add default and named view route", () => {
    initRoutes();

    routes.add("/home", Home, {
      about: About,
    });

    expect(routes.build()).toEqual([
      {
        path: "/home",
        components: {
          default: Home,
          about: About,
        },
      },
    ]);
  });

  test("shoule resolve correct path", () => {
    initRoutes();

    routes.add("/");
    routes.add("/home");
    routes.add("home");
    routes.add("home/");
    routes.add("/home/");
    routes.add("//home//");
    routes.add("/home//about");

    expect(routes.build()).toEqual([
      {
        path: "/",
        components: {},
      },
      {
        path: "/home",
        components: {},
      },
      {
        path: "/home",
        components: {},
      },
      {
        path: "/home",
        components: {},
      },
      {
        path: "/home",
        components: {},
      },
      {
        path: "/home",
        components: {},
      },
      {
        path: "/home/about",
        components: {},
      },
    ]);

    initRoutes({ base: "/dashboard" });

    routes.add("/");
    routes.add("//about");
    routes.add("home");

    expect(routes.build()).toEqual([
      {
        path: "/dashboard",
        components: {},
      },
      {
        path: "/dashboard/about",
        components: {},
      },
      {
        path: "/dashboard/home",
        components: {},
      },
    ]);

    initRoutes({ base: "dashboard/" });

    routes.add("home");
    routes.add("//about");

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
      {
        path: "/dashboard/about",
        components: {},
      },
    ]);

    initRoutes({ base: "/dashboard/" });

    routes.add("home");
    routes.add("//about");

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
      {
        path: "/dashboard/about",
        components: {},
      },
    ]);

    initRoutes({ base: "//dashboard//" });

    routes.add("home");
    routes.add("//about");

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
      {
        path: "/dashboard/about",
        components: {},
      },
    ]);

    initRoutes({ children: true });

    routes.add("/");
    routes.add("home");
    routes.add("//about");

    expect(routes.build()).toEqual([
      {
        path: "/",
        components: {},
      },
      {
        path: "home",
        components: {},
      },
      {
        path: "about",
        components: {},
      },
    ]);

    initRoutes({ base: "//dashboard//", children: true });

    routes.add("/");
    routes.add("home");
    routes.add("//about");

    expect(routes.build()).toEqual([
      {
        path: "dashboard",
        components: {},
      },
      {
        path: "dashboard/home",
        components: {},
      },
      {
        path: "dashboard/about",
        components: {},
      },
    ]);
  });

  test("can create children from created route", () => {
    initRoutes();

    routes.add("dashboard").children(r => {
      r.add("home").children(r1 => {
        r1.add("about");
      });
      r.add("about");
    });

    expect(routes.build()).toEqual([
      {
        path: "/dashboard",
        components: {},
        children: [
          {
            path: "home",
            components: {},
            children: [
              {
                path: "about",
                components: {},
              },
            ],
          },
          {
            path: "about",
            components: {},
          },
        ],
      },
    ]);
  });

  test("can create grouped routes", () => {
    initRoutes();

    routes.group({ prefix: "dashboard" }, r => {
      r.add("home");
      r.add("about");
    });

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
      {
        path: "/dashboard/about",
        components: {},
      },
    ]);
  });

  test("can create grouped routes with children", () => {
    initRoutes();

    routes.group({ prefix: "dashboard" }, r => {
      r.add("home").children(r1 => {
        r1.group({ prefix: "/about" }, r2 => {
          r2.add("//company/");
        });
      });
      r.add("about");
    });

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
        children: [
          {
            path: "about/company",
            components: {},
          },
        ],
      },
      {
        path: "/dashboard/about",
        components: {},
      },
    ]);
  });

  test("can add guard to grouped routes", () => {
    initRoutes();

    class RedirectIfNotAuthenticatedGuard extends RouteGuard {
      handle(from: VueRoute, to: VueRoute): RouteGuardHanldeResult {
        return "/";
      }
    }

    routes.group(
      {
        prefix: "dashboard",
        guards: [new RedirectIfNotAuthenticatedGuard()],
      },
      r => {
        r.add("home");
      },
    );

    const route = routes.build()[0];

    expect(route.beforeEnter).toBeInstanceOf(Function);
    route.beforeEnter(null, null, result => {
      expect(result).toEqual("/");
    });
  });
});
