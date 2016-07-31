/*!
 * pldr.js 1.0.0 by pldrjs
 * Copyright 2015-2016 HelloWorld017 <deu07115@gmail.com>,onebone <jyc00410@gmail.com>
 * Licensed under the GPL-3.0 license
 */
"use strict";var $=new JavaImporter(java.lang,Packages.cn.nukkit.plugin,Packages.cn.nukkit.event),PldrJS={};PldrJS.getPlugin=function(){return PldrJSPlugin},PldrJS.print=function(a){PldrJS.getPlugin().getLogger().info(a)},PldrJS.getKnownEvents=function(){return PldrJSEvents},PldrJS.on=function(a,b,c){var d=Java.type("cn.nukkit.plugin.EventExecutor"),e=Java.extend(d,{execute:function(a,c){
//handle on executor, not on listener because nashorn does not support creating new method.
b(c)}}),f=Java.type("cn.nukkit.event.Listener"),g=Java.extend(f,{}),h=c?$.EventPriority[c.toUpperCase()]:$.EventPriority.NORMAL,i=PldrJS.getKnownEvents().containsKey(a)?PldrJS.getKnownEvents().get(a):$.Class.forName(a),j=PldrJS.getPlugin().getServer().getPluginManager();j.registerEvent(i,new g,h,new e,PldrJS.getPlugin())},module.exports=PldrJS;