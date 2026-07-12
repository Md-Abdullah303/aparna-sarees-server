import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

const router = Router();

// ─── POST /api/contact ─── Send contact email
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: "Name, email, and message are required." });
      return;
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subjectLabels: Record<string, string> = {
      bridal: "Bridal Consultation",
      orders: "Existing Order",
      wholesale: "Wholesale Inquiry",
      other: "General Question",
    };

    const subjectLabel = subject ? subjectLabels[subject] || subject : "General Inquiry";

    const mailOptions = {
      from: `"Aparna Sarees Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || "mdabdulla01715940008@gmail.com",
      replyTo: email,
      subject: `[Aparna Sarees] ${subjectLabel} - from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff9f0; border: 1px solid #e5d5c5; border-radius: 8px; overflow: hidden;">
          <div style="background: #590d0d; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffe088; font-size: 24px; margin: 0; letter-spacing: 2px;">APARNA SAREES</h1>
            <p style="color: #ffe08880; font-size: 12px; margin: 5px 0 0; letter-spacing: 3px;">NEW MESSAGE FROM WEBSITE</p>
          </div>
          <div style="padding: 40px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #8a6a5c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">From</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #3a2a2a; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #8a6a5c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #590d0d;"><a href="mailto:${email}" style="color: #590d0d;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #8a6a5c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Subject</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5d5c5; color: #3a2a2a;">${subjectLabel}</td>
              </tr>
            </table>

            <div style="margin-top: 30px;">
              <p style="color: #8a6a5c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Message</p>
              <div style="background: white; border: 1px solid #e5d5c5; border-radius: 6px; padding: 20px; color: #3a2a2a; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          <div style="background: #fdf5e8; padding: 20px 40px; text-align: center; border-top: 1px solid #e5d5c5;">
            <p style="color: #8a6a5c; font-size: 11px; margin: 0;">This message was sent from the contact form on <strong>aparnasarees.com</strong></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("POST /contact error:", err);
    res.status(500).json({ message: "Failed to send email. Please try again later." });
  }
});

export default router;
