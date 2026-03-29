const PDFDocument = require('pdfkit');
const fs = require('fs');

try {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream('test.pdf'));

  doc.save();
  doc.fillColor('#f8fafc').rect(0, 0, 595.28, 841.89).fill();
  
  // Header
  doc.fillColor('#1e293b').rect(50, 50, 500, 80).fill();
  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('EVENT ADMIT CARD', 70, 75);
  doc.fontSize(10).font('Helvetica').text('CAMPUS EVENT HUB', 70, 105);

  // Content
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('STUDENT DETAILS', 50, 160);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 180).lineTo(550, 180).stroke();

  doc.fillColor('#1e293b').fontSize(10).font('Helvetica').text('NAME', 50, 200);
  doc.fontSize(12).font('Helvetica-Bold').text(('STUDENT').toUpperCase(), 50, 215);

  doc.fontSize(10).font('Helvetica').text('EVENT', 50, 250);
  doc.fontSize(12).font('Helvetica-Bold').text('Event Title', 50, 265);

  doc.fontSize(10).font('Helvetica').text('VENUE', 300, 250);
  doc.fontSize(12).font('Helvetica-Bold').text('Venue', 300, 265);

  doc.fontSize(10).font('Helvetica').text('DATE', 50, 300);
  doc.fontSize(12).font('Helvetica-Bold').text('TBD', 50, 315);

  // Code Box
  doc.strokeColor('#4f46e5').lineWidth(2).dash(5, { space: 5 }).rect(50, 370, 500, 100).stroke();
  doc.undash(); // Clear dash for subsequent elements
  doc.fillColor('#4f46e5').fontSize(10).font('Helvetica-Bold').text('UNIQUE VERIFICATION CODE', 50, 390, { align: 'center', width: 500 });
  doc.fontSize(36).font('Courier-Bold').text('000000', 50, 415, { align: 'center', width: 500 });

  // Footer
  doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Present this admit card at the venue for verification. Entry is subject to verification of the unique code.', 50, 500, { align: 'center', width: 500 });

  doc.restore();
  doc.end();
  console.log('Success');
} catch (e) {
  console.error(e);
}
