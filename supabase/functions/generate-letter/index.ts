
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting letter generation...');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const { letterType, employeeName, situationDescription, companyName } = await req.json();
    
    console.log('Request data:', { letterType, employeeName, situationDescription, companyName });

    if (!letterType || !employeeName || !situationDescription) {
      throw new Error('Missing required fields: letterType, employeeName, or situationDescription');
    }

    const prompt = `Write a formal HR letter for the following situation:
- Letter Type: ${letterType}
- Employee Name: ${employeeName}
- Company: ${companyName || 'Our Organization'}
- Situation: ${situationDescription}

Requirements:
- Professional and assertive tone
- Include proper subject line
- Include date and employee address section placeholders
- Include formal opening and closing
- Include signature section
- Use formal business letter format
- Be specific and actionable

Format the letter with clear sections and proper spacing.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional HR letter writer. Create formal, well-structured business letters that follow proper formatting conventions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      // Handle specific error codes with user-friendly messages
      if (response.status === 429) {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === 'insufficient_quota') {
          throw new Error('AI service quota exceeded. Please check your OpenAI billing details or contact support.');
        }
        throw new Error('AI service rate limit exceeded. Please try again in a few moments.');
      } else if (response.status === 401) {
        throw new Error('AI service authentication failed. Please contact support.');
      } else if (response.status >= 500) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      }
      
      throw new Error(`AI service error (${response.status}). Please try again or contact support if the problem persists.`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedLetter = data.choices[0].message.content;
    console.log('Letter generated successfully');

    return new Response(JSON.stringify({ generatedLetter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-letter function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
