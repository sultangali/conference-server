import express from 'express';
import { sendEmail } from '../service/mailSend.js';

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await sendEmail(to, subject, text);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router; 