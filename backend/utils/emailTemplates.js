const getRegistrationStatusTemplate = (name, eventTitle, status, collegeName) => {
  const isApproved = status === 'approved';
  const color = isApproved ? '#10b981' : '#ef4444';
  const icon = isApproved ? '✓' : '✗';
  const statusText = status.toUpperCase();

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f9fafb;
                padding: 40px 20px;
            }
            .card {
                background-color: #ffffff;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .status-icon {
                width: 64px;
                height: 64px;
                background-color: ${color}20;
                color: ${color};
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 24px;
                line-height: 64px;
                text-align: center;
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
            }
            .header h1 {
                color: #111827;
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 8px;
            }
            .header p {
                color: #6b7280;
                font-size: 16px;
                margin: 0;
            }
            .content {
                background-color: #f3f4f6;
                border-radius: 20px;
                padding: 24px;
                margin-bottom: 32px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            .info-row:last-child {
                margin-bottom: 0;
            }
            .label {
                color: #6b7280;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .value {
                color: #111827;
                font-size: 15px;
                font-weight: 700;
                text-align: right;
            }
            .status-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 9999px;
                background-color: ${color};
                color: white;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 0.05em;
            }
            .footer {
                text-align: center;
            }
            .footer p {
                color: #9ca3af;
                font-size: 14px;
                margin-bottom: 8px;
            }
            .btn {
                display: inline-block;
                background-color: #4f46e5;
                color: white !important;
                padding: 14px 28px;
                border-radius: 16px;
                text-decoration: none;
                font-weight: 700;
                font-size: 15px;
                margin-top: 20px;
                transition: transform 0.2s;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="status-icon">${icon}</div>
                <div class="header">
                    <h1>Registration ${isApproved ? 'Approved' : 'Rejected'}</h1>
                    <p>Hello ${name}, here is an update on your request.</p>
                </div>
                <div class="content">
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
                        <span class="label">Event Title</span>
                        <div class="value" style="text-align: left; margin-top: 4px; font-size: 18px;">${eventTitle}</div>
                    </div>
                    <div class="info-row">
                        <span class="label">Organizer</span>
                        <span class="value">${collegeName}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Status</span>
                        <span class="status-badge">${statusText}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>Need more details? Access your dashboard below.</p>
                    <a href="http://localhost:5173/dashboard" class="btn">View My Events</a>
                    <p style="margin-top: 30px; font-size: 12px;">© 2026 CampusEventHub. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  getRegistrationStatusTemplate,
};
