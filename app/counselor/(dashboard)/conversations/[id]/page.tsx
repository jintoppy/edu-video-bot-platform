"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConversationDetails } from "@/components/admin/conversation-details";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatSession {
  id: string;
  studentId: string;
  communicationMode: string;
  category: string;
  startTime: string;
  endTime: string | null;
  summary: string | null;
  status: string;
  user?: {
    fullName: string;
    email: string;
  };
  assignment?: {
    counselorId: string | null;
    status: string;
  };
}

interface StudentProfile {
  currentEducation: string;
  desiredLevel: string;
  preferredCountries: string[];
  testScores: any;
  budgetRange: string;
  workExperience: any;
  extraCurricular: any;
}

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const [conversation, setConversation] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch conversation");
        }
        const data = await response.json();
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [params.id]);

  const fetchStudentProfile = async () => {
    if (!conversation?.studentId) return;
    
    setLoadingProfile(true);
    try {
      const response = await fetch(`/api/students/${conversation.studentId}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch student profile');
      }
      const data = await response.json();
      setStudentProfile(data);
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
    if (!studentProfile) {
      fetchStudentProfile();
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch('/api/assignments/counselor/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign conversation');
      }

      // Refresh the page or update UI as needed
      window.location.reload();
    } catch (error) {
      console.error('Error assigning conversation:', error);
      // Handle error (you might want to show a toast notification)
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  if (error || !conversation) {
    return <div>Error: {error || "Conversation not found"}</div>;
  }
  

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Conversation Details"
          text={`Viewing conversation with ${
            conversation.user?.fullName || "Unknown"
          }`}
        />
        <div className="space-x-2">
          <Button onClick={handleViewProfile}>View Profile</Button>
          {(!conversation.assignment?.counselorId) && (
            <Button onClick={handleAssign}>Self Assign</Button>
          )}
        </div>
      </div>
      <ConversationDetails conversation={conversation} />

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile - {conversation.user?.fullName}</DialogTitle>
          </DialogHeader>
          
          {loadingProfile ? (
            <div className="py-8 text-center">Loading profile...</div>
          ) : studentProfile ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Current Education</h3>
                <p>{studentProfile.currentEducation}</p>
              </div>
              <div>
                <h3 className="font-semibold">Desired Level</h3>
                <p>{studentProfile.desiredLevel}</p>
              </div>
              <div>
                <h3 className="font-semibold">Preferred Countries</h3>
                <p>{studentProfile.preferredCountries.join(", ")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Budget Range</h3>
                <p>{studentProfile.budgetRange}</p>
              </div>
              {studentProfile.testScores && (
                <div>
                  <h3 className="font-semibold">Test Scores</h3>
                  <pre className="text-sm">{JSON.stringify(studentProfile.testScores, null, 2)}</pre>
                </div>
              )}
              {studentProfile.workExperience && (
                <div>
                  <h3 className="font-semibold">Work Experience</h3>
                  <pre className="text-sm">{JSON.stringify(studentProfile.workExperience, null, 2)}</pre>
                </div>
              )}
              {studentProfile.extraCurricular && (
                <div>
                  <h3 className="font-semibold">Extra Curricular Activities</h3>
                  <pre className="text-sm">{JSON.stringify(studentProfile.extraCurricular, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No profile information available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
