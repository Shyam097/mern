
import React, { useState, useCallback } from 'react';
import type { TableRow } from '../types';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import Dashboard from '../components/Dashboard';
import Head from 'next/head';

const HomePage: React.FC = () => {
  const [data, setData] = useState<TableRow[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileAccepted = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload file.');
      }
      
      if (!result.data || result.data.length === 0) {
        throw new Error("Excel file is empty or could not be parsed by the server.");
      }

      setData(result.data);
      setHeaders(result.headers);
      setFileName(result.fileName);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred. Please try again.");
      setData(null);
      setHeaders([]);
      setFileName('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setData(null);
    setHeaders([]);
    setFileName('');
    setError(null);
  }, []);

  return (
    <>
      <Head>
        <title>Excel Analytics Platform</title>
        <meta name="description" content="A powerful platform for uploading any Excel file (.xls or .xlsx), analyzing the data, and generating interactive 2D charts. The platform integrates AI to provide smart insights from the uploaded data." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-primary font-sans">
        <Header />
        <main className="p-4 md:p-8">
          {!data ? (
            <FileUpload onFileAccepted={handleFileAccepted} isLoading={isLoading} error={error} />
          ) : (
            <Dashboard
              fileName={fileName}
              data={data}
              headers={headers}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default HomePage;
