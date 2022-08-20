const { join } = require("path");
const { mkdirSync, existsSync, writeFileSync, readdirSync, readFileSync } = require("original-fs");
const { log: consoleLog } = require("console");
const World = require("./lib/world.js");

function log(...args) {
	return consoleLog("[Server]", ...args);
}
function logToChat(text = "", color = "white") {
	chat.push({ text, color });
	return log("[Chat]", text);
}
var thisWorld = "", worldData = {}, chat = [], loadedWorld;
function toFileName(name) {
	return name.split("").map(ch => /[\w \(\)\d]/.test(ch) ? ch : "_").join("") + ".brw";
}
function checkWorldsFolder() {
	if (!existsSync(join(__dirname, "worlds"))) {
		mkdirSync(join(__dirname, "worlds"));
	}
}
function createWorld(world) {
	checkWorldsFolder();
	var suffix = "";
	while (existsSync(join(__dirname, "worlds", toFileName(world.name + suffix)))) {
		suffix = " (" + (parseInt(suffix.substr(2, suffix.length - 3)) || 1) + ")";
	}
	writeFileSync(join(__dirname, "worlds", toFileName(world.name + suffix)), JSON.stringify(world), { encoding: "utf8" });
	console.log(`Created world ${toFileName(world.name + suffix)}`);
}
function listWorlds() {
	checkWorldsFolder();
	return readdirSync(join(__dirname, "worlds")).map(world => {
		if (/.brw$/.test(world)) {
			var data = JSON.parse(readFileSync(join(__dirname, "worlds", world), "utf8"));
			return {
				name: data.name,
				file: world,
				hardcore: data.hardcore,
				starterKit: data.starterKit,
				cheats: data.cheats,
				seed: data.seed
			};
		}
		return null;
	}).filter(Boolean);
}
function startWorld(world) {
	thisWorld = world;
	worldData = JSON.parse(readFileSync(join(__dirname, "worlds", world), "utf8"));
	loadedWorld = new World(worldData);
}
function processData(data) {
	switch (data.type) {
		case "player-join":
			console.log(worldData);
			if (!worldData.players) {
				worldData.players = {};
			}
			if (!(data.playerName in worldData.players)) {
				worldData.players[data.playerName] = {};
			}
			logToChat(`${data.playerName} joined the game`, "yellow");
			loadedWorld
			return worldData.players[data.playerName];
	}
}
module.exports = { processData, startWorld, createWorld, checkWorldsFolder, listWorlds };