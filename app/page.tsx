'use client';

import React, { useState, useCallback } from 'react';
import { ChatSectionUI } from '@/components/chat-section'; // You might reuse this or create a simpler UI
import { FileUploader } from './components/file-uploader';
import { CharacterTable } from './components/character-table';

interface Character {
  name: string;
  description?: string;
  personality?: string;
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedCharacters, setExtractedCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [storyTopic, setStoryTopic] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [storyLoading, setStoryLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleExtractCharacters = useCallback(async () => {
    if (!uploadedFile) {
      alert('Please upload a file first.');
      return;
    }

    setLoading(true);
    setExtractedCharacters([]);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;

        const response = await fetch('/api/extract-characters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileContent }),
        });

        if (response.ok) {
          const data = await response.json();
          setExtractedCharacters(data.characters);
        } else {
          console.error('Error extracting characters:', response.statusText);
          alert('Failed to extract characters.');
        }
        setLoading(false);
      };
      reader.readAsText(uploadedFile);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading the uploaded file.');
      setLoading(false);
    }
  }, [uploadedFile]);

  const handleGenerateStory = useCallback(async () => {
    console.log("handleGenerateStory called");
    console.log("extractedCharacters:", extractedCharacters);
    console.log("storyTopic:", storyTopic);

    if (extractedCharacters.length === 0) {
      alert('Please extract characters first.');
      return;
    }
    if (!storyTopic) {
      alert('Please enter a story topic.');
      return;
    }

    setStoryLoading(true);
    setGeneratedStory('');

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characters: extractedCharacters, topic: storyTopic }),
      });

      console.log("Frontend API Response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Frontend API Data:", data);
        setGeneratedStory(data.story);
      } else {
        console.error('Error generating story:', response.statusText);
        alert('Failed to generate story.');
      }
      setStoryLoading(false);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Error generating story.');
      setStoryLoading(false);
    }
  }, [extractedCharacters, storyTopic]);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Character Extractor & Story Generator</h1>

      <FileUploader onFileChange={handleFileChange} />

      <button
        onClick={handleExtractCharacters}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        disabled={!uploadedFile || loading}
      >
        {loading ? 'Extract Characters' : 'Extract Characters'}
      </button>

      {extractedCharacters.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Extracted Characters</h2>
          <CharacterTable characters={extractedCharacters} />

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Story Generator</h2>
            <input
              type="text"
              placeholder="Enter a story topic"
              className="border p-2 w-full mb-2"
              value={storyTopic}
              onChange={(e) => setStoryTopic(e.target.value)}
            />
            <button
              onClick={handleGenerateStory}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={extractedCharacters.length === 0 || !storyTopic || storyLoading}
            >
              {storyLoading ? 'Generating Story...' : 'Generate Story'}
            </button>
            {generatedStory && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-1">Generated Story:</h3>
                <p>{generatedStory}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}


