import { makeResponse } from "../../helpers/web_helper"
import { handleRoute_users_logout } from "./route_users";
import { handleRoute_users_login } from "./route_users";

import { handleRoute_users_add } from "./route_users"

export function routePOST(path, request, env) {
    switch(path) {
        case "/":
            return makeResponse(request, 200, `{"message": "Priyannik Login Microservice. (POST)"}`);
        case "/users/add":
            return handleRoute_users_add(request, env);
        case "/users/login":
            return handleRoute_users_login(request, env);
        case "/users/logout":
            return handleRoute_users_logout(request, env);
        default:
            return makeResponse(request, 404, `{"message": "Unknown API endpoint (POST)"}`);
    }
}