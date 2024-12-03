import { makeResponse } from "../helpers/web_helper"
import { routePUT } from "./PUT/router"
import { routeGET } from "./GET/router"
import { routePOST } from "./POST/router"
import { routePATCH } from "./PATCH/router"

function handlePOSTRequest(path, request, env) {
    return routePOST(path, request, env)
}
function handleGETRequest(path, request, env) {
    return routeGET(path, request, env)
}
function handlePUTRequest(path, request, env) {
    return routePUT(path, request, env);
}
function handlePATCHRequest(path, request, env) {
    return makeResponse(request, 501, `{"message": "PATCH Not implemented!"}`);
}
function handleHEADRequest(path, request, env) {
    return makeResponse(request, 501, `{"message": "Not implemented!"}`);
}

export async function routeRequest(path, request, env) {
    var client_ip = request.headers.get('CF-Connecting-IP') || "localhost";
    var client_data_by_ip = await env.LOGIN_MS_KV.get("cl_ip_" + client_ip);
    if(!client_data_by_ip) {
        await env.LOGIN_MS_KV.put("cl_ip_" + client_ip, JSON.stringify({accounts_no: 0, accounts: [], banned: false}), { expirationTtl: 86400 });
        client_data_by_ip = await env.LOGIN_MS_KV.get("cl_ip_" + client_ip);
    }

    var client_data_by_ip_parsed = JSON.parse(client_data_by_ip);
    if(client_data_by_ip_parsed.banned)
        return makeResponse(request, 403, `{"message": "This IP is banned!", "error_code": 1101, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    var users = await env.LOGIN_MS_KV.get("sr_users");
    if(!users) 
        await env.LOGIN_MS_KV.put("sr_users", JSON.stringify({users_no: 0, user_names: [], user_data: []}), { expirationTtl: 86400 });

    switch(request.method) {
        case "GET":
            return handleGETRequest(path, request, env);
        case "POST":
            return handlePOSTRequest(path, request, env);
        case "PATCH":
            return handlePATCHRequest(path, request, env);
        case "PUT":
            return handlePUTRequest(path, request, env);
        case "HEAD":
            return handleHEADRequest(path, request, env);
        default:
            return makeResponse(request, 400, `{"message": "Unknown method"}`);
    }
}