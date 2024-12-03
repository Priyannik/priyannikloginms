import { makeResponse } from "../../helpers/web_helper"

import { handleRoute_users_list, handleRoute_users_getPublicProfile } from "./route_users"

export function routeGET(path, request, env) {
    switch(path) {
        case "/":
            return makeResponse(request, 200, `{"message": "Priyannik Login Microservice."}`);
        case "/users/list":
            return handleRoute_users_list(request, env);
        case "/users/getPublicProfile":
            return handleRoute_users_getPublicProfile(request, env);
        default:
            return makeResponse(request, 404, `{"message": "Unknown API endpoint"}`);
    }
}