import { makeResponse } from "../../helpers/web_helper"

export async function handleRoute_users_getPublicProfile(request, env) {
    const url = new URL(request.url);

    if(!url.searchParams.has("username"))
        return makeResponse(request, 401, `{"message": "Required parameter missing!", "error_code": 1401}`);
    
    const username = url.searchParams.get("username");

    var users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    if(!users_list.user_names.includes(username))
        return makeResponse(request, 404, `{"message": "User does not exit!", "error_code": 1402, "client_ip": "${client_ip}"}`);

    var user_data = users_list.user_data[users_list.user_names.indexOf(username)];
    console.log(user_data);

    return makeResponse(request, 200, JSON.stringify({
        message: "Userdata request successful",
        id: user_data.id,
        username: user_data.username,
        display_name: user_data.display_name,
        admin: user_data.is_admin,
        bio: user_data.bio,
        register_timestamp: user_data.register_timestamp
    }));
}

export async function handleRoute_users_list(request, env) {
    const url = new URL(request.url);

    if(!url.searchParams.has("token"))
        return makeResponse(request, 401, `{"message": "Required parameter missing!", "error_code": 1601}`);

    const token = url.searchParams.get("token");

    const token_data = await env.LOGIN_MS_KV.get("sr_tk_" + token);
    if(!token_data)
        return makeResponse(request, 404, `{"message": "Token is invalid!", "error_code": 1602}`);
    const token_data_parsed = JSON.parse(token_data);
    const users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    const user_data = users_list.user_data[users_list.user_names.indexOf(token_data_parsed.username)];
    
    if(!user_data.is_admin)
        return makeResponse(request, 401, `{"message": "${token_data_parsed.username} is not an admin!", "error_code": 1603}`);

    const return_string = JSON.stringify({
        message: "GET Userlist Successful",
        users_no: users_list.users_no,
        users: users_list.user_names
    });

    return makeResponse(request, 200, return_string);
}
