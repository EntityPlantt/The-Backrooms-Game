const registeredLevels = {};
function getLevel(level) {
	return registeredLevels[level];
}
function registerLevel(level, data) {
	registeredLevels[level] = data;
}
class Level {
	data; entities = []; chunks = {}; chunkSize = 0;
	constructor(data) {
		this.data = data;
	}
	getRenderData(chunk) {
		return this.chunks[chunk].toJSON();
	}
	toJSON() {
		return data;
    }
}
module.exports = { Level, registerLevel, getLevel };