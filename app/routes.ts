import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/Layout.tsx", [
        index("routes/login.tsx"),
        route("home", "routes/home.tsx"),
        route("statistics", "routes/statistics.tsx"),
        route("products", "routes/products.tsx"),
        route("finance", "routes/finance.tsx"),
        route("config", "routes/config.tsx"),
        route("logout", "routes/logout.tsx"),
        route("*", "routes/notfound.tsx"),
    ])
] satisfies RouteConfig;
