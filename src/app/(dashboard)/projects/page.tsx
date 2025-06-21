'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Search,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { Project } from '@/lib/types/compliance';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search term
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading projects...</p>
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Projects
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your construction projects and compliance tracking.
                </p>
              </div>
              <Button onClick={() => router.push('/projects/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? `No projects match "${searchTerm}". Try a different search term.`
                        : 'Get started by creating your first project.'
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => router.push('/projects/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Project
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {project.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${project.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Project Dates */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {project.start_date 
                            ? formatDate(new Date(project.start_date))
                            : 'No start date'
                          } - {project.end_date 
                            ? formatDate(new Date(project.end_date))
                            : 'No end date'
                          }
                        </span>
                      </div>

                      {/* Party Count */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{project.party_count || 0} parties</span>
                      </div>

                      {/* Compliance Percentage */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Compliance</span>
                        </div>
                        <Badge 
                          className={`${getComplianceColor(project.compliance_percentage || 0)} border-0`}
                        >
                          {project.compliance_percentage || 0}%
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (project.compliance_percentage || 0) >= 90
                              ? 'bg-green-500'
                              : (project.compliance_percentage || 0) >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${project.compliance_percentage || 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {filteredProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredProjects.length}</div>
                      <div className="text-sm text-muted-foreground">Total Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredProjects.filter(p => (p.compliance_percentage || 0) >= 90).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Fully Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredProjects.filter(p => (p.compliance_percentage || 0) >= 70 && (p.compliance_percentage || 0) < 90).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Partially Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredProjects.filter(p => (p.compliance_percentage || 0) < 70).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Non-Compliant</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}