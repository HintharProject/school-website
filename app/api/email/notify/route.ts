import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

interface EmailPayload {
  type: "admission_submitted" | "assessment_scheduled" | "admission_status_updated" | "general_notice";
  recipientEmail: string;
  recipientName?: string;
  studentName?: string;
  applicationId?: string;
  grade?: string;
  assessmentDate?: string;
  campus?: string;
  status?: string;
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const payload: EmailPayload = await req.json();
    const {
      type,
      recipientEmail,
      recipientName = "Parent / Guardian",
      studentName = "Applicant",
      applicationId = "HIS-2026-APP",
      grade = "Pearson Edexcel Track",
      assessmentDate,
      campus = "Yangon Flagship (Ywarma Campus)",
      status = "Pending",
      notes,
    } = payload;

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid recipient email address" },
        { status: 400 }
      );
    }

    let subject = "Hinthar International School — Admissions Notification";
    let bodyHtml = "";

    if (type === "admission_submitted") {
      subject = `Admission Application Received [${applicationId}] — ${studentName}`;
      bodyHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #09234B; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFC700; font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Hinthar International School</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Pearson Edexcel Approved Center</p>
          </div>
          <div style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Thank you for applying to <strong>Hinthar International School</strong> for the upcoming academic year. We have successfully received the enrollment application for <strong>${studentName}</strong>.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0E3B7D; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Application Summary</p>
              <table style="width: 100%; font-size: 13px; color: #334155;">
                <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Reference ID:</td><td style="color: #0E3B7D; font-weight: 800; font-family: monospace;">${applicationId}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Student Name:</td><td>${studentName}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Target Grade:</td><td>${grade}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Application Status:</td><td><span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">${status}</span></td></tr>
              </table>
            </div>
            <h3 style="font-size: 14px; color: #09234B; margin: 20px 0 8px;">Next Steps:</h3>
            <ul style="font-size: 13px; color: #475569; padding-left: 20px; line-height: 1.6;">
              <li>Our Admissions Committee will review the submitted academic records within 24–48 business hours.</li>
              <li>You will receive an email invitation to schedule a diagnostic placement assessment and campus tour.</li>
              <li>Keep your Application Reference ID (<strong>${applicationId}</strong>) for all future communications.</li>
            </ul>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px;"><strong>Admissions Office · Hinthar International School</strong></p>
            <p style="margin: 0;">Phone: +95 9 894 332200 / +95 9 894 332211 | Email: admissions@hinthar.education</p>
            <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) · Mawlamyine Regional Campus</p>
          </div>
        </div>
      `;
    } else if (type === "assessment_scheduled") {
      subject = `Diagnostic Assessment Scheduled [${applicationId}] — ${studentName}`;
      bodyHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #09234B; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFC700; font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase;">Diagnostic Assessment Scheduled</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">Hinthar International School</p>
          </div>
          <div style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              We are pleased to inform you that the placement assessment for <strong>${studentName}</strong> has been officially scheduled.
            </p>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
              <table style="width: 100%; font-size: 13px; color: #1e3a8a;">
                <tr><td style="padding: 4px 0; font-weight: 700; width: 140px;">Reference ID:</td><td style="font-family: monospace; font-weight: 800;">${applicationId}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 700;">Scheduled Date & Time:</td><td style="font-weight: 800; color: #1d4ed8;">${assessmentDate || "TBA by Admissions Office"}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 700;">Campus Location:</td><td>${campus}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 700;">Target Stream:</td><td>${grade}</td></tr>
              </table>
            </div>
            ${notes ? `<div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #475569; margin-bottom: 20px;"><strong>Special Instructions:</strong> ${notes}</div>` : ""}
            <p style="font-size: 13px; color: #475569;">
              Please arrive 15 minutes before the scheduled time. Applicants should bring previous school transcripts, identification documents, and standard writing stationery.
            </p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0;"><strong>Hinthar International School Admissions Office</strong></p>
            <p style="margin: 4px 0 0;">Phone: +95 9 894 332200 | admissions@hinthar.education</p>
          </div>
        </div>
      `;
    } else {
      subject = `Admissions Update [${applicationId}] — ${studentName}`;
      bodyHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #09234B; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFC700; font-size: 20px; font-weight: 800; margin: 0;">Application Status Update</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">Hinthar International School</p>
          </div>
          <div style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b;">Dear <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              The status for <strong>${studentName}</strong>'s enrollment application (Reference: <strong>${applicationId}</strong>) has been updated to:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; background-color: #0E3B7D; color: #ffffff; font-size: 15px; font-weight: 800; padding: 10px 24px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${status}</span>
            </div>
            ${notes ? `<div style="background-color: #f8fafc; border-left: 4px solid #0E3B7D; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #334155; margin: 20px 0;"><strong>Admissions Note:</strong> ${notes}</div>` : ""}
            <p style="font-size: 13px; color: #475569;">
              If you have any questions regarding your application, please reach out to our admissions coordinators.
            </p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0;"><strong>Hinthar International School Admissions Office</strong></p>
            <p style="margin: 4px 0 0;">Phone: +95 9 894 332200 | admissions@hinthar.education</p>
          </div>
        </div>
      `;
    }

    const defaultFrom =
      process.env.RESEND_FROM ||
      process.env.SMTP_FROM ||
      "Hinthar Admissions <onboarding@resend.dev>";

    // 1. Primary: Official Resend API SDK
    const resendApiKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith("re_") ? process.env.SMTP_PASS : undefined);

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { data, error } = await resend.emails.send({
          from: defaultFrom,
          to: [recipientEmail],
          subject,
          html: bodyHtml,
        });

        if (error) {
          console.warn("Resend API returned error:", error);
          // If custom domain unverified, try falling back to onboarding@resend.dev for test deliveries
          if (defaultFrom !== "onboarding@resend.dev" && error.message?.includes("domain")) {
            const retry = await resend.emails.send({
              from: "Hinthar Admissions <onboarding@resend.dev>",
              to: [recipientEmail],
              subject,
              html: bodyHtml,
            });
            if (!retry.error) {
              return NextResponse.json({
                success: true,
                delivered: true,
                provider: "resend",
                recipient: recipientEmail,
                id: retry.data?.id,
                message: "Email dispatched via Resend (onboarding domain)",
              });
            }
          }
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          delivered: true,
          provider: "resend",
          recipient: recipientEmail,
          id: data?.id,
          message: "Email dispatched successfully via Resend SDK",
        });
      } catch (resendErr: any) {
        console.error("Resend execution error:", resendErr);
      }
    }

    // 2. Alternative: Resend SMTP / Standard SMTP Transport
    const smtpHost = process.env.SMTP_HOST || "smtp.resend.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER || "resend";
    const smtpPass = process.env.SMTP_PASS || process.env.RESEND_API_KEY;
    const smtpFrom = process.env.SMTP_FROM || defaultFrom;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const info = await transporter.sendMail({
          from: smtpFrom,
          to: recipientEmail,
          subject,
          html: bodyHtml,
        });

        return NextResponse.json({
          success: true,
          delivered: true,
          provider: "smtp",
          recipient: recipientEmail,
          messageId: info.messageId,
          message: `Email sent successfully via SMTP (${smtpHost})`,
        });
      } catch (smtpErr: any) {
        console.error("SMTP sending error:", smtpErr);
      }
    }

    // 3. Fallback: Simulation Logging when no Resend API key is present
    console.log(`[RESEND EMAIL SIMULATED] To: ${recipientEmail} | Subject: ${subject}`);
    return NextResponse.json({
      success: true,
      delivered: false,
      simulated: true,
      recipient: recipientEmail,
      message: "Email notification simulated. Set RESEND_API_KEY in .env.local for live dispatch.",
    });
  } catch (error: any) {
    console.error("Email notification handler error:", error);
    return NextResponse.json(
      { error: "Internal server error processing email notification" },
      { status: 500 }
    );
  }
}
