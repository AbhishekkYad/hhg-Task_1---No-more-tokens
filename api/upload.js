export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `hh-goa-badge-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;

    // 1. Try Catbox.moe Serverless Upload (Permanent HTTPS URL)
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
        return res.json({ success: true, imageUrl: catboxUrl.trim() });
      }
    } catch (catboxErr) {
      console.warn('[Vercel Catbox Notice]:', catboxErr.message);
    }

    // 2. Fallback to TmpFiles if Catbox is busy
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
        return res.json({ success: true, imageUrl: cleanTmpUrl });
      }
    } catch (tmpErr) {
      console.warn('[Vercel TmpFiles Notice]:', tmpErr.message);
    }

    return res.status(500).json({ success: false, error: 'Upload providers failed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
