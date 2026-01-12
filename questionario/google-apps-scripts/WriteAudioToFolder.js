// apps script page: https://script.google.com/u/1/home/projects/1D38nCxqOT0fnzNbGjqHGUJZdcQG2WiDJHeD210qzrI20AXAsKv1VMKgu/edit

function doPost(e) {
    try {
        const folder = DriveApp.getFolderById("1fkxoEpkbBI-6Y7eIzPc8-S0jRRJUxTTp");

        // Parse JSON body
        const data = JSON.parse(e.postData.contents);

        // Use the filename from the request
        if (!data.filename) {
            throw new Error("Filename is required");
        }

        // Decode base64 file and create blob with the provided filename
        const fileContent = Utilities.base64Decode(data.file);

        const blob = Utilities.newBlob(fileContent, "audio/webm", data.filename);

        const file = folder.createFile(blob);

        const output = ContentService.createTextOutput();
        output.setMimeType(ContentService.MimeType.JSON);
        output.setContent(JSON.stringify({
            success: true,
            url: file.getUrl(),
            id: file.getId(),
        }));

        return output;

    } catch (error) {

        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
