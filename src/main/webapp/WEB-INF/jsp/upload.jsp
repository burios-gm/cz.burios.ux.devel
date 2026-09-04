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
		<h1>Nahrát soubor (AJAX)</h1>
		<form id="uploadForm" enctype="multipart/form-data">
			<input type="file" name="file" id="file"/>
			<button type="submit">Nahrát</button>
		</form>
		<div id="result"></div>
		<script>
		$(function() {
			$("#uploadForm").on("submit", function(e) {
		        e.preventDefault();
		        var formData = new FormData(this);
		        $.ajax({
					url: "${pageContext.request.contextPath}/upload",
					type: "POST",
					data: formData,
					processData: false,
					contentType: false,
					success: function(resp) {
						$("#result").html("<p style='color:green'>Soubor nahrán: " + resp.message + "</p>");
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
