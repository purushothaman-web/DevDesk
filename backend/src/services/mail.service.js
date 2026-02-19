import nodemailer from "nodemailer";

const port = parseInt(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; color: #bfdbfe; font-size: 13px; }
    .body { padding: 36px 40px; color: #374151; }
    .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.7; }
    .info-card { background: #f0f4ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .info-card table { width: 100%; border-collapse: collapse; }
    .info-card td { padding: 6px 0; font-size: 14px; color: #374151; }
    .info-card td:first-child { font-weight: 600; color: #1e3a5f; width: 110px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-high { background: #fee2e2; color: #b91c1c; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-low { background: #d1fae5; color: #065f46; }
    .badge-open { background: #dbeafe; color: #1d4ed8; }
    .badge-in-progress { background: #fef3c7; color: #92400e; }
    .badge-resolved { background: #d1fae5; color: #065f46; }
    .badge-closed { background: #e5e7eb; color: #374151; }
    .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #78350f; margin-top: 20px; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; }
    .footer strong { color: #6b7280; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>DevDesk</h1>
      <p>Support Ticket System</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from <strong>DevDesk</strong>. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const priorityBadge = (priority) => {
    const map = { HIGH: "badge-high", MEDIUM: "badge-medium", LOW: "badge-low" };
    return `<span class="badge ${map[priority] ?? ''}">${priority}</span>`;
};

const statusBadge = (status) => {
    const map = { OPEN: "badge-open", IN_PROGRESS: "badge-in-progress", RESOLVED: "badge-resolved", CLOSED: "badge-closed" };
    const labels = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" };
    return `<span class="badge ${map[status] ?? ''}">${labels[status] ?? status}</span>`;
};

const sendMail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"DevDesk Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
};

// Notifies the ticket owner that their ticket has been assigned to an agent
export const sendAssignmentMail = async (to, userName, ticketTitle, agentName) => {
    const subject = `DevDesk: Your ticket has been assigned`;
    const html = baseTemplate(`
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your support ticket has been assigned to an agent who will assist you shortly.</p>
      <div class="info-card">
        <table>
          <tr><td>Ticket</td><td>${ticketTitle}</td></tr>
          <tr><td>Assigned To</td><td>${agentName}</td></tr>
        </table>
      </div>
      <p>Our team is on it! You'll receive another update when the status of your ticket changes.</p>
      <p>Thanks,<br/><strong>DevDesk Support Team</strong></p>
    `);

    try {
        await sendMail(to, subject, html);
        console.log("Assignment mail sent to user successfully");
    } catch (error) {
        console.error("Failed to send assignment mail to user:", error);
    }
};

// Notifies the agent that a ticket has been assigned to them
export const sendAgentAssignmentMail = async (to, agentName, ticketTitle, ticketId, priority) => {
    const subject = `DevDesk: New ticket assigned to you`;
    const html = baseTemplate(`
      <p>Hi <strong>${agentName}</strong>,</p>
      <p>A new support ticket has been assigned to you. Please review and take action.</p>
      <div class="info-card">
        <table>
          <tr><td>Ticket</td><td>${ticketTitle}</td></tr>
          <tr><td>Ticket ID</td><td><code>${ticketId}</code></td></tr>
          <tr><td>Priority</td><td>${priorityBadge(priority)}</td></tr>
        </table>
      </div>
      <p>Please log in to DevDesk to view the full details and respond to the user.</p>
      <p>Thanks,<br/><strong>DevDesk Support Team</strong></p>
    `);

    try {
        await sendMail(to, subject, html);
        console.log("Assignment mail sent to agent successfully");
    } catch (error) {
        console.error("Failed to send assignment mail to agent:", error);
    }
};

// Notifies the ticket owner that their ticket status has changed
export const sendStatusChangeEmail = async (to, userName, ticketTitle, newStatus) => {
    const statusLabels = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" };
    const subject = `DevDesk: Ticket status updated to ${statusLabels[newStatus] ?? newStatus}`;

    const note = newStatus === "RESOLVED"
        ? `<div class="note">✅ If your issue has been resolved, no further action is needed. If you still need help, please open a new ticket.</div>`
        : `<p>Our team is actively working on your request.</p>`;

    const html = baseTemplate(`
      <p>Hi <strong>${userName}</strong>,</p>
      <p>The status of your support ticket has been updated.</p>
      <div class="info-card">
        <table>
          <tr><td>Ticket</td><td>${ticketTitle}</td></tr>
          <tr><td>New Status</td><td>${statusBadge(newStatus)}</td></tr>
        </table>
      </div>
      ${note}
      <p>Thanks,<br/><strong>DevDesk Support Team</strong></p>
    `);

    try {
        await sendMail(to, subject, html);
        console.log("Status change mail sent successfully");
    } catch (error) {
        console.error("Failed to send status change mail:", error);
    }
};