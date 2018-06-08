import { Route } from "vue-router/types/router";
import { tap, tapAsync } from "../lib/util";
import { RouteCollection, RouteChildren } from "../lib/RouteCollection";
import { RouteGuard } from "../lib/RouteGuard";

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

    tap(new RouteCollection({ prefix: "/dashboard" }), routes => {
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

    tap(new RouteCollection({ prefix: "dashboard/" }), routes => {
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

    tap(new RouteCollection({ prefix: "/dashboard/" }), routes => {
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

    tap(new RouteCollection({ prefix: "//dashboard//" }), routes => {
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

    tap(new RouteChildren(), routes => {
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

    tap(new RouteChildren({ prefix: "//dashboard//" }), routes => {
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

  test("can add grouped routes with passing RouteCollection", () => {
    const routes = new RouteCollection();
    const group = new RouteCollection();

    group.add("home");

    routes.group({ prefix: "dashboard" }, group);

    expect(routes.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
    ]);

    const routes1 = new RouteCollection({ prefix: "dashboard" });
    routes1.group({}, group);

    expect(routes1.build()).toEqual([
      {
        path: "/dashboard/home",
        components: {},
      },
    ]);
  });

  test("can append RouteCollection to another RouteCollection", () => {
    const routes = new RouteCollection();
    const dashboardRoutes = new RouteCollection({ prefix: "dashboard" });

    routes.add("/");
    dashboardRoutes.add("/");

    routes.append(dashboardRoutes);

    expect(routes.build()).toEqual([
      {
        path: "/",
        components: {},
      },
      {
        path: "/dashboard",
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
    handle(from: Route, to: Route): string {
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

  class AsyncGuard extends RouteGuard {
    async handle(from: Route, to: Route): Promise<any> {
      return new Promise(resolve => setTimeout(resolve, 1000, "/"));
    }
  }

  test("can use async guard", () => {
    const routes = new RouteCollection();

    routes.group(
      {
        prefix: "dashboard",
        guards: [new AsyncGuard()],
      },
      r => {
        r.add("home");
      },
    );

    return tapAsync(routes.build(), async buildedRoutes => {
      await buildedRoutes[0].beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });
    });
  });

  test("guard should be resolved by correct order", () => {
    const routes = new RouteCollection();

    routes.group(
      {
        prefix: "dashboard",
        guards: [
          (to, from) => {
            return new Promise(resolve => setTimeout(resolve, 2000, true));
          },
          new AsyncGuard(),
        ],
      },
      r => {
        r.add("home").guard((to, from) => {
          return "/auth";
        });
      },
    );

    return tapAsync(routes.build(), async buildedRoutes => {
      await buildedRoutes[0].beforeEnter(null, null, result => {
        expect(result).toEqual("/");
      });
    });
  });
});
