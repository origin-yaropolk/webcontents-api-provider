import { app, BrowserWindow } from "electron";
import { exposeWebApi, WebApi } from "./web-api";
import { ApiProviderProxyHandler } from "./webcontents-api-provider/api-provider";

import { join as pathJoin } from 'path';

const greetCallback = (greet: string) => {
	console.log(greet);
}

async function startApp(): Promise<void> {
	const window = await createWindow('app/worker-client/index.html');

	exposeWebApi(window.webContents);

	const apiProvider = ApiProviderProxyHandler.createApiProvider<WebApi>(window.webContents, 'WebApi');

	const addTest1 = await apiProvider.add(8, 9);
	const addTest2 = await apiProvider.add(9, 17);
	const objectAddTest = await apiProvider.objectAdd({a: 4}, 4);
	const concatTest = await apiProvider.concat('test', 9);
	const stringOutTest = await apiProvider.stringOut();
	apiProvider.cbTest(greetCallback);

	console.log('stub');
}

async function createWindow(filePath: string): Promise<BrowserWindow> {
	const preloadPath = pathJoin(app.getAppPath(), 'preload/api-provider-bridge.js');

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
			preload: preloadPath,
            devTools: true,
        },
    });

    mainWindow.webContents.openDevTools();
    await mainWindow.loadFile(filePath);

    return mainWindow;
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

app.on('ready', () => {
    setTimeout(async () => {
        startApp();
    }, 1000);
})

