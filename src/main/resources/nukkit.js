var NukkitJS = {};
NukkitJS.getPlugin = function(){
	return NukkitJSPlugin;
};

NukkitJS.print = function(str){
	NukkitJS.getPlugin().getLogger().info(str);
};

module.exports = NukkitJS;