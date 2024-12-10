// app/components/ui/program-list.tsx
import React from 'react';
import { MapPin, Clock, DollarSign, DiamondPlus } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  university: string;
  details: string;
  matchScore: number;
  duration: string;
  tuition: string;
  location: string;
}

interface ProgramListProps {
  programs: Program[];
  onSelect: (programId: string) => void;
}

export default function ProgramList({ programs, onSelect }: ProgramListProps) {
  return (
    <div className="space-y-4 w-full max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">Recommended Programs</h3>
      
      <div className="grid gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">{program.title}</h4>
                <p className="text-gray-600">{program.university}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4"/>
                    <span>{program.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4"/>
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4"/>
                    <span>{program.tuition}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DiamondPlus className="w-4 h-4"/>
                    <span>{program.matchScore}% Match</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2">{program.details}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: `rgba(52, 211, 153, ${program.matchScore / 100})`,
                    color: program.matchScore > 70 ? 'white' : 'black'
                  }}
                >
                  {program.matchScore}% Match
                </div>
                <button
                  onClick={() => onSelect(program.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}