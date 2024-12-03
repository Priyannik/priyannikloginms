import { makeResponse } from "../../helpers/web_helper"
import { isValidJson } from "../../helpers/data_helper"
import { isValidEmail, isValidUsername } from "../../helpers/login_helper";

export async function handleRoute_users_update(request, env) {
    const rawBody = await request.text();
    if(!isValidJson(rawBody))
        return makeResponse(request, 400, `{"message": "Invalid JSON Body!", "error_code": 1501}`);
    const jsonBody = JSON.parse(rawBody);
    if(!("username" in jsonBody) || !("token" in jsonBody) || !("var" in jsonBody))
        return makeResponse(request, 400, `{"message": "Required parameters missing!", "error_code": 1502}`);
    const username = jsonBody.username;
    const token = jsonBody.token;
    const variable = jsonBody.var;
    
    if(!isValidUsername(username))
        return makeResponse(request, 400, `{"message": "Username is invalid!", "error_code": 1503}`);

    const username_linked_token = await env.LOGIN_MS_KV.get("sr_tk_" + token);
    if(!username_linked_token)
        return makeResponse(request, 404, `{"message": "Token is invalid!", "error_code": 1504}`);
    const username_linked_token_parsed = JSON.parse(username_linked_token);
    if(username_linked_token_parsed.username != username)
        return makeResponse(request, 401, `{"message": "Token does not belong to ${username}!", "error_code": 1505}`);

    if(!("parameter" in variable) || !("new_value" in variable))
        return makeResponse(request, 400, `{"message": "JSON Variable missing parameters!", "error_code": 1506}`);

    var users_list = JSON.parse(await env.LOGIN_MS_KV.get("sr_users"));
    var user_data = users_list.user_data[users_list.user_names.indexOf(username)];
    switch(variable.parameter) {
        case "password":
            user_data.password = variable.new_value;
            break;
        case "bio":
            user_data.bio = variable.new_value;
            break;
        case "display_name":
            user_data.display_name = variable.new_value;
            break;
        default:
            return makeResponse(request, 400, `{"message": "Unknown parameter \"${variable.parameter}\"!", "error_code": 1507}`);
    }
    await env.LOGIN_MS_KV.put("sr_users", JSON.stringify(users_list), { expirationTtl: 86400 });
    return makeResponse(request, 200, `{"message": "Parameter '${variable.parameter}' updated for user '${username}'"}`);
}