const { contextBridge } = require("electron");
const { readdirSync } = require("original-fs");
const worldProcess = require("./world-process.js");
const { runServer, randomFreePort } = require("./server.js");
const { runGame } = require("./game.js");
const { generateUsername: randomUsername } = require("unique-username-generator");

var server;
const sounds = {}, settings = JSON.parse(localStorage.getItem("settings")) || {
	volume: 1,
	zoom: 1,
	playerName: randomUsername()
};
onload = () => {
	document.body.style.setProperty("--zoom", settings.zoom);
}
readdirSync("./assets/sounds").forEach(id => {
	if (/.ogg$/.test(id)) {
		sounds[id.replace(/.ogg$/, "")] = new Audio(`./assets/sounds/${id}`);
	}
});
function playSound(name) {
	const aud = sounds[name].cloneNode(true);
	aud.volume = settings.volume;
	aud.play();
}
function openWorldSelector() {
	document.getElementById("world-selector").style.display = "block";
	document.getElementById("world-selector-local").checked = false;
	document.getElementById("world-selector-port").value = null;
	document.getElementById("select-world").innerHTML = "";
	worldProcess.listWorlds().forEach(world => {
		var li = document.createElement("li");
		li.innerHTML = `
<h3>${world.name}</h3>
Saved as: <span class="path">${world.file}</span><br>
<span style="display:none" class="hardcore">${world.hardcore}</span>
<span style="display:none" class="cheats">${world.cheats}</span>
<span style="display:none" class="starter-kit">${world.starterKit}</span>
${world.hardcore ? "Hardcore, " : ""}${world.cheats ? "Cheats" : "No cheats"}, ${world.starterKit ? "Starter kit" : "Starting empty"}
<br>Seed: <span class="seed">${world.seed}</span>
`;
		li.onclick = ev => selectWorld(ev.target);
		document.getElementById("select-world").appendChild(li);
	});
}
function selectWorld(elm) {
	while (elm.tagName.toUpperCase() != "LI") {
		elm = elm.parentElement;
	}
	playSound("ui.tick");
	document.querySelectorAll("#select-world li").forEach(elm => elm.classList.remove("selected"));
	elm.classList.add("selected");
}
function closeWorldSelector() {
	document.getElementById("world-selector").style.display = "none";
}
async function startServer() {
	server = runServer(
		document.querySelector("#select-world li.selected .path").innerText,
		!document.getElementById("world-selector-local").checked,
		parseInt(document.getElementById("world-selector-port").value) || await randomFreePort(!document.getElementById("world-selector-local").checked)
	).joinLink;
	window.onresize = runGame(server, document.getElementById("canvas")).onresize;
}
function openCreateWorldMenu() {
	document.getElementById("create-world").style.display = "block";
	document.getElementById("create-world-name").value = null;
	document.getElementById("create-world-hardcore").checked = true;
	document.getElementById("create-world-starter-kit").checked = true;
	document.getElementById("create-world-cheats").checked = false;
	document.getElementById("create-world-seed").value = null;
}
function closeCreateWorldMenu() {
	document.getElementById("create-world").style.display = "none";
}
function createWorld() {
	createWrld({
		name: document.getElementById("create-world-name").value || document.getElementById("create-world-name").placeholder,
		hardcore: document.getElementById("create-world-hardcore").checked,
		starterKit: document.getElementById("create-world-starter-kit").checked,
		cheats: document.getElementById("create-world-cheats").checked,
		seed: document.getElementById("create-world-seed").value || Math.floor((Math.random() - 0.5) * (2 ** 64))
	});
}
function openSettings() {
	document.getElementById("settings").style.display = "block";
	Object.keys(settings).forEach(name => {
		document.getElementById("settings-" + name).value = settings[name];
	});
}
function closeSettings() {
	document.getElementById("settings").style.display = "none";
}
function saveSetting(name, value) {
	if (isNaN(value)) {
		settings[name] = value;
	}
	else {
		settings[name] = parseFloat(value);
	}
	switch (name) {
		case "zoom":
			document.body.style.setProperty("--zoom", value);
			break;
	}
	localStorage.setItem("settings", JSON.stringify(settings));
}
function openJoinMenu() {
	document.getElementById("join-menu").style.display = "block";
	document.getElementById("join-menu-server").value = null;
}
function closeJoinMenu() {
	document.getElementById("join-menu").style.display = "none";
}
function joinServer() {
	const inp = document.getElementById("join-menu-server");
	if (!new RegExp(inp.getAttribute("pattern")).test(inp.value)) {
		return;
	}
	server = inp.value;
	window.onresize = runGame(server, document.getElementById("canvas")).onresize;
}
module.exports = {
	playSound, openWorldSelector, closeWorldSelector, startServer,
	openCreateWorldMenu, closeCreateWorldMenu, createWorld, openSettings,
	closeSettings, saveSetting, openJoinMenu, closeJoinMenu, joinServer,
	randomUsername
};
Object.keys(module.exports).forEach(key => contextBridge.exposeInMainWorld(key, module.exports[key]));