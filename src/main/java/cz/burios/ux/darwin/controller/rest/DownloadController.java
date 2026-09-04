package cz.burios.ux.darwin.controller.rest;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.file.*;

@Controller
public class DownloadController {

	private final Path uploadDir = Path.of("d:/DATA/burios/repo").toAbsolutePath();

	@GetMapping("/downloadFile")
	public ResponseEntity<FileSystemResource> downloadFile(@RequestParam("filename") String filename) {
		Path file = uploadDir.resolve(filename);
		if (!Files.exists(file)) {
			return ResponseEntity.notFound().build();
		}
		FileSystemResource resource = new FileSystemResource(file.toFile());
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"").contentType(MediaType.APPLICATION_OCTET_STREAM).body(resource);
	}
}