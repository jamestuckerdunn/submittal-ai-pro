import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Shield, FileCheck, Users, Building } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout showFooter={true}>
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="text-center px-6 max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Compliance Manager Pro
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Construction Compliance Made Simple
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Streamline compliance management for construction projects. Verify insurance and compliance documents for subcontractors and vendors with automated tracking and Procore integration.
            </p>

            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Compliance Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Track insurance certificates, W9s, and compliance documents
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Document Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Automated verification against compliance profiles
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Vendor Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Manage subcontractors and vendors across projects
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Procore Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm text-center">
                    Seamless sync with Procore projects and parties
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">
                Built for construction professionals with enterprise-grade security
              </p>
              <div className="mt-4 flex justify-center space-x-4 text-xs text-muted-foreground">
                <span>Next.js</span>
                <span>•</span>
                <span>TypeScript</span>
                <span>•</span>
                <span>Supabase</span>
                <span>•</span>
                <span>Procore API</span>
                <span>•</span>
                <span>Neon Database</span>
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