// Core AI Analysis Engine - Implements comparison algorithms and compliance scoring
// This is the central engine for submittal vs specification analysis

import {
  DocumentAnalysisResult,
  EnhancedDocumentAnalysisResult,
  Finding,
  DetailedFinding,
  ComplianceMatrix,
  ComplianceCategory,
  RiskAssessment,
  QualityMetrics,
  ActionItem,
  AnalysisMetadata,
  FindingCategory,
  DocumentLocation,
  Recommendation,
  CategoryAnalysis,
} from '@/lib/types/ai';

// Core Analysis Engine Interface
export interface AnalysisEngineConfig {
  strictMode: boolean;
  confidenceThreshold: number;
  maxCriticalIssues: number;
  compliancePassScore: number;
}

// Comparison Algorithm Result
export interface ComparisonResult {
  similarities: ComparisonMatch[];
  differences: ComparisonDifference[];
  missingElements: MissingElement[];
  excessElements: ExcessElement[];
  confidenceScore: number;
}

export interface ComparisonMatch {
  submittalSection: string;
  specificationSection: string;
  matchScore: number;
  matchType: 'exact' | 'partial' | 'semantic';
  confidence: number;
}

export interface ComparisonDifference {
  id: string;
  submittalContent: string;
  specificationRequirement: string;
  severity: 'critical' | 'major' | 'minor';
  category: FindingCategory;
  impact: string;
  correctionRequired: boolean;
}

export interface MissingElement {
  id: string;
  specificationRequirement: string;
  category: FindingCategory;
  criticality: 'critical' | 'major' | 'minor';
  suggestedAction: string;
}

export interface ExcessElement {
  id: string;
  submittalContent: string;
  category: FindingCategory;
  relevance: 'relevant' | 'irrelevant' | 'unclear';
  action: 'accept' | 'clarify' | 'remove';
}

// Section Analysis Result
export interface SectionAnalysis {
  sectionName: string;
  complianceScore: number;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-found';
  findings: DetailedFinding[];
  recommendations: string[];
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
}

// Core Analysis Engine Class
export class AnalysisEngine {
  private config: AnalysisEngineConfig;

  constructor(config: Partial<AnalysisEngineConfig> = {}) {
    this.config = {
      strictMode: config.strictMode ?? true,
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      maxCriticalIssues: config.maxCriticalIssues ?? 5,
      compliancePassScore: config.compliancePassScore ?? 80,
    };
  }

  // Main Analysis Engine Method
  async analyzeSubmittalCompliance(
    submittalText: string,
    specificationText: string,
    fileName: string,
    analysisId: string
  ): Promise<EnhancedDocumentAnalysisResult> {
    try {
      // Step 1: Section-by-section breakdown
      const submittalSections = this.extractSections(submittalText);
      const specificationSections = this.extractSections(specificationText);

      // Step 2: Perform comparison analysis
      const comparisonResult = await this.performComparison(
        submittalSections,
        specificationSections
      );

      // Step 3: Calculate compliance scores
      const complianceMatrix = this.calculateComplianceMatrix(
        comparisonResult,
        submittalSections,
        specificationSections
      );

      // Step 4: Generate detailed findings
      const detailedFindings = this.generateDetailedFindings(
        comparisonResult,
        submittalSections,
        specificationSections
      );

      // Step 5: Perform risk assessment
      const riskAssessment = this.assessRisks(
        detailedFindings,
        comparisonResult
      );

      // Step 6: Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(
        submittalText,
        specificationText,
        detailedFindings
      );

      // Step 7: Generate action items
      const actionItems = this.generateActionItems(
        detailedFindings,
        riskAssessment
      );

      // Step 8: Create base analysis results
      const baseFindings = this.convertToBaseFindings(detailedFindings);
      const recommendations = this.generateRecommendations(
        detailedFindings,
        riskAssessment
      );
      const categories = this.generateCategoryAnalysis(complianceMatrix);

      // Step 9: Determine overall assessment
      const overallAssessment =
        this.determineOverallAssessment(complianceMatrix);

      // Step 10: Generate summary
      const summary = this.generateAnalysisSummary(
        complianceMatrix,
        detailedFindings,
        riskAssessment
      );

      return {
        // Base properties
        complianceScore: complianceMatrix.overall_score,
        overallAssessment,
        summary,
        findings: baseFindings,
        recommendations,
        categories,
        confidence: comparisonResult.confidenceScore,

        // Enhanced properties
        analysisMetadata: {
          analysisId,
          timestamp: new Date().toISOString(),
          modelUsed: 'anthropic/claude-3.5-sonnet:beta' as const,
          analysisType: 'comparison',
          complexity: 'comprehensive',
          processingTime: Date.now(),
          confidenceScore: comparisonResult.confidenceScore,
          completenessScore: this.calculateCompletenessScore(
            submittalSections,
            specificationSections
          ),
        },
        detailedFindings,
        complianceMatrix,
        riskAssessment,
        qualityMetrics,
        actionItems,
      };
    } catch (error) {
      console.error('Analysis Engine Error:', error);
      return this.generateErrorResponse(analysisId, error);
    }
  }

  // Extract document sections for analysis
  private extractSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmedLine = line.trim();

      // Detect section headers (various patterns)
      if (this.isSectionHeader(trimmedLine)) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: this.generateSectionId(trimmedLine),
          title: trimmedLine,
          content: '',
          startLine: lineNumber,
          endLine: lineNumber,
          level: this.getSectionLevel(trimmedLine),
          category: this.categorizeSection(trimmedLine),
        };
      } else if (currentSection && trimmedLine.length > 0) {
        // Add content to current section
        currentSection.content +=
          (currentSection.content ? '\n' : '') + trimmedLine;
        currentSection.endLine = lineNumber;
      }
    }

    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  // Perform detailed comparison between submittal and specification sections
  private async performComparison(
    submittalSections: DocumentSection[],
    specificationSections: DocumentSection[]
  ): Promise<ComparisonResult> {
    const similarities: ComparisonMatch[] = [];
    const differences: ComparisonDifference[] = [];
    const missingElements: MissingElement[] = [];
    const excessElements: ExcessElement[] = [];

    // Compare each specification section against submittal sections
    for (const specSection of specificationSections) {
      const matches = this.findMatchingSections(specSection, submittalSections);

      if (matches.length === 0) {
        // Missing element
        missingElements.push({
          id: `missing-${specSection.id}`,
          specificationRequirement: specSection.title,
          category: specSection.category,
          criticality: this.determineCriticality(specSection),
          suggestedAction: `Provide information for: ${specSection.title}`,
        });
      } else {
        // Found matches - analyze differences
        for (const match of matches) {
          similarities.push(match);

          const sectionDifferences = this.analyzeSectionDifferences(
            specSection,
            submittalSections.find(s => s.id === match.submittalSection)!
          );
          differences.push(...sectionDifferences);
        }
      }
    }

    // Find excess elements in submittal
    for (const submittalSection of submittalSections) {
      const hasMatch = similarities.some(
        s => s.submittalSection === submittalSection.id
      );
      if (!hasMatch) {
        excessElements.push({
          id: `excess-${submittalSection.id}`,
          submittalContent: submittalSection.title,
          category: submittalSection.category,
          relevance: this.assessRelevance(submittalSection),
          action: 'clarify',
        });
      }
    }

    return {
      similarities,
      differences,
      missingElements,
      excessElements,
      confidenceScore: this.calculateComparisonConfidence(
        similarities,
        differences
      ),
    };
  }

  // Calculate comprehensive compliance matrix
  private calculateComplianceMatrix(
    comparison: ComparisonResult,
    submittalSections: DocumentSection[],
    specificationSections: DocumentSection[]
  ): ComplianceMatrix {
    const categories: ComplianceCategory[] = [];
    const categoryMap = new Map<FindingCategory, ComplianceCategory>();

    // Initialize categories
    const allCategories: FindingCategory[] = [
      'material-specifications',
      'dimensional-requirements',
      'performance-standards',
      'testing-requirements',
      'installation-procedures',
      'quality-control',
      'documentation',
      'regulatory-compliance',
      'safety-requirements',
      'environmental-considerations',
    ];

    for (const category of allCategories) {
      categoryMap.set(category, {
        name: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: 0,
        weight: this.getCategoryWeight(category),
        status: 'review-required',
        items_checked: 0,
        items_passed: 0,
        critical_failures: [],
        recommendations: [],
      });
    }

    // Analyze compliance by category
    for (const section of specificationSections) {
      const category = categoryMap.get(section.category);
      if (!category) continue;

      category.items_checked++;

      const hasMatch = comparison.similarities.find(
        s => s.specificationSection === section.id
      );

      if (hasMatch && hasMatch.matchScore > 0.7) {
        category.items_passed++;
      }

      // Check for critical failures
      const criticalDifferences = comparison.differences.filter(
        d => d.severity === 'critical' && d.category === section.category
      );

      category.critical_failures.push(
        ...criticalDifferences.map(d => d.impact)
      );
    }

    // Calculate scores and status for each category
    for (const [_, category] of categoryMap) {
      if (category.items_checked === 0) {
        category.status = 'review-required';
        category.score = 100;
      } else {
        category.score = Math.round(
          (category.items_passed / category.items_checked) * 100
        );

        if (category.critical_failures.length > 0) {
          category.status = 'fail';
        } else if (category.score >= this.config.compliancePassScore) {
          category.status = 'pass';
        } else if (category.score >= 60) {
          category.status = 'conditional';
        } else {
          category.status = 'fail';
        }
      }

      categories.push(category);
    }

    // Calculate overall score
    const weightedScore =
      categories.reduce((sum, cat) => sum + cat.score * cat.weight, 0) /
      categories.reduce((sum, cat) => sum + cat.weight, 0);

    return {
      overall_score: Math.round(weightedScore),
      categories,
      summary: this.generateComplianceMatrixSummary(categories, comparison),
      critical_issues: comparison.differences.filter(
        d => d.severity === 'critical'
      ).length,
      major_issues: comparison.differences.filter(d => d.severity === 'major')
        .length,
      minor_issues: comparison.differences.filter(d => d.severity === 'minor')
        .length,
      compliant_items: comparison.similarities.filter(s => s.matchScore > 0.8)
        .length,
    };
  }

  // Generate detailed findings with comprehensive analysis
  private generateDetailedFindings(
    comparison: ComparisonResult,
    submittalSections: DocumentSection[],
    specificationSections: DocumentSection[]
  ): DetailedFinding[] {
    const findings: DetailedFinding[] = [];
    let findingId = 0;

    // Process missing elements
    for (const missing of comparison.missingElements) {
      findings.push({
        id: `finding-${++findingId}`,
        category: missing.category,
        severity: this.mapCriticalityToSeverity(missing.criticality),
        title: `Missing Required Information: ${missing.specificationRequirement}`,
        description: `The submittal does not include required information specified in the project specifications.`,
        location: {
          section: missing.specificationRequirement,
          excerpt: missing.specificationRequirement,
        },
        compliance: 'non-compliant',
        confidence: 0.9,
        requiredAction: missing.suggestedAction,
        deadline: this.calculateDeadline(missing.criticality),

        // Enhanced properties
        section: missing.specificationRequirement,
        context: `Required by specification but not provided in submittal`,
        impact: this.mapCriticalityToImpact(missing.criticality),
        urgency: this.mapCriticalityToUrgency(missing.criticality),
        effort: this.estimateEffort(missing.criticality),
        riskLevel: this.mapCriticalityToRisk(missing.criticality),
        complianceStatus: 'non-compliant',
        corrective_action: missing.suggestedAction,
        timeline: this.calculateTimeline(missing.criticality),
        responsible_party: 'Submittal Preparer',
        verification_method: 'Document Review',
        relatedFindings: [],
        attachments: [],
      });
    }

    // Process significant differences
    for (const difference of comparison.differences) {
      if (difference.correctionRequired) {
        findings.push({
          id: `finding-${++findingId}`,
          category: difference.category,
          severity: difference.severity,
          title: `Specification Deviation: ${difference.category}`,
          description: `Submittal content does not match specification requirements.`,
          location: {
            section: difference.submittalContent.substring(0, 50) + '...',
            excerpt: difference.submittalContent,
          },
          compliance: 'non-compliant',
          confidence: 0.8,
          requiredAction: `Revise submittal to match specification requirements: ${difference.specificationRequirement}`,

          // Enhanced properties
          section: difference.category,
          context: `Specification requires: ${difference.specificationRequirement}. Submittal provides: ${difference.submittalContent}`,
          impact: this.mapSeverityToImpact(difference.severity),
          urgency: this.mapSeverityToUrgency(difference.severity),
          effort: this.estimateRevisionEffort(difference.severity),
          riskLevel: this.mapSeverityToRisk(difference.severity),
          complianceStatus: 'non-compliant',
          corrective_action: `Revise to match specification requirements`,
          timeline: this.calculateTimeline(difference.severity),
          responsible_party: 'Submittal Preparer',
          verification_method: 'Document Review and Comparison',
          relatedFindings: [],
          attachments: [],
        });
      }
    }

    return findings;
  }

  // Perform comprehensive risk assessment
  private assessRisks(
    findings: DetailedFinding[],
    comparison: ComparisonResult
  ): RiskAssessment {
    const riskFactors = [];
    const mitigationStrategies = [];

    // Analyze risk factors based on findings
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const majorFindings = findings.filter(f => f.severity === 'major');

    if (criticalFindings.length > 0) {
      riskFactors.push({
        category: 'Compliance Risk',
        description: `${criticalFindings.length} critical compliance issues identified`,
        probability: 'high' as const,
        impact: 'critical' as const,
        risk_score: 9,
        mitigation_required: true,
      });

      mitigationStrategies.push({
        risk_id: 'compliance-risk',
        strategy: 'Immediate revision of submittal to address critical issues',
        implementation_effort: 'high' as const,
        effectiveness: 'high' as const,
        timeline: '1-2 weeks',
        responsible_party: 'Design Team',
      });
    }

    if (majorFindings.length > 2) {
      riskFactors.push({
        category: 'Project Delay Risk',
        description: `Multiple major issues may cause project delays`,
        probability: 'medium' as const,
        impact: 'high' as const,
        risk_score: 6,
        mitigation_required: true,
      });
    }

    // Determine overall risk level
    const maxRiskScore = Math.max(...riskFactors.map(rf => rf.risk_score), 0);
    const overallRisk =
      maxRiskScore >= 8
        ? 'critical'
        : maxRiskScore >= 6
          ? 'high'
          : maxRiskScore >= 4
            ? 'medium'
            : 'low';

    return {
      overall_risk: overallRisk,
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies,
      residual_risk: 'medium', // After mitigation
    };
  }

  // Calculate quality metrics
  private calculateQualityMetrics(
    submittalText: string,
    specificationText: string,
    findings: DetailedFinding[]
  ): QualityMetrics {
    const wordCount = submittalText.split(/\s+/).length;
    const sectionCount = this.extractSections(submittalText).length;
    const criticalIssues = findings.filter(
      f => f.severity === 'critical'
    ).length;
    const majorIssues = findings.filter(f => f.severity === 'major').length;

    // Calculate individual metrics
    const documentation_quality = Math.max(
      0,
      100 - (criticalIssues * 20 + majorIssues * 10)
    );
    const technical_accuracy = Math.max(
      0,
      100 - (criticalIssues * 15 + majorIssues * 8)
    );
    const completeness = this.calculateCompletenessScore(
      this.extractSections(submittalText),
      this.extractSections(specificationText)
    );
    const clarity = Math.min(100, Math.max(50, 100 - findings.length * 5));
    const consistency = Math.max(
      0,
      100 -
        findings.filter(
          f =>
            f.category === 'documentation' ||
            f.description.includes('inconsistent')
        ).length *
          10
    );
    const compliance_readiness =
      documentation_quality * 0.6 + technical_accuracy * 0.4;

    const overall_quality = Math.round(
      (documentation_quality +
        technical_accuracy +
        completeness +
        clarity +
        consistency +
        compliance_readiness) /
        6
    );

    const improvement_areas = [];
    if (documentation_quality < 70)
      improvement_areas.push('Documentation Quality');
    if (technical_accuracy < 70) improvement_areas.push('Technical Accuracy');
    if (completeness < 70) improvement_areas.push('Completeness');
    if (clarity < 70) improvement_areas.push('Clarity');
    if (consistency < 70) improvement_areas.push('Consistency');

    return {
      documentation_quality: Math.round(documentation_quality),
      technical_accuracy: Math.round(technical_accuracy),
      completeness: Math.round(completeness),
      clarity: Math.round(clarity),
      consistency: Math.round(consistency),
      compliance_readiness: Math.round(compliance_readiness),
      overall_quality,
      improvement_areas,
    };
  }

  // Generate prioritized action items
  private generateActionItems(
    findings: DetailedFinding[],
    riskAssessment: RiskAssessment
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];
    let actionId = 0;

    // Group findings by priority and create action items
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const majorFindings = findings.filter(f => f.severity === 'major');
    const minorFindings = findings.filter(f => f.severity === 'minor');

    // Critical actions
    if (criticalFindings.length > 0) {
      actionItems.push({
        id: `action-${++actionId}`,
        title: 'Address Critical Compliance Issues',
        description: `Resolve ${criticalFindings.length} critical compliance issues`,
        priority: 'critical',
        category: 'compliance',
        assigned_to: 'Design Team Lead',
        due_date: this.calculateDueDate(7), // 1 week
        estimated_hours: criticalFindings.length * 4,
        dependencies: [],
        status: 'pending',
        related_findings: criticalFindings.map(f => f.id),
      });
    }

    // Major actions
    if (majorFindings.length > 0) {
      actionItems.push({
        id: `action-${++actionId}`,
        title: 'Resolve Major Issues',
        description: `Address ${majorFindings.length} major compliance issues`,
        priority: 'high',
        category: 'compliance',
        assigned_to: 'Design Team',
        due_date: this.calculateDueDate(14), // 2 weeks
        estimated_hours: majorFindings.length * 2,
        dependencies: criticalFindings.length > 0 ? [`action-1`] : [],
        status: 'pending',
        related_findings: majorFindings.map(f => f.id),
      });
    }

    // Quality improvement action
    if (findings.length > 0) {
      actionItems.push({
        id: `action-${++actionId}`,
        title: 'Quality Review and Documentation',
        description: 'Comprehensive quality review of submittal documentation',
        priority: 'medium',
        category: 'quality-control',
        assigned_to: 'Quality Reviewer',
        due_date: this.calculateDueDate(21), // 3 weeks
        estimated_hours: 8,
        dependencies: [],
        status: 'pending',
        related_findings: findings.map(f => f.id),
      });
    }

    return actionItems;
  }

  // Helper methods for analysis engine
  private isSectionHeader(line: string): boolean {
    // Various patterns for section headers
    return (
      /^[A-Z][A-Z\s\d\.]+:?$/.test(line) ||
      /^\d+\.\s+[A-Z]/.test(line) ||
      /^[A-Z]{2,}/.test(line) ||
      line.includes('SECTION') ||
      line.includes('PART') ||
      line.includes('SPECIFICATION')
    );
  }

  private generateSectionId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private getSectionLevel(title: string): number {
    if (/^\d+\.\d+\.\d+/.test(title)) return 3;
    if (/^\d+\.\d+/.test(title)) return 2;
    if (/^\d+\./.test(title)) return 1;
    return 1;
  }

  private categorizeSection(title: string): FindingCategory {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('material') || titleLower.includes('product')) {
      return 'material-specifications';
    } else if (
      titleLower.includes('dimension') ||
      titleLower.includes('size')
    ) {
      return 'dimensional-requirements';
    } else if (
      titleLower.includes('performance') ||
      titleLower.includes('standard')
    ) {
      return 'performance-standards';
    } else if (
      titleLower.includes('test') ||
      titleLower.includes('verification')
    ) {
      return 'testing-requirements';
    } else if (
      titleLower.includes('install') ||
      titleLower.includes('application')
    ) {
      return 'installation-procedures';
    } else if (
      titleLower.includes('quality') ||
      titleLower.includes('control')
    ) {
      return 'quality-control';
    } else if (titleLower.includes('safety') || titleLower.includes('hazard')) {
      return 'safety-requirements';
    } else if (
      titleLower.includes('code') ||
      titleLower.includes('regulation')
    ) {
      return 'regulatory-compliance';
    } else if (
      titleLower.includes('environment') ||
      titleLower.includes('green')
    ) {
      return 'environmental-considerations';
    }

    return 'documentation';
  }

  // Additional helper methods would continue here...
  // [Implementation continues with remaining helper methods]

  private findMatchingSections(
    specSection: DocumentSection,
    submittalSections: DocumentSection[]
  ): ComparisonMatch[] {
    const matches: ComparisonMatch[] = [];

    for (const submittalSection of submittalSections) {
      const matchScore = this.calculateSectionMatchScore(
        specSection,
        submittalSection
      );

      if (matchScore > 0.3) {
        // Minimum threshold for considering a match
        matches.push({
          submittalSection: submittalSection.id,
          specificationSection: specSection.id,
          matchScore,
          matchType:
            matchScore > 0.8
              ? 'exact'
              : matchScore > 0.6
                ? 'partial'
                : 'semantic',
          confidence: matchScore,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateSectionMatchScore(
    specSection: DocumentSection,
    submittalSection: DocumentSection
  ): number {
    // Simple keyword-based matching (in real implementation, use more sophisticated NLP)
    const specWords = new Set(specSection.content.toLowerCase().split(/\s+/));
    const submittalWords = new Set(
      submittalSection.content.toLowerCase().split(/\s+/)
    );

    const intersection = new Set(
      [...specWords].filter(x => submittalWords.has(x))
    );
    const union = new Set([...specWords, ...submittalWords]);

    return intersection.size / union.size;
  }

  private generateErrorResponse(
    analysisId: string,
    error: unknown
  ): EnhancedDocumentAnalysisResult {
    return {
      complianceScore: 0,
      overallAssessment: 'requires-review',
      summary: 'Analysis engine encountered an error. Manual review required.',
      findings: [],
      recommendations: [],
      categories: [],
      confidence: 0,
      analysisMetadata: {
        analysisId,
        timestamp: new Date().toISOString(),
        modelUsed: 'anthropic/claude-3.5-sonnet:beta',
        analysisType: 'comparison',
        complexity: 'comprehensive',
        processingTime: 0,
        confidenceScore: 0,
        completenessScore: 0,
        reviewerNotes: `Error: ${error}`,
      },
      detailedFindings: [],
      complianceMatrix: {
        overall_score: 0,
        categories: [],
        summary: 'Analysis failed',
        critical_issues: 0,
        major_issues: 0,
        minor_issues: 0,
        compliant_items: 0,
      },
      riskAssessment: {
        overall_risk: 'high',
        risk_factors: [],
        mitigation_strategies: [],
        residual_risk: 'high',
      },
      qualityMetrics: {
        documentation_quality: 0,
        technical_accuracy: 0,
        completeness: 0,
        clarity: 0,
        consistency: 0,
        compliance_readiness: 0,
        overall_quality: 0,
        improvement_areas: ['Analysis failed - manual review required'],
      },
      actionItems: [],
    };
  }

  // Implement remaining helper methods...
  private determineCriticality(
    section: DocumentSection
  ): 'critical' | 'major' | 'minor' {
    const criticalKeywords = [
      'safety',
      'structural',
      'fire',
      'code',
      'required',
      'shall',
    ];
    const content = section.content.toLowerCase();

    if (criticalKeywords.some(keyword => content.includes(keyword))) {
      return 'critical';
    }
    return 'major';
  }

  private analyzeSectionDifferences(
    specSection: DocumentSection,
    submittalSection: DocumentSection
  ): ComparisonDifference[] {
    // Simplified difference analysis
    return [
      {
        id: `diff-${specSection.id}-${submittalSection.id}`,
        submittalContent: submittalSection.content,
        specificationRequirement: specSection.content,
        severity: 'minor',
        category: specSection.category,
        impact: 'Minor compliance deviation',
        correctionRequired: false,
      },
    ];
  }

  private assessRelevance(
    section: DocumentSection
  ): 'relevant' | 'irrelevant' | 'unclear' {
    return 'relevant'; // Simplified
  }

  private calculateComparisonConfidence(
    similarities: ComparisonMatch[],
    differences: ComparisonDifference[]
  ): number {
    if (similarities.length === 0) return 0.1;

    const avgMatchScore =
      similarities.reduce((sum, match) => sum + match.matchScore, 0) /
      similarities.length;
    const penaltyFactor = Math.min(0.5, differences.length * 0.1);

    return Math.max(0.1, avgMatchScore - penaltyFactor);
  }

  private getCategoryWeight(category: FindingCategory): number {
    const weights = {
      'safety-requirements': 1.0,
      'regulatory-compliance': 0.9,
      'material-specifications': 0.8,
      'performance-standards': 0.8,
      'dimensional-requirements': 0.7,
      'testing-requirements': 0.7,
      'quality-control': 0.6,
      'installation-procedures': 0.6,
      documentation: 0.5,
      'environmental-considerations': 0.5,
    };
    return weights[category] || 0.5;
  }

  private generateComplianceMatrixSummary(
    categories: ComplianceCategory[],
    comparison: ComparisonResult
  ): string {
    const passCount = categories.filter(c => c.status === 'pass').length;
    const failCount = categories.filter(c => c.status === 'fail').length;

    return `${passCount}/${categories.length} categories passed. ${comparison.missingElements.length} missing elements identified.`;
  }

  private mapCriticalityToSeverity(
    criticality: 'critical' | 'major' | 'minor'
  ): 'critical' | 'major' | 'minor' | 'informational' {
    return criticality;
  }

  private calculateDeadline(
    criticality: 'critical' | 'major' | 'minor'
  ): string {
    const days =
      criticality === 'critical' ? 3 : criticality === 'major' ? 7 : 14;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString().split('T')[0] || '';
  }

  private mapCriticalityToImpact(
    criticality: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'critical' {
    return criticality === 'critical'
      ? 'critical'
      : criticality === 'major'
        ? 'high'
        : 'medium';
  }

  private mapCriticalityToUrgency(
    criticality: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'immediate' {
    return criticality === 'critical'
      ? 'immediate'
      : criticality === 'major'
        ? 'high'
        : 'medium';
  }

  private estimateEffort(
    criticality: 'critical' | 'major' | 'minor'
  ): 'minimal' | 'moderate' | 'significant' | 'major' {
    return criticality === 'critical'
      ? 'major'
      : criticality === 'major'
        ? 'significant'
        : 'moderate';
  }

  private mapCriticalityToRisk(
    criticality: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (criticality === 'critical') return 'critical';
    if (criticality === 'major') return 'high';
    return 'medium';
  }

  private calculateTimeline(
    criticality: 'critical' | 'major' | 'minor' | string
  ): string {
    if (criticality === 'critical') return '1-3 days';
    if (criticality === 'major') return '1-2 weeks';
    return '2-4 weeks';
  }

  private mapSeverityToImpact(
    severity: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'critical' {
    return severity === 'critical'
      ? 'critical'
      : severity === 'major'
        ? 'high'
        : 'medium';
  }

  private mapSeverityToUrgency(
    severity: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'immediate' {
    return severity === 'critical'
      ? 'immediate'
      : severity === 'major'
        ? 'high'
        : 'medium';
  }

  private estimateRevisionEffort(
    severity: 'critical' | 'major' | 'minor'
  ): 'minimal' | 'moderate' | 'significant' | 'major' {
    return severity === 'critical'
      ? 'major'
      : severity === 'major'
        ? 'significant'
        : 'moderate';
  }

  private mapSeverityToRisk(
    severity: 'critical' | 'major' | 'minor'
  ): 'low' | 'medium' | 'high' | 'critical' {
    return severity === 'critical'
      ? 'critical'
      : severity === 'major'
        ? 'high'
        : 'medium';
  }

  private convertToBaseFindings(
    detailedFindings: DetailedFinding[]
  ): Finding[] {
    return detailedFindings.map(df => ({
      id: df.id,
      category: df.category,
      severity: df.severity,
      title: df.title,
      description: df.description,
      location: df.location,
      compliance:
        df.complianceStatus === 'compliant'
          ? 'compliant'
          : df.complianceStatus === 'non-compliant'
            ? 'non-compliant'
            : 'unclear',
      requiredAction: df.corrective_action,
      deadline: df.timeline,
      confidence: df.confidence,
    }));
  }

  private generateRecommendations(
    findings: DetailedFinding[],
    riskAssessment: RiskAssessment
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (findings.filter(f => f.severity === 'critical').length > 0) {
      recommendations.push({
        id: 'critical-issues',
        priority: 'high',
        title: 'Address Critical Compliance Issues',
        description:
          'Immediately address all critical compliance issues identified in the analysis',
        actionItems: [
          'Review all critical findings',
          'Revise submittal documentation',
          'Obtain required approvals',
          'Resubmit for review',
        ],
        estimatedEffort: 'high',
        category: 'regulatory-compliance',
      });
    }

    return recommendations;
  }

  private generateCategoryAnalysis(
    complianceMatrix: ComplianceMatrix
  ): CategoryAnalysis[] {
    return complianceMatrix.categories.map(cat => ({
      category: cat.name.toLowerCase().replace(' ', '-') as FindingCategory,
      score: cat.score,
      status:
        cat.status === 'pass'
          ? 'pass'
          : cat.status === 'fail'
            ? 'fail'
            : cat.status === 'conditional'
              ? 'partial'
              : 'not-applicable',
      findingCount: cat.critical_failures.length,
      summary: `${cat.items_passed}/${cat.items_checked} items compliant`,
    }));
  }

  private determineOverallAssessment(
    complianceMatrix: ComplianceMatrix
  ): 'compliant' | 'non-compliant' | 'partially-compliant' | 'requires-review' {
    if (complianceMatrix.critical_issues > 0) return 'non-compliant';
    if (complianceMatrix.overall_score >= 90) return 'compliant';
    if (complianceMatrix.overall_score >= 70) return 'partially-compliant';
    return 'requires-review';
  }

  private generateAnalysisSummary(
    complianceMatrix: ComplianceMatrix,
    findings: DetailedFinding[],
    riskAssessment: RiskAssessment
  ): string {
    return (
      `Analysis completed with ${complianceMatrix.overall_score}% compliance score. ` +
      `${complianceMatrix.critical_issues} critical issues, ${complianceMatrix.major_issues} major issues identified. ` +
      `Overall risk level: ${riskAssessment.overall_risk}.`
    );
  }

  private calculateCompletenessScore(
    submittalSections: DocumentSection[],
    specificationSections: DocumentSection[]
  ): number {
    if (specificationSections.length === 0) return 100;

    const requiredSections = specificationSections.length;
    const providedSections = submittalSections.length;

    return Math.min(
      100,
      Math.round((providedSections / requiredSections) * 100)
    );
  }

  private calculateDueDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0] || '';
  }
}

// Document Section Interface
interface DocumentSection {
  id: string;
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  level: number;
  category: FindingCategory;
}

// Export singleton instance
export const analysisEngine = new AnalysisEngine();
