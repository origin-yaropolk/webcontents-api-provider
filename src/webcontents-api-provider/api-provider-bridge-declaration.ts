import { ApiProviderBridge } from "./api-provider-bridge";

declare global {
	interface Window {
		ApiProviderBridge: ApiProviderBridge;
	}
}
