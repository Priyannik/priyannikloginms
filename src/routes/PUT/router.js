import { makeResponse } from "../../helpers/web_helper"
import { handleRoute_users_update } from "./route_users";

export function routePUT(path, request, env) {
    switch(path) {
        case "/":
            return makeResponse(request, 200, `{"message": "Priyannik Login Microservice. (PUT)"}`);
        case "/users/update":
            return handleRoute_users_update(request, env);
        default:
            return makeResponse(request, 404, `{"message": "Unknown API  (PUT)"}`);
    }
}