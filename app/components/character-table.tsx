// week4project/app/components/character-table.tsx
import React from 'react';

interface Character {
  name: string;
  description?: string;
  personality?: string;
  [key: string]: any; // Allow for other properties
}

interface CharacterTableProps {
  characters: Character[];
}

export const CharacterTable: React.FC<CharacterTableProps> = ({ characters }) => {
  if (!characters || characters.length === 0) {
    return <p>No characters extracted yet.</p>;
  }

  // Extract unique keys for table headers
  const headers = Object.keys(characters[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="py-2 px-4 border-b">
                {header.charAt(0).toUpperCase() + header.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {characters.map((character, index) => (
            <tr key={index} className="border-b">
              {headers.map((header) => (
                <td key={header} className="py-2 px-4">
                  {character[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

