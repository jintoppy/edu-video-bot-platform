"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentsTable } from "./assignments-table";

interface AssignmentsTabsProps {
  openAssignments: any[];
  myAssignments: any[];
}

export function AssignmentsTabs({
  openAssignments,
  myAssignments,
}: AssignmentsTabsProps) {
  return (
    <Tabs defaultValue="open" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="open">Open Requests</TabsTrigger>
        <TabsTrigger value="my">My Assignments</TabsTrigger>
      </TabsList>
      <TabsContent value="open" className="mt-6">
        <AssignmentsTable assignments={openAssignments} />
      </TabsContent>
      <TabsContent value="my" className="mt-6">
        <AssignmentsTable assignments={myAssignments} />
      </TabsContent>
    </Tabs>
  );
}
