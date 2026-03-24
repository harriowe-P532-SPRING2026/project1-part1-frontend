import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.jsx"),
    route("/order/:type", "routes/order.jsx"),
    route("/user", "routes/user.jsx"),
    route("/trades", "routes/trades.jsx"),
    route("/algorithim", "routes/algorithim.jsx")
] satisfies RouteConfig;
