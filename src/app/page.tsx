import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Zap, CheckCircle, Shield } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout showFooter={true}>
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="text-center px-6 max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              SubmittalAI Pro
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Coming Soon
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              AI-powered construction submittal review platform that
              automatically analyzes submittals against project specifications,
              reducing review time from days to minutes.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Instant Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    AI-powered review in 2-5 minutes for typical submittals
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Compliance Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Detailed reports with specific discrepancy identification
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Secure Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Enterprise-grade security with user-specific access control
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">
                Built for the construction industry with cutting-edge AI
                technology
              </p>
              <div className="mt-4 flex justify-center space-x-4 text-xs text-muted-foreground">
                <span>Next.js</span>
                <span>•</span>
                <span>TypeScript</span>
                <span>•</span>
                <span>Supabase</span>
                <span>•</span>
                <span>OpenRouter AI</span>
                <span>•</span>
                <span>Stripe</span>
              </div>
            </div>

            {/* Auth Navigation */}
            <div className="mt-12 flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
