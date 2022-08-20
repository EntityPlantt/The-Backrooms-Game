const { createServer } = require("http");
const { address: ipAddress } = require("ip");
const { processData, startWorld } = require("./world-process.js");
const { check: portUsed } = require("tcp-port-used");
const { log: consoleLog } = require("console");
function log(...args) {
	return consoleLog("[Server]", ...args);
}

function runServer(world, local, port) {
	var ip = local ? "127.0.0.1" : ipAddress();
	startWorld(world);
	log(`Starting world at ${ip}:${port}`);
	return {
		ip, port,
		joinLink: ip + ":" + port,
		server: createServer(async (req, res) => {
			log(`Processing data from ${req.socket.remoteAddress}`);
			var body = [];
			await new Promise(ret => req.on("data", ch => {
				body.push(ch);
			}).on("end", () => {
				ret();
			}));
			body = Buffer.concat(body).toString();
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify(processData(JSON.parse(body))));
			log("Done!");
		}).listen(port)
	};
}
async function randomFreePort(local) {
	var port, ip = local ? "127.0.0.1" : ipAddress();
	do {
		port = Math.floor(Math.random() * 65535);
	}
	while (await portUsed(port, ip));
	return port;
}
module.exports = { runServer, randomFreePort, portUsed };