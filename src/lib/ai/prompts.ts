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
