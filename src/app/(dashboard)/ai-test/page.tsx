'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Play, RefreshCw } from 'lucide-react';

interface AITestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export default function AITestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<AITestResult | null>(
    null
  );
  const [analysisTest, setAnalysisTest] = useState<AITestResult | null>(null);

  // Test AI Connection
  const testConnection = async () => {
    setIsLoading(true);
    setConnectionTest(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'GET',
      });

      const result = await response.json();

      setConnectionTest({
        success: response.ok,
        message: result.message || 'Connection test completed',
        details: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setConnectionTest({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test Sample Analysis
  const testAnalysis = async () => {
    setIsLoading(true);
    setAnalysisTest(null);

    try {
      // This would normally use a real document, but for testing we'll use mock data
      const sampleAnalysisRequest = {
        documentId: 'test-document-id',
        analysisType: 'review',
        mockTest: true, // Flag to indicate this is a test
      };

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleAnalysisRequest),
      });

      const result = await response.json();

      setAnalysisTest({
        success: response.ok,
        message: result.error || 'Analysis test completed',
        details: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setAnalysisTest({
        success: false,
        message: `Analysis test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTests = () => {
    setConnectionTest(null);
    setAnalysisTest(null);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Integration Test</h1>
        <p className="text-gray-600">
          Test the OpenRouter AI integration and document analysis
          functionality.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test the basic API connectivity and health check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Connection Test
                </>
              )}
            </Button>

            {connectionTest && (
              <Alert>
                <div className="flex items-center gap-2">
                  {connectionTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{connectionTest.message}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            connectionTest.success ? 'default' : 'destructive'
                          }
                        >
                          {connectionTest.success ? 'Success' : 'Failed'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            connectionTest.timestamp
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                      {connectionTest.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer">
                            View Details
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(connectionTest.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Analysis Test
            </CardTitle>
            <CardDescription>
              Test the document analysis functionality with mock data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testAnalysis}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Analysis Test
                </>
              )}
            </Button>

            {analysisTest && (
              <Alert>
                <div className="flex items-center gap-2">
                  {analysisTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{analysisTest.message}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            analysisTest.success ? 'default' : 'destructive'
                          }
                        >
                          {analysisTest.success ? 'Success' : 'Failed'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            analysisTest.timestamp
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                      {analysisTest.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer">
                            View Details
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(analysisTest.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset and Actions */}
      <div className="mt-6 flex gap-4">
        <Button onClick={resetTests} variant="outline" disabled={isLoading}>
          Reset Tests
        </Button>
      </div>

      {/* Configuration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Configuration Info</CardTitle>
          <CardDescription>
            Current AI integration configuration details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>OpenRouter API:</strong>{' '}
              {process.env.NEXT_PUBLIC_APP_URL ? 'Configured' : 'Missing URL'}
            </div>
            <div>
              <strong>Environment:</strong>{' '}
              {process.env.NODE_ENV || 'development'}
            </div>
            <div>
              <strong>Models Available:</strong>
              <span className="ml-2">
                <Badge variant="outline">Claude 3.5 Sonnet</Badge>
                <Badge variant="outline" className="ml-1">
                  GPT-4o
                </Badge>
                <Badge variant="outline" className="ml-1">
                  GPT-4o Mini
                </Badge>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="mt-6">
        <AlertDescription>
          <strong>Setup Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>
              Sign up for an OpenRouter account at{' '}
              <a
                href="https://openrouter.ai"
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                openrouter.ai
              </a>
            </li>
            <li>Get your API key from the OpenRouter dashboard</li>
            <li>
              Add the API key to your environment variables as
              OPENROUTER_API_KEY
            </li>
            <li>Restart your development server</li>
            <li>Run the connection test to verify the integration</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
