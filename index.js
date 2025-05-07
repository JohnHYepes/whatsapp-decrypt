const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
const upload = multer();

app.use(cors());

app.post('/decrypt', upload.single('file'), async (req, res) => {
  console.log("BODY:", req.body); // <--- agrega esto
  console.log("FILE SIZE:", req.file?.buffer?.length || 0);
  console.log("mediaKey:", req.body.mediaKey);

  try {
    const encBuffer = req.file.buffer;
    const mediaKeyB64 = req.body.media_key;
    const mediaKey = Buffer.from(mediaKeyB64, 'base64');
    const iv = Buffer.alloc(16, 0);
    const salt = Buffer.from("WhatsApp Voice Keys");
    const cipherKey = crypto.createHmac('sha256', mediaKey).update(salt).digest().slice(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decrypted = Buffer.concat([decipher.update(encBuffer), decipher.final()]);

    res.setHeader('Content-Type', 'audio/ogg');
    res.send(decrypted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to decrypt audio' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));
