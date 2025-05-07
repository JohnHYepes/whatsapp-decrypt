const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/decrypt', upload.single('file'), async (req, res) => {
  try {
  const encBuffer = req.file.buffer;
  const mediaKeyB64 = req.body.mediaKey?.trim(); // Asegura que no venga con saltos de línea

  if (!mediaKeyB64) throw new Error('Missing mediaKey');
  const mediaKey = Buffer.from(mediaKeyB64, 'base64');

  if (mediaKey.length !== 32) throw new Error('Invalid mediaKey length');

  const iv = Buffer.alloc(16, 0);
  const salt = Buffer.from('WhatsApp Voice Keys');
  const cipherKey = crypto.createHmac('sha256', mediaKey).update(salt).digest().slice(0, 32);

  const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
  const decrypted = Buffer.concat([decipher.update(encBuffer), decipher.final()]);

  res.setHeader('Content-Type', 'audio/ogg');
  res.send(decrypted);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Failed to decrypt audio', details: err.message });
}
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));
