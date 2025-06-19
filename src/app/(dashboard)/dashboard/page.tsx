'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  BarChart3,
  Download,
  Upload,
  Brain,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Welcome back! Here&apos;s what&apos;s happening with your
                  submittal reviews.
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reviews
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Reviews completed this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documents Uploaded
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Files uploaded today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Compliance percentage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" size="lg" asChild>
                    <div className="flex items-center">
                      <Upload className="h-5 w-5 mr-3" />
                      Upload Documents
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="lg"
                    asChild
                  >
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 mr-3" />
                      Start AI Review
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="lg"
                    asChild
                  >
                    <div className="flex items-center">
                      <Download className="h-5 w-5 mr-3" />
                      Export Reports
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No recent activity yet. Upload your first document to get
                      started!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Notice */}
            <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎉</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Authentication Complete!
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      Your account is set up and ready. File upload and AI
                      processing features are coming next in our development
                      roadmap.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
