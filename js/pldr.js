var $ = new JavaImporter(java.lang, Packages.cn.nukkit.plugin, Packages.cn.nukkit.event);
var EventEmitter = require('events');
var PldrJS = {};

var commandHandlers = [];

class PldrEventEmitter extends EventEmitter{

}

const PldrEvent = new PldrEventEmitter();

var propertySetter = (name) => {
	return (obj, value) => {
		if(value !== undefined){
			obj[name] = value;
			return;
		}

		return obj[name];
	};
};

PldrJS.command = (handler) => {
	commandHandlers.push(handler);
};

PldrJS.commandHook = (sender, command, label, args) => {
	//TODO
	commandHandlers.forEach((v) => {
		v(sender, command, label, args);
	});
};

PldrJS.getPlugin = () => {
	return PldrJSPlugin;
};

PldrJS.print = (str) => {
	PldrJS.getPlugin().getLogger().info(str);
};

// ModPE-like Environment
// Please refer to https://github.com/Connor4898/ModPE-Docs/wiki

//======Block=======
PldrJS.Block = {};

//======Entity======
PldrJS.Entity = {};
PldrJS.Entity.setX = PldrJS.Entity.getX = PldrJS.Entity.x = propertySetter('x');
PldrJS.Entity.setY = PldrJS.Entity.getY = PldrJS.Entity.y = propertySetter('y');
PldrJS.Entity.setZ = PldrJS.Entity.getZ = PldrJS.Entity.z = propertySetter('z');
PldrJS.Entity.getLevel = (entity) => {
	return entity.getLevel();
};

PldrJS.Entity.setLevel = (entity, level) => {
	return entity.setLevel(level);
};

//======Event=======
PldrJS.Event = {};

PldrJS.Event.emit = (event) => {
	//TODO
};

PldrJS.Event.getEvent = (eventName) => {

};

PldrJS.Event.getKnownEvents = () => {
	return PldrJSEvents;
};

PldrJS.Event.on = (eventName, handler, priority) => {
	var EventExecutor = Java.type('cn.nukkit.plugin.EventExecutor');
	var handleExecutor = Java.extend(EventExecutor, {
		execute: (listener, event) => {
			//handle on executor, not on listener because nashorn does not support creating new method.
			handler(event);
		}
	});

	//Creating fake listener
	var Listener = Java.type('cn.nukkit.event.Listener');
	var handleListener = Java.extend(Listener, {});

	var handlePriority = priority ? $.EventPriority[priority.toUpperCase()] : $.EventPriority.NORMAL;

	var event = (PldrJS.getKnownEvents().containsKey(eventName)) ?
		PldrJS.getKnownEvents().get(eventName) :
		$.Class.forName(eventName);

	var pluginManager = PldrJS.getPlugin().getServer().getPluginManager();
	pluginManager.registerEvent(event, new handleListener(), handlePriority, new handleExecutor(), PldrJS.getPlugin());
};

//=======Item=======
PldrJS.Item = {};

//======Level=======
PldrJS.Level = {};

//======Player======
PldrJS.Player = {};

PldrJS.Player.getCarriedItem = (player) => {

};

PldrJS.Player.getLevel = (player) => {

};

PldrJS.Player.getPitch = (player) => {

};

PldrJS.Player.getPlayerEnt = (playerName) => {

};

PldrJS.Player.getPlayers = () => {

};

//======Script======
PldrJS.Script = {};
PldrJS.Script.Event = PldrEvent;

module.exports = PldrJS;
