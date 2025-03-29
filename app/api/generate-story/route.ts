// app/api/generate-story/route.ts
import { OpenAI } from 'llamaindex';
import { PromptTemplate } from 'llamaindex';
import { NextResponse } from 'next/server';

interface Character {
  name: string;
  description?: string;
  personality?: string;
}

export async function POST(req: Request) {
  try {
    const { characters, topic } = await req.json();

    if (!characters || characters.length === 0 || !topic) {
      return NextResponse.json({ error: 'Missing characters or topic' }, { status: 400 });
    }

    const llm = new OpenAI({
      model: 'gpt-3.5-turbo', // Or a more capable model
    });

    // Format the character information for the prompt
    const characterDetails = characters.map(char => `Name: ${char.name}, Description: ${char.description || 'N/A'}, Personality: ${char.personality || 'N/A'}`).join('\n');

    const prompt = `
      Generate a new story based on the following characters and topic.

      Characters:
      ${characterDetails}

      Topic: ${topic}

      Story:
    `;

    const response = await llm.complete({
      prompt: prompt, // Pass the string directly
    });

    const story = response.text;

    return NextResponse.json({ story });

  } catch (error: any) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

