# mern# Excel Analytics Platform (Next.js)

A powerful full-stack platform built with Next.js for uploading any Excel file (.xls or .xlsx), analyzing the data, generating interactive 2D charts, and getting AI-powered insights.

## Features

- **File Upload:** Drag-and-drop or click to upload Excel files.
- **Dynamic Charting:** Visualize data with Bar, Line, Pie, and Scatter charts.
- **Interactive Controls:** Customize charts by selecting different X and Y axes.
- **AI Insights:** Generate a data summary and analysis using the Google Gemini API.
- **Persistent Storage:** Uploaded file data and headers are stored in a MongoDB database.
- **Modern Tech Stack:** Built with Next.js for a unified frontend and backend experience.

## Tech Stack

- **Framework:** Next.js (React)
- **Styling:** TailwindCSS
- **Charting:** Recharts
- **Backend API:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini API
- **File Handling:** `xlsx`, `multer`

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes bundled with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (You can install it locally or use a cloud service like MongoDB Atlas for the connection string)

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 2. Create an Environment File

Create a file named `.env.local` in the root of the project directory. This file will store your secret keys and database connection string.

```bash
touch .env.local
```

### 3. Configure Environment Variables

Open the newly created `.env.local` file and add the following variables. **You must replace the placeholder values with your actual credentials.**

```env
# Your MongoDB connection string.
# Example for a local MongoDB instance: MONGO_URI="mongodb://localhost:27017/excel_analytics"
# Example for MongoDB Atlas: MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabaseName"
MONGO_URI="YOUR_MONGODB_CONNECTION_STRING"

# Your Google Gemini API Key.
# You can get a key from Google AI Studio: https://aistudio.google.com/app/apikey
API_KEY="YOUR_GEMINI_API_KEY"
```

### 4. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

This starts the application in development mode. When it starts successfully, you should see a message indicating the server is running.

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

The application is now ready to be tested. You can upload an Excel file to begin the analysis.
