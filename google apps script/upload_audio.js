function doPost(e) {
    try {
      // Parse incoming JSON payload
      const data = JSON.parse(e.postData.contents);
  
      // Extract parameters
      const base64Data = data.fileData;
      const mimeType = data.mimeType || "application/octet-stream";
      const questionId = data.questionId || "unknown";
  
      // Destination folder in Google Drive
      const folderId = "YOUR_FOLDER_ID_HERE"; // Replace with your folder ID
      const folder = DriveApp.getFolderById(folderId);
  
      // Create blob from base64 and set its name
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType);
      blob.setName(`audio_${questionId}_${Date.now()}.webm`);
  
      // Save file to Drive
      const file = folder.createFile(blob);
  
      // Return success response with file URL
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, fileUrl: file.getUrl() }))
        .setMimeType(ContentService.MimeType.JSON);
  
    } catch (err) {
      // Return error response
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }