<%@ page contentType="text/html;charset=UTF-8"%>
<%@ taglib prefix = "c" uri = "http://java.sun.com/jsp/jstl/core" %>

<%
System.out.println("/darwin/");
%>
<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>Buriosca.cz - Darwin QPX</title>
	<link rel="icon" href="/darwin/favicon.png">
	<link rel="stylesheet" href="/darwin/libs/jqx/jqx.css" rel="stylesheet" type="text/css">
	
	<style type="text/css">
	html, body {
		font-family: Segoe UI;
		font-size: 12px;
	}
	table { 
		border-collapse: collapse; width: 100%; 
	}
	th, td { 
		border: 1px solid #ccc; padding: 8px; text-align: center; 
	}
	img.thumbnail { 
		width: 40px; height: 40px; border-radius: 50%; object-fit: cover; aspect-ratio: 1 / 1;
	}
	.download-icon { 
		width: 24px; height: 24px; 
	}	
	</style>
	<script type="text/javascript" src="/darwin/libs/jquery/jquery-3.7.1.js"></script>
	<script>
	</script>
</head>
<body>
	<h2>Buriosca.cz - Darwin QPX - FileManager</h2>
	
	<form id="uploadForm" enctype="multipart/form-data">
		<input type="file" name="file" id="fileInput"/>
		<button type="submit">Upload souboru</button>
	</form>
	<hr/>
	
	<table>
		<tr>
			<th></th>
			<th>Název souboru</th>
			<th>Download</th>
		</tr>
		<c:forEach var="file" items="${files}">
			<tr id="${file.id}">
				<td>
					<img class="thumbnail" src="/darwin/files/download?fileId=${file.id}" alt=""/>
				</td>
				<td>${file.fileName}</td>
				<td>
					<img class="download-icon" src="/darwin/icons/download_24.png" alt="Download" data-id="${file.id}" />
 				</td>
			</tr>
		</c:forEach>
	</table>
	<script>
	$(function() {
		$(".download-icon").on("click", function() {
			let fileId = $(this).data("id");
			// AJAX požadavek na server
			$.ajax({
				url: "/darwin/files/ajax/download",
				type: "GET",
				data: { "fileId" :  + fileId },
				xhrFields: {
					responseType: "blob" // očekáváme binární data
				}
			}).done(function(blob, status, xhr) {
				// získáme název souboru z hlavičky Content-Disposition
				let disposition = xhr.getResponseHeader("Content-Disposition");
				let fileName = "downloaded_file";
				if (disposition && disposition.indexOf("filename=") !== -1) {
					fileName = disposition.split("filename=")[1].replace(/"/g, "");
				}
				// vytvoříme dočasný odkaz a spustíme download
				let url = window.URL.createObjectURL(blob);
				let a = document.createElement("a");
				a.href = url;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);
			}).fail(function() {
				alert("Chyba při stahování souboru.");
			});
		});
		$("#uploadForm").on("submit", function(e) {
			e.preventDefault();
			let formData = new FormData(this);
			$.ajax({
				url: "/darwin/files/ajax/upload",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false
			}).done(function(file) {
				let row = "" +
					"<tr id='" + file.id + "'>" +
						"<td>" +
							"<img class='thumbnail' src='/darwin/files/download?fileId='" + filw.id + "' alt=''/>" +
						"</td>" +
						"<td>" + file.fileName + "</td>" +
						"<td>" +
							"<img class='download-icon' src='/darwin/icons/download_24.png' alt='Download' data-id='" + file.id +"' />" +
						"</td>" +
					"</tr>";
				$("#fileTable").append(row);
				$("data-id='" + file.id + "'").on("click", function(e) {
					downloadFile(e);
				});
			}).fail(function(xhr) {
				alert("Chyba při uploadu: " + xhr.responseText);
			});
		});
	});
	function downloadFile(e) {
		alert("download...");	
	}
    </script>		
</body>
</html>	
	