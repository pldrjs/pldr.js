package org.pldrjs.pldrjs;

import cn.nukkit.Server;
import cn.nukkit.command.Command;
import cn.nukkit.command.CommandSender;
import cn.nukkit.event.Event;
import cn.nukkit.plugin.PluginBase;

import java.io.File;
import java.io.FileReader;
import java.io.FileFilter;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleScriptContext;

import jdk.nashorn.api.scripting.JSObject;

public class PldrJS extends PluginBase{
	public File baseFolder = new File("scripts/");
	public File modulesFolder = new File(baseFolder, "node_modules");
	public CompiledScript commonjs;
	public String[] ignorantFiles = {"jvm-npm.js", "pldr.js"};
	public Map<String, Class<? extends Event>> knownEvents = new HashMap<>();
	public Map<String, String> scripts = new HashMap<>();
	private static PldrJS instance = null;
	private ScriptEngine engine = null;
	private ScriptContext ctx = null;
	private Thread t = new Thread(() -> {
		while(true){
			try{
				engine.eval("$$.tickHook();", ctx);
				Thread.sleep(50);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	});

	public static PldrJS getInstance(){
		return instance;
	}

	public boolean exportResource(String resourceName, File target) throws Exception{
		if(!target.exists()){
			Files.copy(this.getClass().getClassLoader().getResourceAsStream(resourceName), target.toPath());
			return true;
		}
		return false;
	}

	@Override
	public void onDisable(){
		try{
			engine.eval("$$.disabledHook();", ctx);
		}catch(Exception e){
			e.printStackTrace();
		}
	}

	private List<String> findClass(String parentPackage) throws Exception{
		List<String> files = new LinkedList<>();
		String packageName = parentPackage.replace(".", "/");
		URL resources = Server.class.getClassLoader().getResources(packageName).nextElement();
		if(!resources.toString().startsWith("jar")){
			// not packaged with jar
			for(File dir : new File(resources.getFile()).listFiles()){
				if(!dir.isDirectory()) continue;

				for(File v : dir.listFiles(new FileFilter(){
					@Override
					public boolean accept(File f){
						return f.isFile();
					}
				})){
					files.add(packageName + "/" + dir.getName() + "/" + v.getName());
				}
			}
		}else{
			Enumeration<JarEntry> iter = ((JarURLConnection) resources.openConnection()).getJarFile().entries();
			while(iter.hasMoreElements()){
				files.add(iter.nextElement().getName());
			}
		}

		return files.stream().filter((file) -> {
			if(file.contains("$")) return false;
			return file.endsWith(".class") && file.startsWith(packageName);
		}).collect(Collectors.toList());
	}

	@SuppressWarnings("unchecked")
	@Override
	public void onEnable(){
		instance = this;
		engine = new ScriptEngineManager().getEngineByName("nashorn");

		if(!baseFolder.exists()){
			baseFolder.mkdir();
		}

		try{
			exportResource("commonjs/src/main/javascript/jvm-npm.js", new File(baseFolder, "jvm-npm.js"));
			exportResource("pldr.js", new File(baseFolder, "pldr.js"));
			exportResource("package.json", new File(baseFolder, "package.json"));

			InputStream defaultModules = this.getClass().getClassLoader().getResourceAsStream("default_modules.zip");
			ZipInputStream zis = new ZipInputStream(defaultModules);
			ZipEntry entry;
			while((entry = zis.getNextEntry()) != null){
				File target = new File(modulesFolder, entry.getName());
				if(target.exists()) continue;
				if(entry.isDirectory()){
					target.mkdir();
				}else{
					Files.copy(zis, target.toPath());
				}
				zis.closeEntry();
			}
		}catch(Exception e){
			this.getLogger().error("Error while exporting resources", e);
			return;
		}

		try{
			commonjs = ((Compilable) engine).compile(new FileReader(new File(baseFolder, "jvm-npm.js")));
		}catch(Exception e){
			this.getLogger().error("Error while compiling jvm-npm script", e);
		}

		try{
			findClass("cn.nukkit.event").forEach(file -> {
				String[] split = file.split("/");
				if(split.length != 5) return;
				if(!split[2].equals("event")) return;
				String category = split[3];
				String className = split[4].substring(0, split[4].length() - 6);

				if(file.equals("cn/nukkit/event/" + category + "/" + (category.charAt(0) - 32) + category.substring(1))) return;

				try {
					knownEvents.put(className.substring(0, className.length() - 5).toLowerCase(), (Class<? extends Event>) Class.forName(file.substring(0, file.length() - 6).replace("/", ".")));
				} catch (Exception e) {
					this.getLogger().error("Error while iterating events", e);
				}
			});
		}catch(Exception e){
			this.getLogger().error("Error while finding events", e);
		}

		Arrays.asList(baseFolder.listFiles()).forEach((f) -> {
			try{
				if(!(f.isFile() && f.getName().endsWith(".js"))
					|| Arrays.asList(ignorantFiles).contains(f.getName())){
					return;
				}

				String[] split = f.getName().split("\\.");
				String name = IntStream.range(0, split.length).filter((v) -> {
					return v != split.length - 1;
				}).mapToObj((v) -> {
					return split[v];
				}).collect(Collectors.joining("."));

				scripts.put(name, Files.lines(f.toPath()).collect(Collectors.joining("\n")));
			}catch(Exception e){
				this.getLogger().error("Error while reading scripts", e);
			}
		});

		try{
			ctx = new SimpleScriptContext();
			ctx.getBindings(ScriptContext.ENGINE_SCOPE).put("PldrJSPlugin", PldrJS.getInstance());
			ctx.getBindings(ScriptContext.ENGINE_SCOPE).put("PldrJSEvents", knownEvents);
			ctx.getBindings(ScriptContext.ENGINE_SCOPE).put("PldrJSScripts", scripts);
			commonjs.eval(ctx);
			//engine.eval("Require.root = `" + baseFolder.getAbsolutePath() + "`;");
			engine.eval("require.root = \"" + baseFolder.getAbsolutePath().replace("\\", "\\\\") + "\";", ctx);
			try{
				engine.eval("var $$ = require('./pldr');", ctx);
			}catch(Exception e){
				this.getLogger().error("Error on pldr.js init : ", e);
			}

			scripts.forEach((k, v) -> {
				try{
					engine.eval("Function(PldrJSScripts.get('" + k.replace("'", "\\'") + "'))()", ctx);
				}catch(Exception e){
					this.getLogger().error("Error on script : " + k, e);
				}
			});
		}catch(Exception e){
			this.getLogger().error("Error while evaluating scripts", e);
		}

		t.start();
	}
}
