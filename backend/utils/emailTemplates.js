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

const getCertificateTemplate = (name, eventTitle, collegeName, date) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container {
                font-family: 'Georgia', serif;
                max-width: 800px;
                margin: 0 auto;
                background-color: #f3f4f6;
                padding: 40px;
            }
            .certificate {
                background-color: #ffffff;
                border: 20px solid #1e293b;
                padding: 60px;
                text-align: center;
                position: relative;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .certificate::before {
                content: '';
                position: absolute;
                top: 10px; left: 10px; right: 10px; bottom: 10px;
                border: 2px solid #e2e8f0;
                pointer-events: none;
            }
            .title { color: #1e293b; font-size: 48px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 4px; }
            .subtitle { color: #64748b; font-size: 18px; margin-bottom: 40px; font-style: italic; }
            .name { color: #4f46e5; font-size: 36px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 40px 10px; }
            .description { color: #334155; font-size: 18px; line-height: 1.6; margin: 40px auto; max-width: 600px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-around; }
            .sig-box { border-top: 1px solid #1e293b; padding-top: 10px; width: 200px; }
            .sig-text { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="certificate">
                <div class="title">Certificate</div>
                <div class="subtitle">of Participation</div>
                <div style="color: #64748b; margin-bottom: 10px;">This is to certify that</div>
                <div class="name">${name}</div>
                <div class="description">
                    has successfully participated in <strong>${eventTitle}</strong> organized by 
                    <strong>${collegeName}</strong> on ${new Date(date).toLocaleDateString()}.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

const getAdmitCardTemplate = (name, eventTitle, location, date, code) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
            .card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; padding: 30px; color: white; position: relative; overflow: hidden; }
            .card::after { content: 'ADMIT'; position: absolute; top: -20px; right: -20px; font-size: 100px; font-weight: 900; opacity: 0.05; pointer-events: none; }
            .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px; }
            .event-title { font-size: 20px; font-weight: 800; color: #818cf8; }
            .student-name { font-size: 24px; font-weight: 700; margin: 10px 0; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; }
            .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
            .value { font-size: 13px; font-weight: 600; margin-top: 2px; }
            .code-box { background: white; color: #1e293b; padding: 15px; border-radius: 16px; text-align: center; margin-top: 30px; border: 4px dashed #818cf8; }
            .code-text { font-size: 32px; font-weight: 900; letter-spacing: 5px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <div class="label">Event Pass</div>
                    <div class="event-title">${eventTitle}</div>
                </div>
                <div class="label">Student Name</div>
                <div class="student-name">${name}</div>
                <div class="details">
                    <div>
                        <div class="label">Venue</div>
                        <div class="value">${location}</div>
                    </div>
                    <div>
                        <div class="label">Date</div>
                        <div class="value">${new Date(date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="code-box">
                    <div class="label" style="color: #64748b; margin-bottom: 5px;">Verification Code</div>
                    <div class="code-text">${code}</div>
                </div>
                <p style="font-size: 10px; color: #64748b; margin-top: 20px; text-align: center;">
                    Please present this code at the venue for attendance verification.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const getAttendanceMarkedTemplate = (name, eventTitle, location, date) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f3f4f6; padding: 40px 20px; }
            .card { background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border-top: 8px solid #4f46e5; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1e293b; font-size: 24px; font-weight: 800; margin: 0; }
            .content { color: #475569; line-height: 1.6; font-size: 16px; }
            .event-box { background-color: #f8fafc; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0; }
            .event-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px; }
            .event-value { color: #1e293b; font-size: 18px; font-weight: 700; }
            .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; }
            .success-badge { display: inline-block; background-color: #dcfce7; color: #166534; padding: 6px 16px; rounded-full; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; border-radius: 9999px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <div class="success-badge">Check-in Verified</div>
                    <h1>Welcome to the Event!</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Great news! Your attendance has been successfully verified for the following event. We're excited to have you with us!</p>
                    
                    <div class="event-box">
                        <div style="margin-bottom: 15px;">
                            <div class="event-label">Event</div>
                            <div class="event-value">${eventTitle}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <div class="event-label">Venue</div>
                                <div class="event-value" style="font-size: 14px;">${location}</div>
                            </div>
                            <div>
                                <div class="event-label">Date</div>
                                <div class="event-value" style="font-size: 14px;">${new Date(date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <p>Please keep this email for your records. Once the event concludes, you'll reach out to your dashboard to download your certificate.</p>
                </div>
                <div class="footer">
                    <p>© 2026 CampusEventHub. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  getRegistrationStatusTemplate,
  getCertificateTemplate,
  getAdmitCardTemplate,
  getAttendanceMarkedTemplate,
};
