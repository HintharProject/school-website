import { z } from "zod";
import { portalUrl } from "@/lib/routes/public";

/**
 * Shared email utilities. Resend HTTP API only — SMTP/nodemailer is not
 * viable on Cloudflare Workers. All dynamic values are HTML-escaped before
 * being interpolated into templates.
 */

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const emailTypeEnum = z.enum([
  "admission_submitted",
  "assessment_scheduled",
  "admission_status_updated",
  "general_notice",
  "newsletter_welcome",
]);

export const emailPayloadSchema = z.object({
  type: emailTypeEnum,
  recipientEmail: z.string().email().max(320),
  recipientName: z.string().max(200).optional(),
  studentName: z.string().max(200).optional(),
  applicationId: z.string().max(50).optional(),
  grade: z.string().max(100).optional(),
  assessmentDate: z.string().max(100).optional(),
  campus: z.string().max(200).optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

export interface EmailResult {
  sent: boolean;
  simulated: boolean;
  provider?: "resend";
  id?: string;
  error?: string;
}

const FOOTER_HTML = `
      <div style="background-color:#f1f5f9;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
        <p style="margin:0 0 6px;"><strong>Admissions Office &middot; Hinthar International School</strong></p>
        <p style="margin:0;">Phone: +95 9 894 332200 / +95 9 894 332211 | Email: admissions@hinthar.education</p>
        <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) &middot; Mawlamyine Regional Campus</p>
      </div>`;

function headerBlock(title: string, subtitle: string): string {
  return `
        <div style="background-color:#09234B;padding:28px 24px;text-align:center;">
          <h1 style="color:#FFC700;font-size:20px;font-weight:800;margin:0;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(title)}</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1.5px;">${escapeHtml(subtitle)}</p>
        </div>`;
}

function buildBody(payload: EmailPayload): { subject: string; html: string } {
  const recipientName = payload.recipientName || "Parent / Guardian";
  const studentName = payload.studentName || "Applicant";
  const siteUrl = (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://hinthar.thawyezaw.workers.dev"
  ).replace(/\/$/, "");
  const applicationId = payload.applicationId || "HIS-APP";
  const grade = payload.grade || "Pearson Edexcel Track";
  const applicationPortalUrl = new URL(
    portalUrl({ id: applicationId, email: payload.recipientEmail }),
    siteUrl
  ).toString();

  if (payload.type === "admission_submitted") {
    return {
      subject: `Admission Application Received [${applicationId}] — ${studentName}`,
      html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        ${headerBlock("Hinthar International School", "Pearson Edexcel Approved Centre")}
        <div style="padding:32px 28px;">
          <p style="font-size:15px;color:#1e293b;margin-top:0;">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
          <p style="font-size:14px;color:#475569;line-height:1.6;">
            Thank you for applying to <strong>Hinthar International School</strong> for the upcoming academic year. We have successfully received the enrollment application for <strong>${escapeHtml(studentName)}</strong>.
          </p>
          <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0E3B7D;border-radius:8px;padding:18px 20px;margin:24px 0;">
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Application Summary</p>
            <table style="width:100%;font-size:13px;color:#334155;">
              <tr><td style="padding:4px 0;font-weight:600;width:140px;">Reference ID:</td><td style="color:#0E3B7D;font-weight:800;font-family:monospace;">${escapeHtml(applicationId)}</td></tr>
              <tr><td style="padding:4px 0;font-weight:600;">Student Name:</td><td>${escapeHtml(studentName)}</td></tr>
              <tr><td style="padding:4px 0;font-weight:600;">Target Grade:</td><td>${escapeHtml(grade)}</td></tr>
              <tr><td style="padding:4px 0;font-weight:600;">Application Status:</td><td><span style="background-color:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;font-weight:700;font-size:11px;">${escapeHtml(payload.status || "Pending")}</span></td></tr>
            </table>
          </div>
          <h3 style="font-size:14px;color:#09234B;margin:20px 0 8px;">Next Steps:</h3>
          <ul style="font-size:13px;color:#475569;padding-left:20px;line-height:1.6;">
            <li>Our Admissions Committee will review the submitted academic records within 24–48 business hours.</li>
            <li>You will receive an email invitation to schedule a diagnostic placement assessment and campus tour.</li>
            <li>Keep your Application Reference ID (<strong>${escapeHtml(applicationId)}</strong>) for all future communications.</li>
            <li>Track your application status anytime in the <a href="${escapeHtml(applicationPortalUrl)}" style="color:#0E3B7D;font-weight:700;">Student Portal</a>.</li>
          </ul>
        </div>
        ${FOOTER_HTML}
      </div>`,
    };
  }

  if (payload.type === "assessment_scheduled") {
    return {
      subject: `Diagnostic Assessment Scheduled [${applicationId}] — ${studentName}`,
      html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        ${headerBlock("Diagnostic Assessment Scheduled", "Hinthar International School")}
        <div style="padding:32px 28px;">
          <p style="font-size:15px;color:#1e293b;">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
          <p style="font-size:14px;color:#475569;line-height:1.6;">
            We are pleased to inform you that the placement assessment for <strong>${escapeHtml(studentName)}</strong> has been officially scheduled.
          </p>
          <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:8px;padding:18px 20px;margin:24px 0;">
            <table style="width:100%;font-size:13px;color:#1e3a8a;">
              <tr><td style="padding:4px 0;font-weight:700;width:140px;">Reference ID:</td><td style="font-family:monospace;font-weight:800;">${escapeHtml(applicationId)}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;">Scheduled Date &amp; Time:</td><td style="font-weight:800;color:#1d4ed8;">${escapeHtml(payload.assessmentDate || "TBA by Admissions Office")}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;">Campus Location:</td><td>${escapeHtml(payload.campus || "Yangon Flagship (Ywarma Campus)")}</td></tr>
              <tr><td style="padding:4px 0;font-weight:700;">Target Stream:</td><td>${escapeHtml(grade)}</td></tr>
            </table>
          </div>
          ${
            payload.notes
              ? `<div style="background-color:#f8fafc;padding:12px 16px;border-radius:8px;font-size:12px;color:#475569;margin-bottom:20px;"><strong>Special Instructions:</strong> ${escapeHtml(payload.notes)}</div>`
              : ""
          }
          <p style="font-size:13px;color:#475569;">
            Please arrive 15 minutes before the scheduled time. Applicants should bring previous school transcripts, identification documents, and standard writing stationery.
          </p>
        </div>
        ${FOOTER_HTML}
      </div>`,
    };
  }

  if (payload.type === "newsletter_welcome") {
    return {
      subject: `Welcome to the Hinthar Newsletter`,
      html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        ${headerBlock("You're Subscribed", "Hinthar International School Newsletter")}
        <div style="padding:28px;">
          <p style="font-size:14px;color:#334155;">Dear ${escapeHtml(recipientName)},</p>
          <p style="font-size:13px;color:#475569;line-height:1.7;">
            Thank you for subscribing to updates from <strong>Hinthar International School</strong>. You will now
            receive admission announcements, examination timetables, school events, and student achievement stories.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${siteUrl}/admission" style="display:inline-block;background-color:#0E3B7D;color:#ffffff;font-size:13px;font-weight:800;padding:12px 28px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;text-decoration:none;">Start an Application</a>
          </div>
          <p style="font-size:12px;color:#94a3b8;">
            You received this email because you subscribed at our website. To unsubscribe, reply to this email with
            &ldquo;UNSUBSCRIBE&rdquo;.
          </p>
        </div>
        ${FOOTER_HTML}
      </div>`,
    };
  }

  return {
    subject: `Admissions Update [${applicationId}] — ${studentName}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        ${headerBlock("Application Status Update", "Hinthar International School")}
        <div style="padding:32px 28px;">
          <p style="font-size:15px;color:#1e293b;">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
          <p style="font-size:14px;color:#475569;line-height:1.6;">
            The status for <strong>${escapeHtml(studentName)}</strong>'s enrollment application (Reference: <strong>${escapeHtml(applicationId)}</strong>) has been updated to:
          </p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;background-color:#0E3B7D;color:#ffffff;font-size:15px;font-weight:800;padding:10px 24px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(payload.status || "Updated")}</span>
          </div>
          ${
            payload.notes
              ? `<div style="background-color:#f8fafc;border-left:4px solid #0E3B7D;padding:14px 18px;border-radius:8px;font-size:13px;color:#334155;margin:20px 0;"><strong>Admissions Note:</strong> ${escapeHtml(payload.notes)}</div>`
              : ""
          }
          <p style="font-size:13px;color:#475569;">
            If you have any questions regarding your application, please reach out to our admissions coordinators.
          </p>
        </div>
        ${FOOTER_HTML}
      </div>`,
  };
}

async function dispatch(payload: unknown): Promise<EmailResult> {
  const parsed = emailPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { sent: false, simulated: false, error: "Invalid email payload." };
  }
  const valid = parsed.data;
  const { subject, html } = buildBody(valid);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL SIMULATED] To: ${valid.recipientEmail} | Subject: ${subject}`);
    return { sent: false, simulated: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from =
      process.env.RESEND_FROM || "Hinthar Admissions <onboarding@resend.dev>";
    const { data, error } = await resend.emails.send({
      from,
      to: [valid.recipientEmail],
      subject,
      html,
    });

    if (error) {
      // Retry once via the Resend sandbox sender if the custom domain is unverified
      if (from !== "onboarding@resend.dev" && error.message?.includes("domain")) {
        const retry = await resend.emails.send({
          from: "Hinthar Admissions <onboarding@resend.dev>",
          to: [valid.recipientEmail],
          subject,
          html,
        });
        if (!retry.error) {
          return { sent: true, simulated: false, provider: "resend", id: retry.data?.id };
        }
      }
      console.warn("Resend API returned error:", error.message);
      return { sent: false, simulated: false, error: error.message };
    }

    return { sent: true, simulated: false, provider: "resend", id: data?.id };
  } catch (err: unknown) {
    console.warn("Email dispatch error:", err instanceof Error ? err.message : err);
    return { sent: false, simulated: false, error: "Email delivery failed." };
  }
}

export async function sendAdmissionEmail(payload: unknown): Promise<EmailResult> {
  return dispatch(payload);
}
