import { WebContents } from 'electron';
import { AnotherTestObject, TestObject, WebApi } from "./web-api";

export { WebApi, TestObject } from './web-api';

function exposeWebApiInternal(): void {
	class WebApiImpl implements WebApi {
		add(a: number, b: number): number {
			return a + b;
		}
	
		concat(a: string, b: number): string {
			return a + b;
		}
		
		objectConcat(o: TestObject): string {
			return o.b + o.a + o.c.a + o.c.b;
		}

		objectAdd(o: AnotherTestObject, a: number): number {
			return o.a + a;
		}
	
		stringOut(): string {
			return 'stringOut';
		}
	
		objectReturn(): TestObject {
			return {
				a: 8,
				b: 'test',
				c: {
					a: 'another',
					b: 9
				}
			};
		}
	
		cbTest(cb: (greet: string) => void): void {
			setInterval(() => {
				cb('cb test');
			}, 1000);
		}
	
		cbTestR(cb: (greet: string) => string): void {
			let a = 'cb test r';
			setInterval(() => {
				console.log(cb(a));
			}, 1000);
		}
	}

	if (!window.WebApi) {
		window.WebApi = new WebApiImpl();
	}
}

export function exposeWebApi(webContents: WebContents): Promise<void> {
	return webContents.executeJavaScript(`(${exposeWebApiInternal.toString()})()`)
}
