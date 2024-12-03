"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { AssignmentsTabs } from "@/components/counselor/assignments-tabs";
import { useEffect, useState } from "react";

export default function CounselorDashboardHomePage() {
  const [openAssignments, setOpenAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const [openResponse, myResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignments?status=open`),
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignments/counselor`)
        ]);

        if (!openResponse.ok || !myResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const [openData, myData] = await Promise.all([
          openResponse.json(),
          myResponse.json()
        ]);

        setOpenAssignments(openData);
        setMyAssignments(myData);
      } catch (err) {
        console.error("Error loading assignments:", err);
        setError("Failed to load assignments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (error) {
    return (
      <DashboardShell>
        <DashboardHeader 
          heading="Counselor Dashboard" 
          text="Error loading assignments"
        />
        <div className="mt-8">
          {error}. Please try again later.
        </div>
      </DashboardShell>
    );
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader 
          heading="Counselor Dashboard" 
          text="Loading assignments..."
        />
        <div className="mt-8">
          Loading...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Counselor Dashboard" 
        text="Manage your student assignments and view open requests"
      />
      <div className="mt-8">
        <AssignmentsTabs
          openAssignments={openAssignments}
          myAssignments={myAssignments}
        />
      </div>
    </DashboardShell>
  );
}
