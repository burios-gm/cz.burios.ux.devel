package cz.burios.qpx.tools;

import java.io.File;
import java.net.URI;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.io.FileUtils;

import io.bit3.jsass.Options;
import io.bit3.jsass.Output;
import io.bit3.jsass.Compiler;

public class SassBuilder {
	// private static String version = "2025.2";
	private static String projectRootDir = Paths.get("").toAbsolutePath().toString();
	
	private static String rootDir = projectRootDir + "/src/main/webapp";

	private static String sassDirUri = "/libs/qpx/scss";
	/*
	 * /src/main/webapp/libs/qpx/scss/qp-framework.scss
	 */
	private static String cssDistDirUri = "/libs/qpx/themes";

	
	public static void main(String[] args) {
		try {
			SassBuilder inst = new SassBuilder();
			inst.compileAllThemes();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void compileAllThemes() {
		Map<String, String[]> themes = new LinkedHashMap<>();
		
		themes.put("default", new String[] {"light"});
		
		for (Map.Entry<String, String[]> e : themes.entrySet()) {
			String prefix = e.getKey();
			if (prefix.equals("default")) {
				String[] val = e.getValue();
				for (int i = 0; i < val.length; i++) {
					String theme = val[i];
					compileDefaultTheme(theme);
				}
			}
		}
	}

	public void compileDefaultTheme(String theme) {
		try {
			/*
			 * /v2-suix/src/main/webapp/src/2019.2/styles/sass/default/light/scss/all.scss
			 */
			String srcRootDir = rootDir + sassDirUri + "";
			String distRootDir = rootDir + cssDistDirUri;
			String distFileName = "/qpx.default-" + theme + ".css";
			
			URI inputFile = new File(srcRootDir + "/qp-framework.scss").toURI();
			System.out.println("inputFile: " + inputFile);
			URI outputFile = new File(distRootDir + "/" + distFileName).toURI();
			System.out.println("outputFile: " + outputFile);
			
			Compiler compiler = new Compiler();
			Options options = new Options();
			options.setOutputStyle(io.bit3.jsass.OutputStyle.EXPANDED);
			options.setSourceMapRoot(new File(distRootDir + "/maps/").toURI()); 
			options.setSourceMapEmbed(false);
			
			Output output = compiler.compileFile(inputFile, outputFile, options);
			System.out.println("Compiled successfully");
			
			File destFile = new File(distRootDir + distFileName);
			FileUtils.write(destFile, output.getCss(), "UTF-8");
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}