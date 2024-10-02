import { ipcMain, WebContents } from "electron";
import { Promisify } from "./promisify";

const callbacks: Record<string, unknown> = {};

function registerCallback(callback: (...args: unknown[]) => unknown): string {
	callbacks[callback.name] = callback;
	return callback.name;
}

ipcMain.on('BRIDGE-INVOKE', (event, msg) => {
	const callbackName = msg.method;
	const args = msg.args;
	const callback = callbacks[callbackName] as (...args: unknown[]) => unknown;

	const result = callback.call(null, ...args);

	event.returnValue = result;
});

function invoke(apiKey: string, method: string, ...args: unknown[]): unknown {
	function isDispachedCallback(o: unknown): o is DispachedCallback {
		return typeof o === 'object' && typeof (o as DispachedCallback).dispatchedCallbackName === 'string';
	}

	args.map((arg, index) => {
		if (isDispachedCallback(arg)) {
			const name = arg.dispatchedCallbackName;
			args[index] = (...args: unknown[]) => {
				return window.ApiProviderBridge.invoke(name, args);
			}
		}
	})

	const api = window[apiKey];
	const result = api[method](...args);

	return result;
}

interface DispachedCallback {
	dispatchedCallbackName: string
}

class ApiProviderPropertiesHandler {
	constructor(readonly webContents: WebContents, readonly apiKey: string){}
}

export class ApiProviderProxyHandler {
	private readonly properties: Record<string, unknown> = {};
	
    // private constructor(private webContents: WebContents, private apiKey: string){}
    private constructor(){}

	static createApiProvider<ApiInterface>(webContents: WebContents, apiKey: string): Promisify<ApiInterface> {
		const propertiesHandler = new ApiProviderPropertiesHandler(webContents, apiKey);
		// const proxyHandler = new ApiProvider<ApiInterface>(webContents, apiKey);
		const proxyHandler = new ApiProviderProxyHandler();
		return new Proxy(propertiesHandler, proxyHandler) as Promisify<ApiInterface>;
	}

	private static serializeArguments(...args: unknown[]): string[] {
		const serialized = args.map((arg: unknown, index: number): string => {
			if (Array.isArray(arg)) {
				arg.forEach((value, index) => {
					if (typeof value === 'function') {
						const dispatched: DispachedCallback = {
							dispatchedCallbackName: registerCallback(value)
						}

						arg[index] = dispatched;
					}
				});
			}

			return JSON.stringify(arg)
		});

		console.log(serialized);
		return serialized;
	}

    private static convertToInjectable(fn: (apiKey: string, method: string, ...args: unknown[]) => unknown, apiKey: string, method: string, ...args: unknown[]): string {
		const ser = ApiProviderProxyHandler.serializeArguments(...args);
        return `(${fn.toString()})('${apiKey}','${method}', ...${
			ApiProviderProxyHandler.serializeArguments(...args)
		})`;
    };

	get(context: ApiProviderPropertiesHandler, propertyKey: string): unknown {
		if (Object.hasOwn(context, propertyKey)) {
			return context[propertyKey];
		}

		const propertyProxy = this.properties[propertyKey];

		if (propertyProxy) {
			return propertyProxy;
		}
        
		// proxy context must be a function, to allow using handler 'apply'.
		const propProxy = new Proxy(() => {}, {
            async apply(target_: unknown, this_: ApiProviderPropertiesHandler, ...args: unknown[]): Promise<unknown> {
                const injectable = ApiProviderProxyHandler.convertToInjectable(invoke, this_.apiKey, propertyKey, ...args);
                const res = await this_.webContents.executeJavaScript(injectable);
            
                return res;
            },
        });

		this.properties[propertyKey] = propProxy;

		return propProxy;
	}
}
