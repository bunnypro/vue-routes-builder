import Routes from '../lib';

describe('Routes', () => {
    let routes: Routes;

    const Home = { template: '<div>Home</div>', };
    const About = { template: '<div>About</div>', };

    function initRoutes(root: string = '/') {
        routes = new Routes({ root });
    }

    test('should resolve correct path', () => {
        initRoutes();

        routes.add('/', Home);

        expect(routes.build()).toEqual([{
            path: '/',
            component: Home,
        }]);

        initRoutes();

        routes.add('home', Home);

        expect(routes.build()).toEqual([{
            path: '/home',
            component: Home,
        }]);

        initRoutes();

        routes.add('/home', Home);

        expect(routes.build()).toEqual([{
            path: '/home',
            component: Home,
        }]);

        initRoutes('dashboard');

        routes.add('home', Home);

        expect(routes.build()).toEqual([{
            path: '/dashboard/home',
            component: Home,
        }]);

        initRoutes('/dashboard');

        routes.add('home', Home);

        expect(routes.build()).toEqual([{
            path: '/dashboard/home',
            component: Home,
        }]);

        initRoutes('dashboard');

        routes.add('/home', Home);

        expect(routes.build()).toEqual([{
            path: '/dashboard/home',
            component: Home,
        }]);

        initRoutes('/dashboard');

        routes.add('/home', Home);

        expect(routes.build()).toEqual([{
            path: '/dashboard/home',
            component: Home,
        }]);
    });


    test('should resolve correct child path', () => {
        initRoutes('dashboard');

        routes.add('/', About).children(router => {
            router.add('home', Home);
            router.add('/about', About);
        });

        expect(routes.build()).toEqual([{
            path: '/dashboard',
            component: About,
            children: [
                {
                    path: 'home',
                    component: Home
                },
                {
                    path: 'about',
                    component: About
                }
            ]
        }]);

        initRoutes();

        routes.add('dashboard', About).children(router => {
            router.add('/', About);
            router.add('home', Home);
            router.add('/about', About);
        });

        expect(routes.build()).toEqual([{
            path: '/dashboard',
            component: About,
            children: [
                {
                    path: '/',
                    component: About
                },
                {
                    path: 'home',
                    component: Home
                },
                {
                    path: 'about',
                    component: About
                }
            ]
        }]);
    });

    test('should resolve correct group path', () => {
        initRoutes();

        routes.group('dashboard', router => {
            router.add('home', Home).children(r1 => {
                r1.add('/', About);

                r1.group('set', r2 => {
                    r2.add('a', Home);
                    r2.add('b', About);
                })
            });

            router.add('about', About);
        });

        expect(routes.build()).toEqual([
            {
                path: '/dashboard/home',
                component: Home,
                children: [
                    {
                        path: '/',
                        component: About
                    },
                    {
                        path: 'set/a',
                        component: Home
                    },
                    {
                        path: 'set/b',
                        component: About
                    }
                ]
            },
            {
                path: '/dashboard/about',
                component: About,
            },
        ]);
    });
});
