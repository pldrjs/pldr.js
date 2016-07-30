package org.pldrjs.pldrjs;

import cn.nukkit.plugin.PluginBase;

import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleScriptContext;

public class PldrJS extends PluginBase{
	public File baseFolder = new File("scripts/");
	public File modulesFolder = new File(baseFolder, "node_modules");
	public CompiledScript commonjs;
	public String[] ignorantFiles = {"jvm-npm.js"};
	private static PldrJS instance = null;

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
	public void onEnable(){
		instance = this;
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");

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
			e.printStackTrace();
			return;
		}

		try{
			commonjs = ((Compilable) engine).compile(new FileReader(new File(baseFolder, "jvm-npm.js")));
		}catch(Exception e){
			e.printStackTrace();
		}

		Arrays.asList(baseFolder.listFiles()).forEach((f) -> {
			try{
				if(!(f.isFile() && f.getName().endsWith(".js"))
					|| Arrays.asList(ignorantFiles).contains(f.getName())){
					return;
				}

				ScriptContext ctx = new SimpleScriptContext();
				ctx.getBindings(ScriptContext.ENGINE_SCOPE).put("PldrJSPlugin", PldrJS.getInstance());

				CompiledScript sc = ((Compilable) engine).compile(new FileReader(f));
				commonjs.eval(ctx);
				//ECMAScript6 not working!
				//engine.eval("Require.root = `" + baseFolder.getAbsolutePath() + "`;");
				engine.eval("require.root = \"" + baseFolder.getAbsolutePath().replace("\\", "\\\\") + "\";", ctx);
				sc.eval(ctx);
			}catch(Exception e){
				e.printStackTrace();
			}
		});
	}
}
