const { BrowserWindow, app } = require("electron");
const { shell } = require("electron/common");
const { join } = require("path");
var appWindow;
function createWindow() {
	var window = new BrowserWindow({
		kiosk: true,
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, "preload.js")
		}
	});
	window.loadFile("renderer.html");
	window.once("ready-to-show", () => {
		window.show();
	});
	return window;
}
app.whenReady().then(() => {
	appWindow = createWindow();
	appWindow.webContents.on("new-window", (event, url) => {
		event.preventDefault();
		shell.openExternal(url);
	});
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length == 0) {
			createWindow();
		}
	});
});
app.on("window-all-closed", () => {
	if (process.platform != "darwin") {
		app.quit();
	}
});