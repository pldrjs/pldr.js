var PldrJS = {};
var $ = new JavaImporter(java.io, java.lang);

PldrJS.getPlugin = function(){
	return PldrJSPlugin;
};

PldrJS.print = function(str){
	PldrJS.getPlugin().getLogger().info(str);
};

var knownEvents = [];
var eventCategories = [];
var resources = PldrJSPlugin.class.getClassLoader().getResources('cn/nukkit/event/');

while(resources.hasMoreElements()){
	var elem = new $.File(resoures.nextElement().getFile());
	if(elem.isDirectory()) eventCategories.push(elem);
}

eventCategories.forEach((v) => {
	var files = v.listFiles();
	files.forEach((f) => {
		if(f.isFile() && f.getName().endsWith(".class")){
			if(f.getName() === v.getName().charAt(0).toUpperCase() + v.getName().slice(1) + "Event") return;

			var className = f.getName().substring(0, f.getName().length() - 6);
			var eventName = className.replace("Event", "");
			eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);

			knownEvents[eventName] = $.Class.forName('cn.nukkit.event.' + v.getName() + '.' + className);
		}
	});
});

module.exports = PldrJS;
