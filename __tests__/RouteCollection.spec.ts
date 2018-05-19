import { RouteCollection, RouteCollectionConfig } from "../lib/RouteCollection";
import { RouteGuard, RouteGuardHanldeResult } from "../lib/Route";
import { Route as VueRoute } from "vue-router/types/router";
import { tap } from "../lib/util";

describe("RouteCollection", () => {
  const Home = { template: "<div>Home</div>" };
  const About = { template: "<div>About</div>" };

  test("can add routes", () => {
    const routes = new RouteCollection();

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
    const routes = new RouteCollection();

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
    const routes = new RouteCollection();

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
    tap(new RouteCollection(), routes => {
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
    });

    tap(new RouteCollection({ base: "/dashboard" }), routes => {
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
    });

    tap(new RouteCollection({ base: "dashboard/" }), routes => {
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
    });

    tap(new RouteCollection({ base: "/dashboard/" }), routes => {
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
    });

    tap(new RouteCollection({ base: "//dashboard//" }), routes => {
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
    });

    tap(new RouteCollection({ children: true }), routes => {
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
    });

    tap(new RouteCollection({ base: "//dashboard//", children: true }), routes => {
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
  });

  test("can create children from created route", () => {
    const routes = new RouteCollection();

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
    const routes = new RouteCollection();

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
    const routes = new RouteCollection();

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

  class RedirectIfNotAuthenticatedGuard extends RouteGuard {
    handle(from: VueRoute, to: VueRoute): RouteGuardHanldeResult {
      return "/";
    }
  }

  test("can add guard to grouped routes", () => {
    const routes = new RouteCollection();

    routes.group(
      {
        prefix: "dashboard",
        guards: [new RedirectIfNotAuthenticatedGuard()],
      },
      r => {
        r.add("home");
      },
    );

    tap(routes.build(), buildedRoutes => {
      buildedRoutes[0].beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });
    });
  });

  test("can add children chained after guards chained after add", () => {
    const routes = new RouteCollection();

    routes
      .add("/home")
      .guard(new RedirectIfNotAuthenticatedGuard())
      .children(children => {
        children.add("about");
      });

    tap(routes.build(), buildedRoutes => {
      buildedRoutes[0].beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });

      expect(buildedRoutes[0].children[0].beforeEnter).toBeUndefined();
    });
  });
});
