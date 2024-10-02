import { WebApi } from "./web-api";

declare global {
	interface Window {
		WebApi: WebApi;
	}
}
