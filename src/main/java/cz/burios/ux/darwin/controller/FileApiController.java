package cz.burios.ux.darwin.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api")
public class FileApiController {

	private final Path uploadDir;

	// public FileApiController(@org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}") String dir) {
	public FileApiController() {
		String dir = "d:/DATA/burios/repo";
		this.uploadDir = Path.of(dir).toAbsolutePath().normalize();
		try {
			Files.createDirectories(uploadDir);
		} catch (Exception e) {
			throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
		}
	}

	@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) {
		if (file == null || file.isEmpty()) {
			return ResponseEntity.badRequest().body("No file provided");
		}
		String filename = StringUtils.cleanPath(file.getOriginalFilename());
		if (filename.contains("..")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid filename");
		}
		try {
			Path target = uploadDir.resolve(filename);
			Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
			return ResponseEntity.ok()
					.body(java.util.Map.of("filename", filename, "size", file.getSize(), "path", target.toString()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
		}
	}

	@GetMapping("/download/{filename}")
	public ResponseEntity<Resource> download(@PathVariable String filename) {
		String clean = StringUtils.cleanPath(filename);
		if (clean.contains("..")) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		Path file = uploadDir.resolve(clean);
		if (!Files.exists(file)) {
			return ResponseEntity.notFound().build();
		}
		FileSystemResource resource = new FileSystemResource(file.toFile());
		String contentType = "application/octet-stream";
		try {
			contentType = Files.probeContentType(file);
		} catch (Exception ignored) {
		}
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + clean + "\"").body(resource);
	}
}
