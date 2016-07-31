var $ = new JavaImporter(java.lang, Packages.cn.nukkit.plugin, Packages.cn.nukkit.event);
var PldrJS = {};

PldrJS.getPlugin = () => {
	return PldrJSPlugin;
};

PldrJS.print = (str) => {
	PldrJS.getPlugin().getLogger().info(str);
};

PldrJS.getKnownEvents = () => {
	return PldrJSEvents;
};

PldrJS.on = (eventName, handler, priority) => {
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

module.exports = PldrJS;
