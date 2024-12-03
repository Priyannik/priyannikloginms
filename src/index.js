import { routeRequest } from "./routes/handler"

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		
		return await routeRequest(path, request, env);
	},
};
