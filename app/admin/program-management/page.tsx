"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Search } from "lucide-react";
import { AddProgramModal } from "@/components/programs/add-program-modal";
import { EditProgramModal } from "@/components/programs/edit-program-modal";

import {
  programFormSchema,
  ProgramFormValues,
} from "@/components/programs/program-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  BuilderSchema,
  OrganizationSchema,
  SchemaField,
} from "@/types/organization";
import { Program } from "@/types/programs";
import { useOrganization } from "@clerk/nextjs";
import { getOrganizationSchema } from "@/app/actions/organizations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BulkUploadModal } from "./coponents/bulk-upload-modal";

interface StatusBadgeProps {
  status: "Active" | "Inactive";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Active: "bg-green-50 text-green-700",
    Inactive: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

interface NewProgramData {
  data: Record<string, any>;
  isActive: boolean;
  organizationId: string;
}

const ProgramsManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [organizationSchema, setOrganizationSchema] = useState<BuilderSchema>({
    sections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization: clerkOrg } = useOrganization();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const { toast } = useToast();

  const fetchPrograms = async (orgId: string) => {
    if (!orgId) {
      return;
    }
    const programsResponse = await fetch(`/api/programs?orgId=${orgId}`);
    if (!programsResponse.ok) throw new Error("Failed to fetch programs");
    const programsData = await programsResponse.json();
    setPrograms(Array.isArray(programsData) ? programsData : []);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!clerkOrg) {
        return;
      }
      try {
        // Fetch organization schema
        const { schema, orgId } = await getOrganizationSchema(clerkOrg.id);
        setOrganizationSchema(schema as BuilderSchema);
        setOrgId(orgId);

        // Fetch programs
        fetchPrograms(orgId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (clerkOrg) {
      fetchData();
    }
  }, [clerkOrg]);

  const handleAddProgram = async (programData: any) => {
    if (!orgId) return;

    const newProgram: NewProgramData = {
      name: programData.name,
      data: programData,
      isActive: true,
      organizationId: orgId,
    };

    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to add program");
      }

      const newProgramData = await response.json();
      setPrograms((prev) => [...prev, newProgramData]);

      // Refresh programs list
      const updatedResponse = await fetch(`/api/programs?orgId=${orgId}`);
      if (!updatedResponse.ok) {
        throw new Error("Failed to refresh programs");
      }
      fetchPrograms(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add program");
    }
  };

  const handleEditProgram = async (programId: string, programData: any) => {
    try {
      const response = await fetch("/api/programs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: programId, data: programData }),
      });

      if (!response.ok) {
        throw new Error("Failed to update program");
      }

      // Refresh programs list
      const updatedResponse = await fetch("/api/programs");
      const updatedData = await updatedResponse.json();
      setPrograms(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update program");
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Implement search functionality
    console.log(event.target.value);
  };

  const handleBulkUpload = async (programs: any[]) => {
    if (!orgId) return;

    try {
      // Transform the data to match our API structure
      const programsToCreate = programs.map((program) => ({
        data: program,
        isActive: true,
        organizationId: orgId,
      }));

      const response = await fetch("/api/programs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programs: programsToCreate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to bulk upload programs");
      }

      fetchPrograms(orgId);

      // Show success message
      toast({
        title: "Success",
        description: `Successfully uploaded ${programs.length} programs`,
      });
    } catch (error) {
      console.error("Error uploading programs:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload programs",
        variant: "destructive",
      });
    }
  };

  // Helper function to get field by path
  const getFieldByPath = (path: string): SchemaField | undefined => {
    const parts = path.split(".");
    let currentSchema: Record<string, SchemaField> = {};

    // Convert sections to flat schema
    organizationSchema.sections.forEach((section) => {
      section.fields.forEach((field) => {
        currentSchema[field.name] = field;
      });
    });

    let current = currentSchema[parts[0]];
    for (let i = 1; i < parts.length; i++) {
      if (!current?.fields) return undefined;
      current = current.fields[parts[i]];
    }
    return current;
  };

  const renderFieldValue = (value: any, field: SchemaField | string) => {
    // If field is a string, get the actual field schema
    const fieldSchema =
      typeof field === "string" ? getFieldByPath(field) : field;

    if (!fieldSchema) return "N/A";
    if (value === undefined || value === null) return "N/A";

    switch (fieldSchema.type) {
      case "boolean":
        return value ? "Yes" : "No";
      case "array":
        if (!Array.isArray(value)) return String(value);
        if (fieldSchema.arrayType?.type === "object") {
          return `${value.length} items`;
        }
        return value.join(", ");
      case "object":
        if (!fieldSchema.fields) return JSON.stringify(value);
        return Object.keys(fieldSchema.fields).length + " properties";
      case "enum":
        return fieldSchema.options?.includes(value) ? value : "Invalid option";
      default:
        return String(value);
    }
  };

  const renderObjectFields = (
    data: Record<string, any>,
    fields: Record<string, SchemaField>,
    path: string = ""
  ) => {
    return Object.entries(fields).map(([fieldName, fieldSchema]) => {
      const currentPath = path ? `${path}.${fieldName}` : fieldName;
      const value = data[fieldName];

      return (
        <div key={currentPath} className="space-y-1">
          <div className="text-sm text-gray-500">{fieldSchema.label}</div>
          {fieldSchema.type === "object" && fieldSchema.fields ? (
            <div className="pl-4 border-l">
              {renderObjectFields(value || {}, fieldSchema.fields, currentPath)}
            </div>
          ) : (
            <div className="text-sm">
              {renderFieldValue(value, fieldSchema)}
            </div>
          )}
        </div>
      );
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const renderProgramData = (program: Program) => {
    return organizationSchema.sections.map((section) => (
      <div key={section.name} className="mb-4">
        <h3 className="font-medium mb-2">{section.name}</h3>
        <div className="grid grid-cols-2 gap-4">
          {section.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <div className="text-sm text-gray-500">{field.label}</div>
              <div className="text-sm">
                {renderFieldValue(program.data[field.name], field)}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const handleDeleteProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete program");
      }

      toast({
        title: "Success",
        description: "Deleted program successfully",
      });
      // Update your programs list after successful deletion
      setPrograms((prev) => prev.filter((program) => program.id !== programId));
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete program",
        variant: "destructive",
      });
      // Handle error (show toast, etc.)
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Program Management"
        text="Manage your educational programs and eligibility criteria"
      >
        <div className="flex space-x-2">
          <BulkUploadModal
            schema={organizationSchema}
            onUpload={handleBulkUpload}
          />
          <AddProgramModal
            onSubmit={handleAddProgram}
            schema={organizationSchema}
          />
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search programs..." className="pl-8" />
          </div>
        </div>

        <div className="rounded-md border">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <div>
              {programs.map((program) => (
                <div key={program.id} className="border-b last:border-b-0">
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">
                        {program.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          program.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {program.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <EditProgramModal
                        program={program}
                        onSubmit={handleEditProgram}
                        schema={organizationSchema}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the program{" "}
                              <span className="font-medium">
                                {program.data?.basic_information?.programName ||
                                  "Unnamed Program"}
                              </span>
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProgram(program.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="p-4">
                    {organizationSchema.sections.map((section) => {
                      const sectionKey = section.name
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      const sectionData = program.data[sectionKey] || {};

                      return (
                        <div key={section.name} className="mb-4">
                          <h3 className="font-medium mb-2">{section.name}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {section.fields.map((field) => (
                              <div key={field.name} className="space-y-1">
                                <div className="text-sm text-gray-500">
                                  {field.label}
                                </div>
                                <div className="text-sm">
                                  {renderFieldValue(
                                    sectionData[field.name],
                                    field
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

export default ProgramsManagement;
