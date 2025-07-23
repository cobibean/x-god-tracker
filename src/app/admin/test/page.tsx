'use client';

import { useState } from 'react';
import { useAdminConfig } from '@/lib/config-context';
import toast from 'react-hot-toast';

export default function TestAdmin() {
  const { config, saveConfig, loading, error } = useAdminConfig('rhythm');
  const [testData, setTestData] = useState('');
  const [response, setResponse] = useState('');

  const testSave = async () => {
    try {
      console.log('Starting save test...');
      const testConfig = {
        blocks: [
          {
            id: "test1",
            name: "Test Block",
            duration: 10,
            emoji: "🔥",
            order: 0,
            enabled: true
          }
        ]
      };
      
      console.log('Sending config:', testConfig);
      const success = await saveConfig(testConfig);
      console.log('Save result:', success);
      
      if (success) {
        toast.success('Save successful!');
        setResponse('Save successful!');
      } else {
        toast.error('Save failed!');
        setResponse('Save failed - check console');
      }
    } catch (error) {
      console.error('Test save error:', error);
      toast.error(`Error: ${error}`);
      setResponse(`Error: ${error}`);
    }
  };

  const testDirectAPI = async () => {
    try {
      console.log('Testing direct API call...');
      const testConfig = {
        blocks: [
          {
            id: "test2",
            name: "Direct API Test",
            duration: 15,
            emoji: "⚡",
            order: 0,
            enabled: true
          }
        ]
      };
      
      const res = await fetch('/api/config/rhythm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testConfig),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      
      console.log('Response data:', data);
      setResponse(JSON.stringify(data, null, 2));
      
      if (res.ok) {
        toast.success('Direct API call successful!');
      } else {
        toast.error(`API error: ${res.status}`);
      }
    } catch (error) {
      console.error('Direct API error:', error);
      toast.error(`Error: ${error}`);
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">API Debug Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Config:</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
        
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        <div className="flex gap-4">
          <button
            onClick={testSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Save via Hook
          </button>
          
          <button
            onClick={testDirectAPI}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Direct API Call
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {response || 'No response yet'}
          </pre>
        </div>
      </div>
    </div>
  );
} 