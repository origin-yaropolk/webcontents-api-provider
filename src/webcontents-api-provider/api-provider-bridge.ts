import { contextBridge, ipcRenderer } from "electron";

export interface ApiProviderBridge {
	invoke(callbackName: string, ...args: unknown[]): unknown;
}

export function exposeApiProviderBridgeInternal(): void {
	contextBridge.exposeInMainWorld('ApiProviderBridge', {
		invoke(callbackName: string, args: unknown[]): unknown {
			const result = ipcRenderer.sendSync('BRIDGE-INVOKE', {
				method: callbackName,
				args: args
			});

			return result;
		}
	});
}
