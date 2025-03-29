// app/api/extract-characters/route.ts
import { OpenAI } from 'llamaindex';
import { Document, VectorStoreIndex } from 'llamaindex';
import { PromptTemplate } from 'llamaindex';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let responseSent = false;
  try {
    const { fileContent } = await req.json();

    const llm = new OpenAI({
      model: 'gpt-3.5-turbo', // Or a more capable model
    });

    // Create a document from the file content
    const document = new Document({ text: fileContent });

    // Initialize vector store index
    const index = await VectorStoreIndex.fromDocuments([document]);

    // Create a query engine with a custom prompt for character extraction
    const template = new PromptTemplate(`
      You are an expert in identifying characters from a text.
      Extract all the main characters from the following text, along with a brief description of their appearance and key personality traits.
      Return the information as a JSON array of objects, where each object has the following keys: "name", "description", and "personality". If a description or personality cannot be determined from the text, leave those fields blank.

      Text:
      {context}
    `);

    const queryEngine = index.asQueryEngine({
      llm,
      responseMode: "compact",
      prompt: template,
      retriever: index.asRetriever(),
      // outputParser: { // Removed the outputParser
      //   parseResult: (output: string) => {
      //     try {
      //       const parsedOutput = JSON.parse(output);
      //       return parsedOutput;
      //     } catch (error) {
      //       console.error("Failed to parse LLM output as JSON:", output, error);
      //       return [];
      //     }
      //   },
      // },
    });

    const response = await queryEngine.query({
      query: "Identify and describe the main characters in the text.",
    });

    const llmOutput = response.message.content;
    console.log("LLM Output Text:", llmOutput);

    // Simple parsing logic (adjust as needed based on LLM output)
    const characters: { name: string; description?: string; personality?: string }[] = [];
    const characterMatches = llmOutput.split(/\d+\. \*\*(.*?)\*\*: /);

    for (let i = 1; i < characterMatches.length; i += 2) {
      const name = characterMatches[i];
      const descriptionPersonality = characterMatches[i + 1];
      const parts = descriptionPersonality.split('. ');
      const description = parts[0];
      const personality = parts.slice(1).join('. ');
      characters.push({ name, description, personality });
    }

    responseSent = true;
    return NextResponse.json({ characters });

  } catch (error: any) {
    console.error('Error processing request:', error);
    responseSent = true;
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (!responseSent) {
      console.error("Error: No response was sent from route handler.");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}

