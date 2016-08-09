var $ = new JavaImporter(
	java.lang,
	java.lang.reflect,
	java.io,
	java.util.stream,
	java.nio.file,
	Packages.cn.nukkit.plugin,
	Packages.cn.nukkit.event,
	Packages.cn.nukkit.item,
	Packages.cn.nukkit.math,
	Packages.cn.nukkit.block,
	Packages.cn.nukkit.level,
	Packages.cn.nukkit.level.particle
);

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
PldrJS.modTick = PldrJS.tick = eventHandlerSetter('tick');
PldrJS.command = eventHandlerSetter('command');

PldrJS.disabledHook = eventHookSetter('disabled');
PldrJS.tickHook = eventHookSetter('tick');
PldrJS.commandHook = eventHookSetter('command');

PldrJS.getPlugin = () => {
	return PldrJSPlugin;
};

PldrJS.getServer = () => {
	return PldrJS.getPlugin().getServer();
};

PldrJS.getPluginManager = () => {
	return PldrJS.getServer().getPluginManager();
};

PldrJS.print = (str) => {
	PldrJS.getPlugin().getLogger().info(str);
};

PldrJS.console = PldrJS.getPlugin().getLogger();

var field = PldrJS.getPluginManager().getClass().getDeclaredField("commandMap");
field.setAccessible(true);
PldrJS.commandList = field.get(PldrJS.getPluginManager());

PldrJS.registerCommand = (name, desc, usage) => {
	var ownCommand = Java.extend(Java.type('cn.nukkit.command.Command'), {
		execute: (sender, label, args) => {
			PldrJS.commandHook(name, sender, label, args);
		}
	});

	PldrJS.commandList.register("PldrJS", new ownCommand(name, desc, usage));
};

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
PldrJS.Entity.setPitch = PldrJS.Entity.getPitch = PldrJS.Entity.pitch = propertySetter('pitch');
PldrJS.Entity.setYaw = PldrJS.Entity.getYaw = PldrJS.Entity.yaw = propertySetter('yaw');

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
			handler.apply({
				preventDefault: function(){
					event.setCancelled();
				}
			}, [event]);
		}
	});

	//Creating fake listener
	var Listener = Java.type('cn.nukkit.event.Listener');
	var handleListener = Java.extend(Listener, {});

	var handlePriority = priority ? $.EventPriority[priority.toUpperCase()] : $.EventPriority.NORMAL;

	var event = (PldrJS.Event.getKnownEvents().containsKey(eventName)) ?
		PldrJS.Event.getKnownEvents().get(eventName) :
		$.Class.forName(eventName);

	var pluginManager = PldrJS.getPluginManager();
	pluginManager.registerEvent(event, new handleListener(), handlePriority, new handleExecutor(), PldrJS.getPlugin());
};

//=======Item=======
PldrJS.Item = {};

//======Level=======
PldrJS.Level = {};

PldrJS.Level.addParticle = (level, type, x, y, z, data) => {
	var vector = new $.Vector3(x, y, z);
	var genericParticle = (data !== undefined) ? new $.GenericParticle(vector, type, data) : new $.GenericParticle(vector, type);

	level.addParticle(genericParticle);
};

PldrJS.Level.addColoredParticle(level, type, x, y, z, r, g, b) => {
	return PldrJS.Level.addParticle(level, PldrJS.ParticleType.dust, x, y, z, ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)));
};

PldrJS.Level.setTile = (level, x, y, z, id, damage) => {
	level.setBlock(new $.Vector3(x, y, z), new $.Block(id, damage));
};

PldrJS.Level.getTile = (level, x, y, z) => {
	return level.getBlock(new $.Vector3(x, y, z));
};

PldrJS.Level.explode = (level, x, y, z, radius, destroyBlock) => {
	var position = new $.Position(x, y, z, level);
	var explosion = new $.Explosion(position, radius, null);

	if(destroyBlock){
		explosion.explodeA();
	}

	explosion.explodeB();
};

//======ParticleType======
PldrJS.ParticleType = {};

$.Particle.getClass().getDeclaredFields().forEach((field) => {
	if($.Modifier.isStatic(field.getModifiers()) && field.getName().startsWith("TYPE_")){
		PldrJS.ParticleType[field.getName().replaceFirst("TYPE_", "").toLowerCase()] = field.get(null);
	}
});

//======Player======
PldrJS.Player = {};

PldrJS.Player.getCarriedItem = (player) => {
	return player.getInventory().getItemInHand();
};

PldrJS.Player.getLevel = (player) => {
	return player.getLevel();
};

PldrJS.Player.x = PldrJS.Player.setX = PldrJS.Player.getX = PldrJS.Entity.x;
PldrJS.Player.y = PldrJS.Player.setY = PldrJS.Player.getY = PldrJS.Entity.y;
PldrJS.Player.z = PldrJS.Player.setZ = PldrJS.Player.getZ = PldrJS.Entity.z;

PldrJS.Player.pitch = PldrJS.Player.getPitch = PldrJS.Player.setPitch = PldrJS.Entity.pitch;
PldrJS.Player.yaw = PldrJS.Player.getYaw = PldrJS.Player.setYaw = PldrJS.Entity.yaw;

PldrJS.Player.getPlayerEnt = (playerName) => {
	return PldrJS.getServer().getPlayerExact(playerName);
};

PldrJS.Player.getPlayers = () => {
	var players = [];
	//Java Collection -> JavaScript array
	PldrJS.getServer().getOnlinePlayers().values().forEach((v) => {
		players.push(v);
	});

	return players;
};

PldrJS.Player.addItemInventory = (player, id, count, damage) => {
	player.getInventory().addItem(new $.Item(id, count, damage));
};

PldrJS.Player.clientMessage = (player, message) => {
	player.sendMessage(message);
};

PldrJS.Player.showTipMessage = (player, message) => {
	player.sendTip(message);
};

PldrJS.Player.showPopupMessage = (player, message, subtitle) => {
	subtitle = subtitle || "";

	player.sendPopup(message, subtitle);
};
//======Script======
PldrJS.Script = {};
PldrJS.Script.Event = PldrEvent;
PldrJS.Script.data = {};
PldrJS.Script.dataFile = new $.File("scripts/data.json");
if(!PldrJS.Script.dataFile.exists()){
	PldrJS.Script.dataFile.createNewFile();
}else{
	try{
		PldrJS.Script.data = JSON.parse($.Files.lines(PldrJS.Script.dataFile.toPath()).collect($.Collectors.joining("\n")));
	}catch(e){}
}
var isDataChanged = false;

PldrJS.Script.flush = () => {
	if(!isDataChanged) return;

	var bw = new $.BufferedWriter($.OutputStreamWriter($.FileOutputStream(PldrJS.Script.dataFile)));
	bw.write(JSON.stringify(PldrJS.Script.data));
	bw.flush();
	bw.close();
};

PldrJS.saveData = PldrJS.Script.saveData = (scriptName, k, v) => {
	isDataChanged = true;
	if(PldrJS.Script.data[scriptName] === undefined) PldrJS.Script.data[scriptName] = {};
	PldrJS.Script.data[scriptName][k] = v;
};

PldrJS.loadData = PldrJS.Script.loadData = (scriptName, k) => {
	return PldrJS.Script.data[scriptName][k];
};

PldrJS.removeData = PldrJS.Script.removeData = (scriptName, k) => {
	isDataChanged = true;
};

var isStopRequested = false;

PldrJS.disabled(() => {
	isStopRequested = true;
	PldrJS.Script.flush();
});

new $.Thread(() => {
	while(!isStopRequested){
		PldrJS.Script.flush();
		$.Thread.sleep(10000);
	}
}).start();

module.exports = PldrJS;
