import { makeResponse } from "../../helpers/web_helper"
import { isValidJson } from "../../helpers/data_helper"
import { isValidEmail, isValidUsername } from "../../helpers/login_helper";
import { generateRandomToken } from "../../helpers/cryptography";

export async function handleRoute_users_add(request, env) {
    // Get the client's IP, if invalid replace with "localhost"
    const client_ip = request.headers.get('CF-Connecting-IP') || "localhost";
    // Get data of accounts linked to the IP
    const client_data_by_ip = await env.LOGIN_MS_KV.get("cl_ip_" + client_ip);
    
    // Parse the data
    var client_data_by_ip_parsed = JSON.parse(client_data_by_ip);
    
    // Check if client can register another account
    if(client_data_by_ip_parsed.accounts_no >= 5)
        return makeResponse(request, 403, `{"message": "Too many accounts on IP!", "error_code": 1001, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    // Get data sent by client
    const rawBody = await request.text();
    if(!isValidJson(rawBody))
        return makeResponse(request, 400, `{"message": "Invalid JSON Body!", "error_code": 1002, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    // Parse and check the data sent by the client
    const jsonBody = JSON.parse(rawBody);
    if(!("username" in jsonBody) || !("password" in jsonBody) || !("email" in jsonBody))
        return makeResponse(request, 400, `{"message": "Required parameters missing!", "error_code": 1003, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    const username = jsonBody.username;
    const password = jsonBody.password;
    const email = jsonBody.email.toLowerCase();
    
    if(!isValidUsername(username))
        return makeResponse(request, 400, `{"message": "Username is invalid!", "error_code": 1004, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);
    if(!isValidEmail(email))
        return makeResponse(request, 400, `{"message": "Email is invalid!", "error_code": 1005, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    // Get list of users
    var users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    // Check if another user already has the username
    if(users_list.user_names.includes(username))
        return makeResponse(request, 400, `{"message": "User exists!", "error_code": 1006, "client_ip": "${client_ip}", "client_data_by_ip": ${client_data_by_ip}}`);

    // Create new user
    users_list.user_data.push({
        id: users_list.users_no + 1,
        username: username,
        password: password,
        email: email,
        is_admin: false,
        bio: "",
        display_name: username,
        register_timestamp: Math.floor(Date.now() / 1000),
        login_locations: []
    });

    users_list.users_no ++;
    users_list.user_names.push(username);

    client_data_by_ip_parsed.accounts_no ++;
    client_data_by_ip_parsed.accounts.push(username);

    // Push new data to KV
    await env.LOGIN_MS_KV.put("cl_ip_" + client_ip, JSON.stringify(client_data_by_ip_parsed), { expirationTtl: 86400 });
    await env.LOGIN_MS_KV.put("sr_users", JSON.stringify(users_list), { expirationTtl: 86400 });

    // Return informative message
    return makeResponse(request, 200, `{"message": "User ${username} is registered"}`);
}

export async function handleRoute_users_login(request, env) {
    const client_ip = request.headers.get('CF-Connecting-IP') || "localhost";

    const rawBody = await request.text();
    if(!isValidJson(rawBody))
        return makeResponse(request, 400, `{"message": "Invalid JSON Body!", "error_code": 1201, "client_ip": "${client_ip}"}`);

    const jsonBody = JSON.parse(rawBody);
    if(!("username" in jsonBody) || !("password" in jsonBody))
        return makeResponse(request, 400, `{"message": "Required parameters missing!", "error_code": 1202, "client_ip": "${client_ip}"}`);

    const username = jsonBody.username;
    const password = jsonBody.password;
    
    if(!isValidUsername(username))
        return makeResponse(request, 400, `{"message": "Username is invalid!", "error_code": 1203, "client_ip": "${client_ip}"}`);

    var users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    if(!users_list.user_names.includes(username))
        return makeResponse(request, 404, `{"message": "User does not exit!", "error_code": 1204, "client_ip": "${client_ip}"}`);

    var user_data = users_list.user_data[users_list.user_names.indexOf(username)];
    if(password != user_data.password)
        return makeResponse(request, 400, `{"message": "Password for ${username} is incorrect!", "error_code": 1205, "client_ip": "${client_ip}"}`);
    
    const user_token = generateRandomToken();
    await env.LOGIN_MS_KV.put("sr_tk_" + user_token, JSON.stringify({
        username: username,
        index: user_data.login_locations.length
    }), { expirationTtl: 86400 });

    user_data.login_locations.push({
        ip: client_ip,
        user_agent: request.headers.get("user-agent"),
        token: user_token,
        login_timestamp: Math.floor(Date.now() / 1000),
        logged_out: false
    });

    await env.LOGIN_MS_KV.put("sr_users", JSON.stringify(users_list), { expirationTtl: 86400 });

    return makeResponse(request, 200, `{"message": "Login succcessful", "token": "${user_token}"}`);
}

export async function handleRoute_users_logout(request, env) {
    const client_ip = request.headers.get('CF-Connecting-IP') || "localhost";

    const rawBody = await request.text();
    if(!isValidJson(rawBody))
        return makeResponse(request, 400, `{"message": "Invalid JSON Body!", "error_code": 1301, "client_ip": "${client_ip}"}`);

    const jsonBody = JSON.parse(rawBody);
    if(!("username" in jsonBody) || !("token" in jsonBody))
        return makeResponse(request, 400, `{"message": "Required parameters missing!", "error_code": 1302, "client_ip": "${client_ip}"}`);

    const username = jsonBody.username;
    const token = jsonBody.token;
    
    if(!isValidUsername(username))
        return makeResponse(request, 400, `{"message": "Username is invalid!", "error_code": 1303, "client_ip": "${client_ip}"}`);

    const username_linked_token = await env.LOGIN_MS_KV.get("sr_tk_" + token);
    if(!username_linked_token)
        return makeResponse(request, 404, `{"message": "Token is invalid!", "error_code": 1304, "client_ip": "${client_ip}"}`);
    const username_linked_token_parsed = JSON.parse(username_linked_token);
    if(username_linked_token_parsed.username != username)
        return makeResponse(request, 401, `{"message": "Token does not belong to ${username}!", "error_code": 1305, "client_ip": "${client_ip}"}`);

    var users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    var user_data = users_list.user_data[users_list.user_names.indexOf(username)];
    var login_location = user_data.login_locations[username_linked_token_parsed.index];
    login_location.logged_out = true;

    await env.LOGIN_MS_KV.put("sr_users", JSON.stringify(users_list), { expirationTtl: 86400 });
    await env.LOGIN_MS_KV.delete("sr_tk_" + token);

    return makeResponse(request, 200, `{"message": "Logout succcessful"}`);
}
