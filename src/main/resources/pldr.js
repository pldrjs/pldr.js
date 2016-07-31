/*!
 * pldr.js 1.0.0 by pldrjs
 * Copyright 2015-2016 HelloWorld017 <deu07115@gmail.com>,onebone <jyc00410@gmail.com>
 * Licensed under the GPL-3.0 license
 */
"use strict";var PldrJS={},$=new JavaImporter(java.io,java.lang,Packages.cn.nukkit);PldrJS.getPlugin=function(){return PldrJSPlugin},PldrJS.print=function(a){PldrJS.getPlugin().getLogger().info(a)};var knownEvents={},files=[],capitalize=function(a){return a.charAt(0).toUpperCase()+a.slice(1)},camelize=function(a){return a.charAt(0).toLowerCase()+a.slice(1)},removeClass=function(a){return a.substring(0,a.length-6)},resources=$.Server["class"].getClassLoader().getResources("cn/nukkit/event/").nextElement();if(resources.toString().startsWith("jar"))for(
//Jar로 패키징됨
var iterator=resources.openConnection().getJarFile().entries();iterator.hasMoreElements();)files.push(iterator.nextElement().getName());else
//Jar로 패키징되어있지 않음
new $.File(resources.getFile()).listFiles().forEach(function(a){a.isDirectory()&&(files=files.concat(a.listFiles().filter(function(a){return a.isFile}).map(function(a){return a.getName()}).map(function(b){return"cn/nukkit/event/"+a.getName()+"/"+b})))});files.forEach(function(a){if(a.endsWith(".class")){var b=removeClass(a.replace(/\//g,".")),c=a.split("/");if(5!==c.length)return;if("event"!==c[2])return;var d=c[3],e=removeClass(c[4]),f=camelize(e.replace("Event",""));if(b==="cn.nukkit.event."+d+"."+(capitalize(d)+"Event"))return;knownEvents[f]=$.Class.forName(b)}}),PldrJS.print(JSON.stringify(knownEvents)),module.exports=PldrJS;