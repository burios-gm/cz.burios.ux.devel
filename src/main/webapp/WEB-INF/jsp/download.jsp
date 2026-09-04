<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix = "c" uri = "http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html lang="cs">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	
		<title>Buriosca.cz - Darwin QPX</title>

		<link rel="icon" href="/darwin/favicon.png">
		<style type="text/css">
		html, body {
			font-family: Segoe UI;
			font-size: 12px;
		}
		</style>
		<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
	</head>
	<body>
		<h1>Stáhnout soubor (AJAX)</h1>

		<form id="downloadForm">
			<label for="filename">Název souboru:</label>
			<input type="text" id="filename" name="filename"/>
			<button type="submit">Stáhnout</button>
		</form>

		<div id="result"></div>
		<script>
		$(function() {
			$("#downloadForm").on("submit", function(e) {
				e.preventDefault();
				var filename = $("#filename").val();
				if (!filename) {
					$("#result").html("<p style='color:red'>Zadejte název souboru.</p>");
					return;
				}
				// AJAX volání pro stažení souboru
				$.ajax({
					url: "${pageContext.request.contextPath}/downloadFile",
					type: "GET",
					data: { filename: filename },
					xhrFields: { responseType: 'blob' },
					success: function(blob, status, xhr) {
						var disposition = xhr.getResponseHeader('Content-Disposition');
						var downloadName = filename;
						if (disposition && disposition.indexOf('filename=') !== -1) {
						    downloadName = disposition.split('filename=')[1].replace(/"/g, '');
						}
						var url = window.URL.createObjectURL(blob);
						var a = document.createElement('a');
						a.href = url;
						a.download = downloadName;
						document.body.appendChild(a);
						a.click();
						a.remove();
						window.URL.revokeObjectURL(url);
						$("#result").html("<p style='color:green'>Soubor " + downloadName + " stažen.</p>");
		            },
		            error: function(xhr) {
		                $("#result").html("<p style='color:red'>Chyba: " + xhr.responseText + "</p>");
		            }
				});
			});
		});
		</script>
	</body>
</html>
