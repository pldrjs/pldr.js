/*!
 * pldr.js 1.0.0 by pldrjs
 * Copyright 2015-2016 HelloWorld017 <deu07115@gmail.com>,onebone <jyc00417@gmail.com>
 * Licensed under the GPL-3.0 license
 */
"use strict";var PldrJS={},$=new JavaImporter(java.io,java.lang,Packages.cn.nukkit);PldrJS.getPlugin=function(){return PldrJSPlugin},PldrJS.print=function(a){PldrJS.getPlugin().getLogger().info(a)};var knownEvents={},eventCategories=[],resources=new $.File($.Server["class"].getClassLoader().getResources("cn/nukkit/event/").nextElement().getFile());resources.listFiles(function(a){a.isDirectory()&&eventCategories.push(a)}),eventCategories.forEach(function(a){var b=a.listFiles();b.forEach(function(b){if(b.isFile()&&b.getName().endsWith(".class")){if(b.getName()===a.getName().charAt(0).toUpperCase()+a.getName().slice(1)+"Event")return;var c=b.getName().substring(0,b.getName().length()-6),d=c.replace("Event","");d=d.charAt(0).toLowerCase()+d.slice(1),knownEvents[d]=$.Class.forName("cn.nukkit.event."+a.getName()+"."+c)}})}),PldrJS.print(JSON.stringify(eventCategories)),module.exports=PldrJS;
