package cz.burios.ux.darwin.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.apache.commons.lang3.time.DateFormatUtils;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class TestController {
	
	@GetMapping("/download")
	public ModelAndView showDownloadForm() {
		ModelAndView view = new ModelAndView("download");
		try {
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}

	@GetMapping("/upload")
	public ModelAndView showUploadForm() {
		ModelAndView view = new ModelAndView("upload");
		try {
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}
	
	@GetMapping("/test/{name}")
	public ModelAndView page(@PathVariable("name") String name) {
		/*
		"button";
		"buttongroup";
		"dropdownbutton";
		"layout";
		// "photo";
		"template";
		"toolbar";
		*/
		String path = "test/" + name;
		System.out.println("TestController.page.path: " + path);
		ModelAndView view = new ModelAndView(path);
		try {
			java.util.Date now = new java.util.Date();
			LocalDateTime ldtNow = LocalDateTime.now();
			String timeNo = ldtNow.format(DateTimeFormatter.ofPattern("yyyyMMdd.HHmmssSSS"));
			// System.out.println("timeNo: " + timeNo);
			view.addObject("timeNo", DateFormatUtils.format(now, "yyyyMMdd.HHmmssSSS"));
			view.addObject("appTitle", "Buriosca.cz - QPX Devel");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}

}