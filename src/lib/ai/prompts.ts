// AI Prompt Templates for Construction Submittal Analysis

export const PROMPT_TEMPLATES = {
  // System Prompt - Sets the AI's role and behavior
  SYSTEM_PROMPT: `You are an expert construction submittal reviewer with extensive knowledge of building codes, specifications, and industry standards. Your role is to analyze construction submittals and provide detailed, actionable feedback.

Key Expertise Areas:
- Building codes and regulations
- Material specifications and standards
- Quality control procedures
- Safety requirements
- Installation procedures
- Performance standards
- Testing and inspection requirements

Analysis Guidelines:
- Provide specific, actionable feedback
- Reference relevant codes and standards when applicable
- Categorize findings by severity (critical, major, minor, informational)
- Include confidence levels for recommendations
- Focus on compliance, safety, and quality
- Be thorough but concise in explanations

Response Format:
Always respond with valid JSON following this exact structure:
{
  "complianceScore": <number 0-100>,
  "overallAssessment": "<compliant|non-compliant|partially-compliant|requires-review>",
  "summary": "<brief overall summary>",
  "findings": [array of finding objects],
  "recommendations": [array of recommendation objects],
  "categories": [array of category analysis objects],
  "confidence": <number 0-1>
}`,

  // General Review Template
  GENERAL_REVIEW: `Please analyze the following {DOCUMENT_TYPE} document for compliance and quality:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

Perform a comprehensive review covering:

1. COMPLIANCE ANALYSIS
   - Code compliance (IBC, local codes)
   - Specification adherence
   - Standard conformance (ASTM, ANSI, etc.)

2. TECHNICAL REVIEW
   - Material specifications
   - Performance requirements
   - Installation procedures
   - Quality control measures

3. SAFETY ASSESSMENT
   - Safety requirements
   - Hazard identification
   - Risk mitigation measures

4. DOCUMENTATION REVIEW
   - Required certifications
   - Test reports
   - Installation instructions
   - Warranty information

For each finding, provide:
- Specific location in document
- Severity level
- Detailed description
- Required corrective action
- Reference to applicable code/standard

Return analysis in the specified JSON format.`,

  // Compliance-Focused Analysis
  COMPLIANCE_ANALYSIS: `Conduct a detailed compliance analysis of this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

COMPLIANCE CHECKLIST:

1. CODE COMPLIANCE
   - International Building Code (IBC)
   - Local building codes
   - Fire safety codes
   - Accessibility requirements (ADA)
   - Energy codes

2. SPECIFICATION COMPLIANCE
   - Material specifications
   - Performance specifications
   - Installation requirements
   - Quality standards

3. INDUSTRY STANDARDS
   - ASTM standards
   - ANSI standards
   - UL listings
   - NFPA requirements
   - Manufacturer specifications

4. REGULATORY REQUIREMENTS
   - Environmental regulations
   - Safety regulations
   - Inspection requirements
   - Testing protocols

Score each category 0-100 and provide overall compliance score.
Identify all non-compliant items with specific corrective actions.
Reference specific code sections or standards for each finding.

Return results in JSON format with detailed findings and recommendations.`,

  // Comparison Analysis Template
  COMPARISON_ANALYSIS: `Compare this submittal against the project specifications:

SUBMITTAL DOCUMENT: {FILE_NAME}
SUBMITTAL CONTENT:
{DOCUMENT_TEXT}

SPECIFICATION CONTENT:
{COMPARISON_DOCUMENT}

COMPARISON ANALYSIS:

1. SPECIFICATION COMPLIANCE
   - Match submittal items to specification requirements
   - Identify missing information
   - Flag non-conforming items
   - Check for equivalency requests

2. TECHNICAL COMPARISON
   - Performance characteristics
   - Material properties
   - Dimensional requirements
   - Installation methods

3. QUALITY REQUIREMENTS
   - Manufacturing standards
   - Testing requirements
   - Certification needs
   - Quality control procedures

4. DEVIATION ANALYSIS
   - Document all deviations from specifications
   - Assess impact of deviations
   - Determine if deviations are acceptable
   - Recommend approval/rejection/resubmission

For each comparison point:
- Specification requirement
- Submittal response
- Compliance status
- Action required

Provide recommendations for approval, conditional approval, or rejection.
Return detailed analysis in JSON format.`,

  // Material Specification Analysis
  MATERIAL_ANALYSIS: `Analyze the material specifications in this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

MATERIAL ANALYSIS FOCUS:

1. MATERIAL PROPERTIES
   - Physical properties
   - Chemical composition
   - Performance characteristics
   - Durability factors

2. MANUFACTURING STANDARDS
   - Production methods
   - Quality control
   - Testing protocols
   - Certification requirements

3. INSTALLATION REQUIREMENTS
   - Handling procedures
   - Storage requirements
   - Installation methods
   - Environmental conditions

4. PERFORMANCE VALIDATION
   - Test results
   - Certifications
   - Warranties
   - Maintenance requirements

Evaluate each material component for:
- Specification compliance
- Code conformance
- Industry standard adherence
- Quality assurance

Return comprehensive material analysis in JSON format.`,

  // Safety-Focused Review
  SAFETY_REVIEW: `Conduct a safety-focused review of this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

SAFETY ANALYSIS AREAS:

1. FIRE SAFETY
   - Fire resistance ratings
   - Flame spread characteristics
   - Smoke development
   - Emergency egress impact

2. STRUCTURAL SAFETY
   - Load-bearing capacity
   - Seismic considerations
   - Wind resistance
   - Connection details

3. OCCUPATIONAL SAFETY
   - Installation safety
   - Maintenance safety
   - Worker protection
   - Hazardous materials

4. LIFE SAFETY
   - Emergency systems
   - Accessibility compliance
   - Evacuation considerations
   - Public safety impact

For each safety consideration:
- Risk assessment
- Code compliance
- Mitigation measures
- Required certifications

Prioritize safety findings by risk level.
Return safety analysis in JSON format with actionable recommendations.`,

  // Enhanced Safety Assessment Template
  SAFETY_ASSESSMENT: `Conduct a comprehensive safety assessment of this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

SAFETY ANALYSIS FRAMEWORK:

1. HAZARD IDENTIFICATION
   - Physical hazards (fall, struck-by, caught-in/between, electrical)
   - Chemical hazards (toxic substances, reactions, exposure)
   - Environmental hazards (weather, site conditions)
   - Ergonomic hazards (repetitive motion, lifting)
   - Process hazards (equipment failure, procedural errors)

2. RISK ASSESSMENT
   - Probability of occurrence (low/medium/high)
   - Severity of consequences (minor/moderate/major/catastrophic)
   - Risk matrix evaluation
   - Residual risk after controls

3. SAFETY CONTROLS EVALUATION
   - Elimination and substitution measures
   - Engineering controls
   - Administrative controls
   - Personal protective equipment (PPE)
   - Emergency procedures

4. REGULATORY COMPLIANCE
   - OSHA standards compliance
   - Local safety regulations
   - Industry-specific safety requirements
   - Insurance requirements

5. SAFETY DOCUMENTATION
   - Safety data sheets (SDS)
   - Safety procedures
   - Training requirements
   - Emergency response plans

Provide detailed risk assessment with mitigation strategies.
Return analysis in enhanced JSON format with risk factors and mitigation plans.`,

  // Code Compliance Deep Analysis
  CODE_COMPLIANCE_DEEP: `Perform exhaustive code compliance analysis for this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

PROJECT CONTEXT:
{PROJECT_CONTEXT}

COMPREHENSIVE CODE ANALYSIS:

1. BUILDING CODE COMPLIANCE
   - International Building Code (IBC) 2021
   - International Fire Code (IFC) 2021
   - International Mechanical Code (IMC) 2021
   - International Plumbing Code (IPC) 2021
   - International Energy Conservation Code (IECC) 2021
   - Local amendments and modifications

2. ACCESSIBILITY COMPLIANCE
   - Americans with Disabilities Act (ADA) 2010 Standards
   - Section 504 requirements
   - State accessibility codes
   - Universal design principles

3. ENVIRONMENTAL COMPLIANCE
   - Environmental Protection Agency (EPA) regulations
   - State environmental requirements
   - Green building standards (LEED, Energy Star)
   - Sustainable design requirements

4. SPECIALTY CODE COMPLIANCE
   - Seismic design requirements
   - Wind load requirements
   - Flood zone requirements
   - Historic preservation requirements

5. JURISDICTION-SPECIFIC REQUIREMENTS
   - Local building department requirements
   - Zoning compliance
   - Special district requirements
   - Permit conditions

For each code section, provide:
- Specific code reference
- Requirement description
- Compliance status
- Gap analysis
- Corrective action plan

Return detailed compliance matrix with specific code citations.`,

  // Quality Control Assessment
  QUALITY_CONTROL: `Analyze quality control measures and procedures in this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

QUALITY CONTROL FRAMEWORK:

1. QUALITY PLANNING
   - Quality objectives and targets
   - Quality control plan
   - Inspection and testing schedule
   - Acceptance criteria

2. MATERIAL QUALITY CONTROL
   - Material specifications compliance
   - Supplier qualification
   - Material testing requirements
   - Storage and handling procedures

3. WORKMANSHIP QUALITY CONTROL
   - Installation procedures
   - Workmanship standards
   - Inspection checkpoints
   - Defect prevention measures

4. TESTING AND VERIFICATION
   - Required testing protocols
   - Testing frequency and timing
   - Acceptance/rejection criteria
   - Non-conformance procedures

5. DOCUMENTATION AND RECORDS
   - Quality records requirements
   - Inspection documentation
   - Test reports and certificates
   - As-built documentation

6. CONTINUOUS IMPROVEMENT
   - Lessons learned integration
   - Process improvement opportunities
   - Quality metrics and KPIs
   - Corrective and preventive actions

Evaluate quality control adequacy and provide improvement recommendations.
Return comprehensive quality assessment with metrics and action items.`,

  // Performance Evaluation Template
  PERFORMANCE_EVALUATION: `Evaluate performance characteristics and requirements for this {DOCUMENT_TYPE}:

DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

PERFORMANCE EVALUATION CRITERIA:

1. FUNCTIONAL PERFORMANCE
   - Primary function requirements
   - Performance specifications
   - Operational parameters
   - Service life expectations

2. STRUCTURAL PERFORMANCE
   - Load-bearing capacity
   - Deflection limits
   - Vibration characteristics
   - Durability factors

3. THERMAL PERFORMANCE
   - Thermal resistance (R-value)
   - Thermal bridging
   - Moisture control
   - Energy efficiency

4. ACOUSTIC PERFORMANCE
   - Sound transmission class (STC)
   - Impact insulation class (IIC)
   - Noise reduction coefficient (NRC)
   - Reverberation time

5. ENVIRONMENTAL PERFORMANCE
   - Weather resistance
   - UV stability
   - Chemical resistance
   - Sustainability metrics

6. MAINTENANCE PERFORMANCE
   - Maintenance requirements
   - Service intervals
   - Replacement schedules
   - Life cycle costs

Analyze performance against specifications and industry benchmarks.
Identify performance gaps and provide optimization recommendations.
Return detailed performance analysis with metrics and improvement strategies.`,

  // Multi-Document Comparison Analysis
  MULTI_DOCUMENT_COMPARISON: `Compare and analyze multiple documents for consistency and compliance:

PRIMARY DOCUMENT: {FILE_NAME}
CONTENT:
{DOCUMENT_TEXT}

COMPARISON DOCUMENTS:
{COMPARISON_DOCUMENTS}

PROJECT CONTEXT:
{PROJECT_CONTEXT}

COMPREHENSIVE COMPARISON ANALYSIS:

1. CONSISTENCY ANALYSIS
   - Cross-reference information accuracy
   - Conflicting requirements identification
   - Version control verification
   - Update synchronization check

2. COMPLETENESS ASSESSMENT
   - Information gaps identification
   - Missing requirements
   - Incomplete specifications
   - Reference document availability

3. COMPLIANCE COORDINATION
   - Multi-document compliance verification
   - Regulatory requirement alignment
   - Standard conformance across documents
   - Code compliance coordination

4. INTEGRATION ANALYSIS
   - System integration requirements
   - Interface specifications
   - Coordination requirements
   - Dependency mapping

5. RISK IDENTIFICATION
   - Conflicting requirements risks
   - Integration risks
   - Compliance risks
   - Performance risks

6. RESOLUTION RECOMMENDATIONS
   - Conflict resolution strategies
   - Clarification requirements
   - Update recommendations
   - Coordination improvements

Provide comprehensive analysis with conflict matrix and resolution plan.
Return detailed comparison results with action items and recommendations.`,
};

// Prompt Template Builder
export class PromptBuilder {
  static buildCustomPrompt(
    baseTemplate: string,
    variables: Record<string, string>
  ): string {
    let prompt = baseTemplate;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key.toUpperCase()}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    });

    return prompt;
  }

  static addContextualInstructions(
    prompt: string,
    documentType: string,
    specialRequirements?: string[]
  ): string {
    let enhanced = prompt;

    // Add document-specific instructions
    switch (documentType.toLowerCase()) {
      case 'submittal':
        enhanced +=
          '\n\nSUBMITTAL-SPECIFIC FOCUS:\n- Verify all required submittals are included\n- Check for proper approval stamps\n- Validate manufacturer certifications';
        break;
      case 'specification':
        enhanced +=
          '\n\nSPECIFICATION REVIEW FOCUS:\n- Check for completeness\n- Verify technical requirements\n- Validate performance criteria';
        break;
    }

    // Add special requirements
    if (specialRequirements?.length) {
      enhanced +=
        '\n\nSPECIAL REQUIREMENTS:\n' +
        specialRequirements.map(req => `- ${req}`).join('\n');
    }

    return enhanced;
  }
}

export default PROMPT_TEMPLATES;
