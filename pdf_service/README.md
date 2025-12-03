# PDF Generation Service

This service generates professional PDF reports for RORAC Calculator deals.

## Setup

1. **Install Python** (if not already installed)
   - Download from https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Install Dependencies**
   ```bash
   cd pdf_service
   pip install -r requirements.txt
   ```

3. **Start the Service**
   ```bash
   python app.py
   ```
   
   Or on Windows, double-click `start.bat`

## Usage

The service runs on port 5001 by default and provides:

- **POST /api/generate-pdf** - Generate PDF report from deal data
- **GET /health** - Health check endpoint

## Features

- Professional business report layout
- Formatted tables with color coding
- Executive summary
- Cost breakdown
- Approval requirements
- Automatic page numbering
- Company branding footer

## Customization

Edit `app.py` to customize:
- Colors and styling
- Report sections
- Layout and formatting
- Logo placement (add logo.png to pdf_service folder)
