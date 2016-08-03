var $ = new JavaImporter(java.lang, Packages.cn.nukkit.plugin, Packages.cn.nukkit.event);
var EventEmitter = require('events');
var PldrJS = {};

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

var eventHandlerSetter = (name) => {
	return (handler) => {
		PldrJS.Script.Event.on(name, handler);
	}
};

var eventHookSetter = (name) => {
	return (...args) => {
		PldrJS.Script.Event.emit(name, ...args);
	};
};

PldrJS.disabled = eventHandlerSetter('disabled');
PldrJS.tick = eventHandlerSetter('tick');
PldrJS.command = eventHandlerSetter('command');

//TODO
PldrJS.disabledHook = eventHookSetter('disabled');
PldrJS.tickHook = eventHookSetter('tick');
PldrJS.commandHook = eventHookSetter('command');

PldrJS.getPlugin = () => {
	return PldrJSPlugin;
};

PldrJS.getPluginManager = () => {
	return PldrJS.getPlugin().getServer().getPluginManager();
};

PldrJS.print = (str) => {
	PldrJS.getPlugin().getLogger().info(str);
};

PldrJS.console = PldrJS.getPlugin().getLogger();

// ModPE-like Environment
// Please refer to https://github.com/Connor4898/ModPE-Docs/wiki
// and https://duggum.github.io/modpe-api/

//======Block=======
PldrJS.Block = {};

//======Entity======
PldrJS.Entity = {};
PldrJS.Entity.setX = PldrJS.Entity.getX = PldrJS.Entity.x = propertySetter('x');
PldrJS.Entity.setY = PldrJS.Entity.getY = PldrJS.Entity.y = propertySetter('y');
PldrJS.Entity.setZ = PldrJS.Entity.getZ = PldrJS.Entity.z = propertySetter('z');
PldrJS.Entity.setVelX = PldrJS.Entity.getVelX = PldrJS.Entity.velX = propertySetter('motionX');
PldrJS.Entity.setVelY = PldrJS.Entity.getVelY = PldrJS.Entity.velY = propertySetter('motionY');
PldrJS.Entity.setVelZ = PldrJS.Entity.getVelZ = PldrJS.Entity.velZ = propertySetter('motionZ');

PldrJS.Entity.getLevel = PldrJS.Entity.setLevel = PldrJS.Entity.level = (entity, level) => {
	if(level !== undefined){
		entity.setLevel(level);
		return;
	}

	return entity.getLevel();
};

//======Event=======
PldrJS.Event = {};

PldrJS.Event.emit = (event) => {
	PldrJS.getPluginManager().callEvent(event);
};

PldrJS.Event.getEvent = (eventName) => {
	return Java.type(PldrJS.getKnownEvents().get(eventName).getCanonicalName());
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

	var pluginManager = PldrJS.getPluginManager();
	pluginManager.registerEvent(event, new handleListener(), handlePriority, new handleExecutor(), PldrJS.getPlugin());
};

PldrJS.Event.preventDefault = (event) => {
	event.setCancelled();
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

PldrJS.Player.addItemInventory = (id, count, damage) => {

};

//======Script======
PldrJS.Script = {};
PldrJS.Script.Event = PldrEvent;
PldrJS.saveData = PldrJS.Script.saveData = (k, v) => {

};

PldrJS.loadData = PldrJS.Script.loadData = (k) => {

};

PldrJS.removeData = PldrJS.Script.removeData = (k) => {

};

PldrJS.Script.saveExternalData = (scriptName, k, v) => {

};

PldrJS.Script.loadExternalData = (scriptName, k) => {

};

PldrJS.Script.removeExternalData = (scriptName, k) => {

};

module.exports = PldrJS;
