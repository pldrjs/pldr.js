var PldrJS = {};
var $ = new JavaImporter(java.io, java.lang, Packages.cn.nukkit);

var knownEvents = {};
var files = [];
var capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
var camelize = s => s.charAt(0).toLowerCase() + s.slice(1);
var removeClass = s => s.substring(0, s.length - 6);

var resources = $.Server.class.getClassLoader().getResources('cn/nukkit/event/').nextElement();
if(!resources.toString().startsWith("jar")){
	//Jar로 패키징되어있지 않음
	new $.File(resources.getFile()).listFiles().forEach((dir) => {
		if(!dir.isDirectory()) return;
		files = files.concat(dir.listFiles()
			.filter(v => v.isFile)
			.map(v => v.getName())
			.map(v => 'cn/nukkit/event/' + dir.getName() + '/' + v));
	});
}else{
	//Jar로 패키징됨
	var iterator = resources.openConnection().getJarFile().entries();
	while(iterator.hasMoreElements()){
		files.push(iterator.nextElement().getName());
	}
}

files.forEach((f) => {
	if(f.endsWith(".class")){
		var cp = removeClass(f.replace(/\//g, "."));
		if(cp.indexOf('$') !== -1) return;

		var split = f.split("/");
		if(split.length !== 5) return;
		if(split[2] !== 'event') return;

		var category = split[3];
		var className = removeClass(split[4]);
		var eventName = camelize(className.replace("Event", ""));

		if(cp === `cn.nukkit.event.${category}.${capitalize(category) + "Event"}`) return;

		knownEvents[eventName] = $.Class.forName(cp);
	}
});

PldrJS.getPlugin = function(){
	return PldrJSPlugin;
};

PldrJS.print = function(str){
	PldrJS.getPlugin().getLogger().info(str);
};

module.exports = PldrJS;
