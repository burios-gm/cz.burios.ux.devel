package cz.burios.ux.darwin.controller.rest;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.Map;

@Controller
public class UploadController {

	private final Path uploadDir = Path.of("d:/DATA/burios/repo").toAbsolutePath();

	public UploadController() {
		try {
			Files.createDirectories(uploadDir);
		} catch (Exception ignored) {
		}
	}

	@PostMapping(value = "/upload", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, String> handleUpload(@RequestParam("file") MultipartFile file) {
		if (file.isEmpty()) {
			return Map.of("message", "Soubor nebyl vybrán.");
		}
		try {
			Path target = uploadDir.resolve(file.getOriginalFilename());
			Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
			return Map.of("message", "Soubor " + file.getOriginalFilename() + " byl nahrán.");
		} catch (Exception e) {
			return Map.of("message", "Chyba při uploadu: " + e.getMessage());
		}
	}
}