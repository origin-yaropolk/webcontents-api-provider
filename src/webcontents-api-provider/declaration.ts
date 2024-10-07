import { ApiProviderBridge } from "./bridge";

declare global {
	interface Window {
		[key: string]: any;
		ApiProviderBridge: ApiProviderBridge;
	}
}
