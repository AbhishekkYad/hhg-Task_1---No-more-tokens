export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { image } = body;

    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'No image provided' }) };
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `hh-goa-badge-${Date.now()}.png`;

    // 1. Try Catbox.moe Upload
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('fileToUpload', blob, filename);

      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      const catboxUrl = await catboxRes.text();

      if (catboxUrl && catboxUrl.trim().startsWith('http')) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, imageUrl: catboxUrl.trim() })
        };
      }
    } catch (err) {
      console.warn('[Netlify Catbox Notice]:', err.message);
    }

    // 2. Fallback to TmpFiles
    try {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('file', blob, filename);

      const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      const tmpData = await tmpRes.json();
      if (tmpData && tmpData.data && tmpData.data.url) {
        const cleanTmpUrl = tmpData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, imageUrl: cleanTmpUrl })
        };
      }
    } catch (err) {
      console.warn('[Netlify TmpFiles Notice]:', err.message);
    }

    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Upload failed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
}
