package cz.burios.ux.darwin.controller;

import org.apache.commons.lang3.time.DateFormatUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import cz.burios.ux.darwin.db.DBContext;

import org.springframework.ui.Model;

@Controller
public class HomeController {

	@GetMapping("/")
	public ModelAndView index() {
		ModelAndView view = new ModelAndView("index");
		try {
			java.util.Date now = new java.util.Date();
			view.addObject("timeNo", DateFormatUtils.format(now, "yyyyMMdd.HHmmssSSS"));
			/*
			// SELECT s offsetem
			List<BasicRecord> data = new DSLSelect()
				.select("file_store")
				.where("file_name LIKE ?", "%.png")
				.orderBy("id", "DESC")
				.limit(10)
				.offset(20)
				.execute();
			
			// INSERT
			BasicRecord rec = new BasicRecord();
			rec.setString("id", "FS02_00000099");
			rec.setString("file_name", "novy.png");
			new DSLInsert().insert("file_store").values(rec).execute();
			
			// UPDATE
			BasicRecord upd = new BasicRecord();
			upd.setString("file_name", "upraveny.png");
			new DSLUpdate().update("file_store").set(upd).where("id=?", "FS02_00000099").execute();
			
			// DELETE
			new DSLDelete().delete("file_store").where("id=?", "FS02_00000099").execute();	
			
			// ----------------------------------------------------------
			
			List<BasicRecord> data = DSL
				.select("id", "file_name")
				.from("file_store")
				.where("id=?", "FS02_00000001")
				.orderBy("id", "DESC")
				.limit(10)
				.offset(20)
				.execute();

			List<BasicRecord> data = DSL
				.select("f.id AS fileId", "f.file_name AS fileName", "u.username AS userName")
				.from("file_store f")
				.join("INNER JOIN users u ON f.user_id = u.id")
				.where("f.id=?", "FS02_00000001")
				.execute();

			BasicRecord rec = new BasicRecord();
			rec.setString("id", "FS02_00000100");
			rec.setString("file_name", "novy.png");
			
			DSL.insert("file_store")
				.values(rec)
				.execute();

			BasicRecord upd = new BasicRecord();
			upd.setString("file_name", "upraveny.png");
			
			DSL.update("file_store")
				.set(upd)
				.where("id=?", "FS02_00000100")
				.execute();

			DSL.delete("file_store")
				.where("id=?", "FS02_00000100")
				.execute(); 
			 */
		} catch (Exception e) {
			e.printStackTrace();
		}
		return view;
	}
}