from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from datetime import datetime
import io
import os

app = Flask(__name__)
CORS(app)

class NumberedCanvas(canvas.Canvas):
    """Custom canvas to add page numbers and footer"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page_num, page in enumerate(self.pages, 1):
            self.__dict__.update(page)
            self.draw_page_number(page_num, page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_num, page_count):
        self.setFont("Helvetica", 9)
        self.setFillColorRGB(0.5, 0.5, 0.5)
        self.drawRightString(7.5*inch, 0.5*inch, f"Page {page_num} of {page_count}")
        self.drawString(1*inch, 0.5*inch, "A CFAi App")

def format_currency(value):
    """Format number as currency"""
    try:
        return f"${float(value):,.2f}"
    except:
        return "$0.00"

def format_percentage(value):
    """Format number as percentage"""
    try:
        return f"{float(value):.2f}%"
    except:
        return "0.00%"

def create_pdf_report(data):
    """Generate a professional PDF report"""
    buffer = io.BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#059669'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#475569'),
        spaceAfter=8
    )
    
    # Title
    deal_name = data.get('dealName', 'Unnamed Deal')
    title = Paragraph(f"<b>RORAC Analysis Report</b>", title_style)
    elements.append(title)
    
    subtitle = Paragraph(f"<b>{deal_name}</b>", subheading_style)
    elements.append(subtitle)
    
    # Date
    date_text = Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", styles['Normal'])
    elements.append(date_text)
    elements.append(Spacer(1, 20))
    
    # Executive Summary
    elements.append(Paragraph("<b>Executive Summary</b>", heading_style))
    
    results = data.get('results', {})
    revenue = results.get('revenue', 0)
    total_costs = results.get('costs', {}).get('total', 0)
    net_profit = results.get('netProfit', 0)
    rorac = results.get('rorac', 0)
    
    summary_data = [
        ['Metric', 'Value'],
        ['Total Revenue', format_currency(revenue)],
        ['Total Costs', format_currency(total_costs)],
        ['Net Profit', format_currency(net_profit)],
        ['RORAC', format_percentage(rorac)]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Loan Details
    elements.append(Paragraph("<b>Loan Details</b>", heading_style))
    
    inputs = data.get('inputs', {})
    loan = inputs.get('loan', {})
    
    loan_data = [
        ['Loan Amount', format_currency(loan.get('amount', 0))],
        ['Points', format_percentage(loan.get('points', 0))],
        ['Loan Term', f"{loan.get('term', 0)} months"]
    ]
    
    loan_table = Table(loan_data, colWidths=[2.5*inch, 2.5*inch])
    loan_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ]))
    
    elements.append(loan_table)
    elements.append(Spacer(1, 20))
    
    # Cost Breakdown
    elements.append(Paragraph("<b>Cost Breakdown</b>", heading_style))
    
    costs = results.get('costs', {})
    cost_data = [
        ['Category', 'Amount'],
        ['Fees', format_currency(costs.get('fees', 0))],
        ['Licensing', format_currency(costs.get('licensing', 0))],
        ['Implementation', format_currency(costs.get('implementation', 0))],
        ['Maintenance', format_currency(costs.get('maintenance', 0))],
        ['Custom Development', format_currency(costs.get('customDev', 0))],
        ['<b>Total Costs</b>', f"<b>{format_currency(total_costs)}</b>"]
    ]
    
    cost_table = Table(cost_data, colWidths=[3*inch, 2*inch])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.lightblue),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef3c7')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ]))
    
    elements.append(cost_table)
    elements.append(Spacer(1, 20))
    
    # Approval Requirements
    approvals = results.get('approvals', {})
    requires_coo = approvals.get('requiresCOO', False)
    requires_ceo = approvals.get('requiresCEO', False)
    
    elements.append(Paragraph("<b>Approval Requirements</b>", heading_style))
    
    if not requires_coo and not requires_ceo:
        approval_text = "✓ Standard approval process applies"
        approval_color = colors.green
    elif requires_coo and not requires_ceo:
        approval_text = "⚠ COO approval required"
        approval_color = colors.orange
    else:
        approval_text = "⚠ CEO approval required"
        approval_color = colors.red
    
    approval_para = Paragraph(f"<font color='{approval_color}'><b>{approval_text}</b></font>", styles['Normal'])
    elements.append(approval_para)
    
    elements.append(Spacer(1, 30))
    
    # Footer note
    footer_note = Paragraph(
        "<i>This report was generated by the RORAC Calculator. "
        "All figures are estimates and subject to change based on final contract terms.</i>",
        styles['Normal']
    )
    elements.append(footer_note)
    
    # Build PDF
    doc.build(elements, canvasmaker=NumberedCanvas)
    
    buffer.seek(0)
    return buffer

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """Endpoint to generate PDF from deal data"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        pdf_buffer = create_pdf_report(data)
        
        deal_name = data.get('dealName', 'deal')
        filename = f"{deal_name.replace(' ', '_')}_analysis.pdf"
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'pdf-generator'})

if __name__ == '__main__':
    port = int(os.environ.get('PDF_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
