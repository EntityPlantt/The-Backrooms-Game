const THREE = require("./lib/three.js");
const { request: httpRequest } = require("http");
const { address: ipAddress } = require("ip");
const { log: consoleLog } = require("console");
function log(...args) {
	return consoleLog("[Client]", ...args);
}

var scene, camera, renderer, onresize, server, playerData;
async function runGame(serverAddress, canvas) {
	server = serverAddress;
	scene = new THREE.Scene;
	camera = new THREE.PerspectiveCamera(75);
	renderer = new THREE.WebGLRenderer({ canvas });
	frame();
	onresize = () => {
		camera.aspect = innerWidth / innerHeight;
		renderer.setSize(innerWidth, innerHeight);
	}
	onresize();
	canvas.style.display = "block";
	log(`Logging in game at ${serverAddress} as ${JSON.parse(localStorage.getItem("settings")).playername}`);
	playerData = await sendData({
		type: "player-join",
		playerIP: ipAddress(),
		playerName: JSON.parse(localStorage.getItem("settings")).playername
	});
	log("Done!");
	return { onresize };
}
function frame() {
	requestAnimationFrame(frame);
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}
function sendData(data) {
	log(`Sending request to ${server}`);
	return new Promise(returnPromise => {
		data = JSON.stringify(data);
		var resp = "";
		const req = httpRequest({
			host: server.split(":")[0],
			port: server.split(":")[1],
			path: "/",
			method: "POST"
		}, res => {
			res.on("data", ch => resp += ch);
			res.on("end", () => {
				returnPromise(resp);
			});
		});
		req.on("error", err => { throw err; });
		req.write(data);
		req.end();
	});
}
module.exports = { runGame, sendData };