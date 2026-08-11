import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `hh-goa-badge-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;

    let imageUrl = null;

    // 1. Try Catbox.moe Permanent Upload (Server-Side - No Browser CORS!)
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
        imageUrl = catboxUrl.trim();
        console.log(`[Catbox Server Success]: ${imageUrl}`);
      }
    } catch (catboxErr) {
      console.warn('[Catbox Server Notice]:', catboxErr.message);
    }

    // 2. Fallback to TmpFiles if Catbox is busy
    if (!imageUrl) {
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
          imageUrl = tmpData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          console.log(`[TmpFiles Fallback Success]: ${imageUrl}`);
        }
      } catch (tmpErr) {
        console.warn('[TmpFiles Notice]:', tmpErr.message);
      }
    }

    if (imageUrl) {
      return res.json({ success: true, imageUrl: imageUrl });
    }

    // Local save fallback
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    const host = req.get('host') || 'localhost:3000';
    imageUrl = `${req.protocol}://${host}/uploads/${filename}`;

    return res.json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    console.error('Server upload error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Image Upload Server running on http://localhost:${PORT}`);
});
