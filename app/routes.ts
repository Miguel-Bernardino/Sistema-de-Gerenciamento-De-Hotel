import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/Layout.tsx", [
        index("routes/home.tsx"),
        // Adicione mais rotas aqui, por exemplo:
        // route("reservas", "routes/reservas.tsx"),
        // route("quartos", "routes/quartos.tsx"),
    ])
] satisfies RouteConfig;
