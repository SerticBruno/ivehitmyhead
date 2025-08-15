'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; data?: unknown; error?: string }>>({});
  const [loading, setLoading] = useState(false);

  const testSupabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/memes?limit=1');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, supabase: { success: true, data } }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults(prev => ({ ...prev, supabase: { success: false, error: errorMessage } }));
    } finally {
      setLoading(false);
    }
  };

  const testCloudinary = async () => {
    setLoading(true);
    try {
      // Test with a simple image upload
      const testImage = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('title', 'Test Meme');
      formData.append('image', testImage);
      
      const response = await fetch('/api/memes/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(prev => ({ ...prev, cloudinary: { success: true, data } }));
      } else {
        const error = await response.text();
        setTestResults(prev => ({ ...prev, cloudinary: { success: false, error } }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResults(prev => ({ ...prev, cloudinary: { success: false, error: errorMessage } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          System Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Test Connections</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={testSupabase}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Test Supabase Connection
                </button>
                {testResults.supabase && (
                  <div className={`mt-2 p-3 rounded ${testResults.supabase.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {testResults.supabase.success ? '✅ Supabase connected!' : `❌ Supabase error: ${testResults.supabase.error}`}
                  </div>
                )}
              </div>
              
              <div>
                <button
                  onClick={testCloudinary}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Test Cloudinary Upload
                </button>
                {testResults.cloudinary && (
                  <div className={`mt-2 p-3 rounded ${testResults.cloudinary.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {testResults.cloudinary.success ? '✅ Cloudinary working!' : `❌ Cloudinary error: ${testResults.cloudinary.error}`}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Setup Checklist</h2>
            <ul className="space-y-2 text-sm">
              <li>✅ Create Supabase project</li>
              <li>✅ Run database schema SQL</li>
              <li>✅ Create Cloudinary account</li>
              <li>✅ Set environment variables</li>
              <li>✅ Test connections</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link href="/upload" className="text-blue-500 hover:underline block">→ Upload Page</Link>
              <Link href="/memes" className="text-blue-500 hover:underline block">→ Memes Page</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
