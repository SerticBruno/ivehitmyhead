import React from 'react';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Environment Variables Debug
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Status</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Cloudinary Cloud Name:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET'}
              </span>
            </div>
            
            <div>
              <strong>Cloudinary API Key:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
            
            <div>
              <strong>Cloudinary API Secret:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
            
            <div>
              <strong>Supabase URL:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}
              </span>
            </div>
            
            <div>
              <strong>Supabase Anon Key:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
            
            <div>
              <strong>Supabase Service Role Key:</strong>
              <span className="ml-2 text-sm bg-gray-100 p-1 rounded">
                {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET'}
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure you created <code>.env.local</code> (not <code>.env</code>)</li>
              <li>• Restart your dev server after changing environment variables</li>
              <li>• Check for typos in variable names</li>
              <li>• Ensure no quotes around values</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
