'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert } from '@/components/ui/alert';

interface AnalysisRequest {
  documentId: string;
  analysisType: string;
  complexity: string;
  priority: string;
  useEnhancedAnalysis: boolean;
  projectContext?: {
    projectType: string;
    buildingCodes: string[];
    jurisdiction: string;
    projectPhase: string;
  };
  focusAreas?: string[];
}

interface AnalysisResult {
  success: boolean;
  analysisId: string;
  result?: Record<string, unknown>;
  metadata?: {
    model: string;
    tokensUsed: number;
    cost: number;
    processingTime: number;
    enhanced: boolean;
  };
  error?: string;
}

export default function EnhancedAITestPage() {
  const [documentId, setDocumentId] = useState('');
  const [analysisType, setAnalysisType] = useState('review');
  const [complexity, setComplexity] = useState('standard');
  const [priority, setPriority] = useState('normal');
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Project context
  const [projectType, setProjectType] = useState('commercial');
  const [jurisdiction, setJurisdiction] = useState('');
  const [buildingCodes, setBuildingCodes] = useState('IBC 2021, IFC 2021');
  const [focusAreas, setFocusAreas] = useState('');

  const handleAnalyze = async () => {
    if (!documentId.trim()) {
      setError('Please enter a document ID');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const requestBody: AnalysisRequest = {
        documentId: documentId.trim(),
        analysisType,
        complexity,
        priority,
        useEnhancedAnalysis: useEnhanced,
      };

      // Add project context if provided
      if (jurisdiction || buildingCodes) {
        requestBody.projectContext = {
          projectType,
          buildingCodes: buildingCodes.split(',').map(code => code.trim()),
          jurisdiction: jurisdiction.trim(),
          projectPhase: 'construction',
        };
      }

      // Add focus areas if provided
      if (focusAreas.trim()) {
        requestBody.focusAreas = focusAreas.split(',').map(area => area.trim());
      }

      const response = await fetch('/api/ai/analyze-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          analysisId: 'test-connection',
          result: data,
          metadata: {
            model: 'test',
            tokensUsed: 0,
            cost: 0,
            processingTime: 0,
            enhanced: false,
          },
        });
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (err) {
      console.error('Connection test error:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Enhanced AI Analysis Test</h1>
          <p className="text-gray-600 mt-2">
            Test the enhanced AI analysis capabilities with sophisticated
            document analysis options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document ID
                </label>
                <Input
                  type="text"
                  value={documentId}
                  onChange={e => setDocumentId(e.target.value)}
                  placeholder="Enter document ID to analyze"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Analysis Type
                </label>
                <select
                  value={analysisType}
                  onChange={e => setAnalysisType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="review">General Review</option>
                  <option value="compliance">Compliance Analysis</option>
                  <option value="comparison">Comparison Analysis</option>
                  <option value="safety-assessment">Safety Assessment</option>
                  <option value="code-compliance">Code Compliance</option>
                  <option value="quality-control">Quality Control</option>
                  <option value="performance-evaluation">
                    Performance Evaluation
                  </option>
                  <option value="material-analysis">Material Analysis</option>
                  <option value="specification-review">
                    Specification Review
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Analysis Complexity
                </label>
                <select
                  value={complexity}
                  onChange={e => setComplexity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useEnhanced"
                  checked={useEnhanced}
                  onChange={e => setUseEnhanced(e.target.checked)}
                />
                <label htmlFor="useEnhanced" className="text-sm font-medium">
                  Use Enhanced Analysis
                </label>
              </div>

              {/* Project Context */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Project Context (Optional)</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Project Type
                    </label>
                    <select
                      value={projectType}
                      onChange={e => setProjectType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="industrial">Industrial</option>
                      <option value="institutional">Institutional</option>
                      <option value="mixed-use">Mixed Use</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jurisdiction
                    </label>
                    <Input
                      type="text"
                      value={jurisdiction}
                      onChange={e => setJurisdiction(e.target.value)}
                      placeholder="e.g., City of Los Angeles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Building Codes (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={buildingCodes}
                      onChange={e => setBuildingCodes(e.target.value)}
                      placeholder="e.g., IBC 2021, IFC 2021, IECC 2021"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Focus Areas (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={focusAreas}
                      onChange={e => setFocusAreas(e.target.value)}
                      placeholder="e.g., fire safety, accessibility, structural"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Analyzing...
                    </>
                  ) : (
                    'Start Analysis'
                  )}
                </Button>

                <Button
                  onClick={handleTestConnection}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="w-full"
                >
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">
                      Analysis Status: {result.success ? 'Success' : 'Failed'}
                    </p>
                    <p className="text-sm text-green-600">
                      Analysis ID: {result.analysisId}
                    </p>
                  </div>

                  {result.metadata && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <div className="text-sm space-y-1">
                        <p>Model: {result.metadata.model}</p>
                        <p>Tokens Used: {result.metadata.tokensUsed}</p>
                        <p>Cost: ${result.metadata.cost.toFixed(4)}</p>
                        <p>
                          Processing Time: {result.metadata.processingTime}ms
                        </p>
                        <p>
                          Enhanced: {result.metadata.enhanced ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.result && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Analysis Result</h4>
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result && !error && !isAnalyzing && (
                <div className="text-center text-gray-500 py-8">
                  Configure your analysis settings and click Start Analysis to
                  begin.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
