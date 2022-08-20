const { registeredLevels: Level, getLevel } = require("level.js");
const Human = require("entities/human.js");
module.exports = class World {
	data; levels = {}; players = {};
	constructor(data) {
		this.data = data;
		Object.keys(data.levels).forEach(level => {
			this.levels[level] = new (getLevel(level))(data.levels[level]);
		});
	}
	getRenderData(level, chunk) {
		return this.levels[level].getRenderData(chunk);
	}
	registerPlayer(playerName, playerData) {
		this.levels[playerData.level].spawnEntity(new Human(playerName, playerData));
		this.players[playerName] = playerData;
	}
	toJSON() {
		this.levels.forEach(level => {
			this.data.levels[level] = this.levels[level].toJSON();
		});
		return this.data;
	}
}