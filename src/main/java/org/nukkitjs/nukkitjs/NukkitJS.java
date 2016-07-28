package org.nukkitjs.nukkitjs;

import cn.nukkit.plugin.PluginBase;

import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.util.Arrays;

import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.script.SimpleScriptContext;

public class NukkitJS extends PluginBase{
	@Override
	public void onEnable(){
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
		CompiledScript nukkitjs;
		try{
			nukkitjs = ((Compilable) engine).compile(
				new InputStreamReader(
					this.getClass().getClassLoader().getResourceAsStream("nukkit.js")
				)
			);
		}catch(ScriptException e){
			e.printStackTrace();
			return;
		}
		
		if(!new File(this.getDataFolder(), "commonjs").exists()){
			
		}
		
		Arrays.asList((new File("plugins/")).listFiles()).forEach((f) -> {
			try{
				ScriptContext ctx = new SimpleScriptContext();
				CompiledScript sc = ((Compilable) engine).compile(new FileReader(f));
				nukkitjs.eval(ctx);
				sc.eval(ctx);
			}catch(Exception e){
				e.printStackTrace();
			}
		});
	}
}
