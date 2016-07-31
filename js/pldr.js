var PldrJS = {};
var $ = new JavaImporter(java.io, java.lang, Packages.cn.nukkit);

PldrJS.getPlugin = function(){
	return PldrJSPlugin;
};

PldrJS.print = function(str){
	PldrJS.getPlugin().getLogger().info(str);
};

module.exports = PldrJS;
