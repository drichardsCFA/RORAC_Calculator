# RORAC Calculator - Quick Start Guide

## 🚀 One-Click Launch

Simply double-click **`start.bat`** in the project root folder!

This will automatically:
- ✅ Check for Python and Node.js
- ✅ Install any missing dependencies
- ✅ Start all required services
- ✅ Open the application in your browser

## 📋 Prerequisites

### First Time Setup

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Verify installation: `node --version`

2. **Install Python**
   - Download from: https://www.python.org/downloads/
   - ⚠️ **Important**: Check "Add Python to PATH" during installation
   - Verify installation: `python --version`

## 🎯 Running the Application

### Method 1: Automated (Recommended)
```bash
# Just double-click start.bat or run:
start.bat
```

### Method 2: Manual via npm
```bash
npm run dev
```

### Method 3: Individual Services
```bash
# Terminal 1 - API Server
npm run server

# Terminal 2 - PDF Service
npm run pdf-service

# Terminal 3 - React App
npm start
```

## 🌐 Access the Application

Once started, the application will be available at:
- **Frontend**: http://localhost:3000 (or http://localhost:5000)
- **API Server**: http://localhost:3002
- **PDF Service**: http://localhost:5001

The browser should open automatically. If not, manually navigate to the frontend URL.

## 🛑 Stopping the Application

Press `Ctrl+C` in the terminal where services are running, then type `Y` to confirm.

## 📦 Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| React Frontend | 3000/5000 | Main calculator interface |
| Node.js API | 3002 | Handles data storage & chat |
| PDF Service | 5001 | Generates professional PDF reports |

## ⚠️ Troubleshooting

### "Python is not installed"
- Install Python from python.org
- Make sure to check "Add Python to PATH"
- Restart your terminal/command prompt

### "Node.js is not installed"
- Install Node.js from nodejs.org
- Restart your terminal/command prompt

### Port Already in Use
- Close any other applications using ports 3000, 3002, 5000, or 5001
- Or modify the ports in `.env` file

### Dependencies Won't Install
```bash
# Manually install dependencies:
npm install
cd pdf_service
pip install -r requirements.txt
cd ..
```

### Services Won't Start
1. Check that all prerequisites are installed
2. Try deleting `node_modules` and running `npm install` again
3. Check `.env` file exists with proper configuration

## 📝 Features

- 💰 **Loan Analysis**: Calculate RORAC on loan deals
- 💵 **Fee Management**: Track credit pulls, UCC, modifications
- 📊 **Cost Breakdown**: Licensing, implementation, maintenance
- 💾 **Save Deals**: Store and compare multiple scenarios
- 📄 **PDF Export**: Generate professional business reports
- 🤖 **AI Assistant**: Built-in chatbot for RORAC questions
- 👥 **Admin Panel**: Manage knowledge base (http://localhost:5000/admin)

## 🔒 Admin Access

Navigate to `/admin` to manage the knowledge base.

Default development credentials are in the `.env` file.

## 🆘 Need Help?

Check the following files for more information:
- `README.md` - Full documentation
- `pdf_service/README.md` - PDF service details
- `README_CHATBOT.md` - Chatbot configuration

## 🔄 Updates

To get the latest updates:
```bash
git pull
npm install
cd pdf_service
pip install -r requirements.txt
cd ..
```

---

**Ready to start? Just double-click `start.bat`!** 🎉
