export function makeResponse(request, status, data, cookieData) {
    if(cookieData == undefined || !cookieData.set) {
        return new Response(`${data}`, {
            status: status,
            headers: { 
                "content-type": "text/plain",
                "Access-Control-Allow-Origin" : request.headers.get('Origin'),
                "Access-Control-Allow-Headers": "Content-Type, Set-Cookie",
                "Access-Control-Allow-Credentials": "true"
            },
        })
    } else {
        return new Response(`${data}`, {
            status: status,
            headers: { 
                "content-type": "text/plain",
                "Set-Cookie": `${cookieData.name}=${cookieData.value}; Max-Age=${cookieData.age == undefined ? 86400 : cookieData.age}; Secure; HttpOnly`,
                "Access-Control-Allow-Origin" : request.headers.get('Origin'),
                "Access-Control-Allow-Headers": "Content-Type, Set-Cookie",
                "Access-Control-Allow-Credentials": "true"
            },
        })
    }
}
