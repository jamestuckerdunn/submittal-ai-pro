'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building,
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { DashboardStats, ExpiringDocument, Project } from '@/lib/types/compliance';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocument[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch expiring documents
      const expiringResponse = await fetch('/api/dashboard/expiring-documents');
      if (expiringResponse.ok) {
        const expiringData = await expiringResponse.json();
        setExpiringDocs(expiringData.data || []);
      }

      // Fetch recent projects
      const projectsResponse = await fetch('/api/projects?limit=5');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setRecentProjects(projectsData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

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
                  Welcome back! Here&apos;s your compliance overview.
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Projects
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_projects || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active construction projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Parties
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_parties || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subcontractors and vendors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliant Parties
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.compliant_parties || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meeting all requirements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Non-Compliant
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.non_compliant_parties || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No projects found. Create your first project to get started!
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => router.push('/projects')}
                      >
                        View Projects
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentProjects.map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.party_count} parties
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {project.compliance_percentage}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Compliant
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/projects')}
                      >
                        View All Projects
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Expiring Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringDocs.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No documents expiring in the next 30 days.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expiringDocs.slice(0, 5).map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">
                                {doc.document_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.party_name} • {doc.project_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              doc.days_until_expiration <= 7 
                                ? 'text-red-600' 
                                : doc.days_until_expiration <= 14 
                                  ? 'text-orange-600' 
                                  : 'text-yellow-600'
                            }`}>
                              {doc.days_until_expiration} days
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.expiration_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {expiringDocs.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {expiringDocs.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/projects')}
                  >
                    <Building className="h-6 w-6" />
                    <span>View Projects</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/compliance-profiles')}
                  >
                    <Shield className="h-6 w-6" />
                    <span>Compliance Profiles</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/settings/integration')}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span>Procore Integration</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/settings/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span>User Management</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}