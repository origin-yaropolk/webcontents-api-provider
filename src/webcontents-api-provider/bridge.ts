import { contextBridge, ipcRenderer } from "electron";
import { BRIDGE_INVOKE_REQUEST_CHANEL, CallackInvokeRequest } from "./protocol";

export interface ApiProviderBridge {
	invoke(callbackName: string, ...args: unknown[]): unknown;
}

export function exposeBridge(): void {
	contextBridge.exposeInMainWorld('ApiProviderBridge', {
		invoke(callbackName: string, args: unknown[]): unknown {
			const invokeRequest: CallackInvokeRequest = {
				method: callbackName,
				args: args
			}

			return ipcRenderer.sendSync(BRIDGE_INVOKE_REQUEST_CHANEL, invokeRequest);
		}
	});
}
