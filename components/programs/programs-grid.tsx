//@ts-nocheck

"use client";

import React, { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, GraduationCap, Clock, Video } from "lucide-react";
import Link from "next/link";

// Types
interface Program {
  id: string;
  universityId: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  country: string;
  eligibilityCriteria: {
    academicRequirements?: string[];
    languageRequirements?: {
      test: string;
      minimumScore: number;
    }[];
    workExperience?: string;
  };
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ProgramCardProps = {
  program: Program;
  onViewDetails: (id: string) => void;
  enrolling: string | null;
  handleEnroll: (programId: string) => void;
};

const ProgramCard: FC<ProgramCardProps> = ({
  program,
  enrolling,
  onViewDetails,
  handleEnroll,
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-2">
        <img
          src={program.imageUrl}
          alt={program.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="space-y-1">
          <CardTitle className="text-xl">{program.name}</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {program.universityId}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <GraduationCap className="h-4 w-4" />
          <span>{program.country}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">{program.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(program.id)}
            >
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{program.name}</DialogTitle>
              <DialogDescription>Level: {program.level}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {program.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Country: {program.country}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-600">{program.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Eligibility Criteria</h4>
                {program.eligibilityCriteria?.academicRequirements && (
                  <div>
                    <h5 className="text-sm font-medium">
                      Academic Requirements:
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {program.eligibilityCriteria.academicRequirements.map(
                        (req, index) => (
                          <li key={index} className="text-sm">
                            {req}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {program.eligibilityCriteria?.languageRequirements && (
                  <div>
                    <h5 className="text-sm font-medium">
                      Language Requirements:
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(
                        program.eligibilityCriteria.languageRequirements
                      )?.map((requirementEntry, index: number) => {
                        const [courseKey, minScore] = requirementEntry;
                        return (
                          <li key={index} className="text-sm">
                            {courseKey}: Minimum score {minScore}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {program.eligibilityCriteria?.workExperience && (
                  <div>
                    <h5 className="text-sm font-medium">Work Experience:</h5>
                    <p className="text-sm">
                      {program.eligibilityCriteria.workExperience}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Badge variant="secondary" className="w-fit">
                  Tuition Fee: {program.tuitionFee} {program.currency}
                </Badge>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleEnroll(program.id)}
                  disabled={enrolling === program.id}
                >
                  {enrolling === program.id ? "Enrolling..." : "Enroll Now"}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1"
            onClick={() => handleEnroll(program.id)}
            disabled={enrolling === program.id}
          >
            {enrolling === program.id ? "Enrolling..." : "Enroll"}
          </Button>
          <Link href={`/chat?programId=${program.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Consult
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export const ProgramsGrid = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEnroll = async (programId: string) => {
    try {
      setEnrolling(programId);
      const response = await fetch("/api/programs/enrol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId,
          notes: "Enrollment request from program listing",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in program");
      }

      toast({
        title: "Success!",
        description: "Your enrollment request has been submitted.",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error enrolling in program:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to enroll in program",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewDetails = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch program details");
      }
      const data = await response.json();
      setSelectedProgram(data);
    } catch (err) {
      console.error("Error fetching program details:", err);
    }
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs");
        if (!response.ok) {
          throw new Error("Failed to fetch programs");
        }
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch programs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return <div>Loading programs...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          program={
            selectedProgram?.id === program.id ? selectedProgram : program
          }
          onViewDetails={handleViewDetails}
          handleEnroll={handleEnroll}
          enrolling={enrolling}
        />
      ))}
    </div>
  );
};
