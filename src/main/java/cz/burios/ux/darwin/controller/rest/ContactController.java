package cz.burios.ux.darwin.controller.rest;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cz.burios.ux.darwin.db.dao.BasicRecord;
import cz.burios.ux.darwin.db.dao.DSL;
import jakarta.servlet.http.HttpServletRequest;

import java.net.http.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/data")
public class ContactController {

	@GetMapping(path = "/contacts"/*, consumes = MediaType.APPLICATION_JSON_VALUE*/)
	public List<BasicRecord> handleGridData(
		@RequestParam Map<String, Object> params,
		//@RequestParam(name = "sort", required = false) Object sort,
		// @RequestParam(name = "sortField", required = false) String sortField,
		// @RequestParam(name = "sortDir", required = false) String sortDir,
		// @RequestParam(name = "filters", required = false) String filters,
		// @RequestParam(required = false) int page,
		// @RequestParam(required = false) int pageSize
		HttpServletRequest request) {

		System.out.println("ContactController.getAll()");
		try {
//			System.out.println("sort: " + sort);
			System.out.println("params: " + params);
			
			/*
			System.out.println("params: " + request.getParameterMap());
			System.out.println("--------------------");
			for (Map.Entry<String, String[]> e : request.getParameterMap().entrySet()) {
				System.out.println(e.getKey() + " = " + e.getValue());
			}
			System.out.println("--------------------");
			*/
		} catch (Exception e) {
			e.printStackTrace();
		}
		List<BasicRecord> contacts = getAllData();
		return contacts;
	}

	protected List<BasicRecord> getAllData() {
		List<BasicRecord> data = new ArrayList<>();
		try {
			data = DSL.select("NUMBER", "CODE3", "CODE2", "NAME").from("countries").execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
		// System.out.println("ContactController.getAllData().data:\n" + data);
		return data;
	}
}