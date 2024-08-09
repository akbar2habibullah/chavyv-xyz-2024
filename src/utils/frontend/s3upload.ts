"use client"

export const uploadFileToS3 = async (file: File) => {
  const fileName = file.name; // Use the original file name or customize as needed
  const contentType = file.type;

  try {
    // Step 1: Get the pre-signed URL from the server
    const response = await fetch('/api/generate-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate upload URL');
    }

    const data = await response.json();
    const uploadURL = data.url;

    // Step 2: Upload the file directly to S3 using the pre-signed URL
    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (uploadResponse.ok) {
      console.log('File uploaded successfully');
      return true;
    } else {
      console.error('File upload failed');
      return false;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
};