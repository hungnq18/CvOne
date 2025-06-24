# OpenAI Integration Setup Guide

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the AI-powered CV generation features.
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key in your account settings
   - Note: You'll need credits in your OpenAI account

## Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Install Dependencies

The OpenAI package is already installed. If not, run:

```bash
npm install openai
```

## Features

### AI-Powered Job Description Analysis

The system now uses OpenAI to analyze job descriptions and extract:

- **Required Skills**: Technical and soft skills
- **Experience Level**: Junior, Mid-level, or Senior
- **Key Responsibilities**: Main job duties
- **Industry**: Technology, Finance, Healthcare, etc.
- **Technologies**: Programming languages, frameworks, tools
- **Soft Skills**: Communication, leadership, teamwork
- **Education**: Required education level
- **Certifications**: Any mentioned certifications

### AI-Generated CV Content

OpenAI generates:

1. **Professional Summary**: Tailored to the job requirements
2. **Skills Section**: With appropriate ratings (1-5 scale)
3. **Work Experience**: Realistic job descriptions
4. **Content Optimization**: Based on job analysis

## API Endpoints

### 1. Generate CV with AI (Preview)
```http
POST /cv/generate-with-ai
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "jobDescription": "We are looking for a Senior React Developer with 5+ years of experience in JavaScript, TypeScript, and modern frontend frameworks. The ideal candidate should have experience with Node.js, MongoDB, and AWS. Responsibilities include developing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.",
  "title": "AI Generated CV for React Position",
  "additionalRequirements": "Focus on frontend development and team leadership"
}
```

### 2. Generate and Save CV
```http
POST /cv/generate-and-save
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "jobDescription": "Junior Python Developer position requiring knowledge of Django, PostgreSQL, and basic web development. Looking for someone with 1-2 years of experience who is eager to learn and grow.",
  "cvTemplateId": "template-id-here"
}
```

## Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "title": "AI Generated CV - 12/21/2025",
    "cvTemplateId": "template-id",
    "content": {
      "userData": {
        "firstName": "John",
        "lastName": "Doe",
        "professional": "Senior Software Developer",
        "summary": "Experienced senior professional with expertise in React, JavaScript, TypeScript...",
        "skills": [
          {
            "name": "React",
            "rating": 5
          }
        ],
        "workHistory": [
          {
            "title": "Senior Developer",
            "company": "Tech Corp",
            "startDate": "2020-01-01",
            "endDate": "2025-12-21",
            "description": "Developed scalable web applications using React, Node.js, and MongoDB..."
          }
        ]
      }
    },
    "jobAnalysis": {
      "requiredSkills": ["React", "JavaScript", "TypeScript"],
      "experienceLevel": "senior",
      "technologies": ["React", "Node.js", "MongoDB", "AWS"],
      "industry": "technology"
    },
    "message": "CV generated successfully using AI analysis"
  }
}
```

## Error Handling

The system includes fallback mechanisms:

1. **OpenAI API Failure**: Falls back to basic keyword analysis
2. **Invalid API Key**: Uses fallback methods
3. **Rate Limiting**: Implements retry logic
4. **Network Issues**: Graceful degradation

## Cost Considerations

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical CV Generation**: ~500-1000 tokens
- **Estimated Cost**: $0.001-0.002 per CV generation

## Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Rate Limiting**: Implement proper rate limiting for production
3. **Error Monitoring**: Monitor OpenAI API usage and errors
4. **Content Validation**: Always review AI-generated content
5. **User Feedback**: Collect user feedback to improve prompts

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not found"**
   - Check your `.env` file
   - Ensure the key is properly set

2. **"No response from OpenAI"**
   - Check your OpenAI account credits
   - Verify API key is valid
   - Check network connectivity

3. **"Invalid JSON response"**
   - OpenAI sometimes returns malformed JSON
   - System falls back to basic analysis

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed OpenAI API interactions in the logs. 