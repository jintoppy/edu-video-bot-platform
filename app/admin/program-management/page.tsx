'use client'

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Search } from 'lucide-react';
import { AddProgramModal } from '@/components/programs/add-program-modal';
import { EditProgramModal } from '@/components/programs/edit-program-modal';

import { programFormSchema, ProgramFormValues } from "@/components/programs/program-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export interface Program extends ProgramFormValues {
  id: string;
  universityId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatusBadgeProps {
  status: 'Active' | 'Inactive';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Active: 'bg-green-50 text-green-700',
    Inactive: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const ProgramsManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();
        console.log(data);
        if(Array.isArray(data)){
          setPrograms(data);
        }
        else {
          setPrograms([]);
        }
        
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleAddProgram = async (programData: any) => {
    const newProgram = {
      ...programData,
      tuitionFee: parseFloat(programData.tuitionFee),
      isActive: true
    };

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) {
        throw new Error('Failed to add program');
      }

      // Refresh programs list
      const updatedResponse = await fetch('/api/programs');
      const updatedData = await updatedResponse.json();
      setPrograms(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add program');
    }
  };

  const handleEditProgram = async (programId: string, programData: any) => {
    try {
      const response = await fetch('/api/programs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: programId, ...programData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update program');
      }

      // Refresh programs list
      const updatedResponse = await fetch('/api/programs');
      const updatedData = await updatedResponse.json();
      setPrograms(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update program');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Implement search functionality
    console.log(event.target.value);
  };

  const handleBulkUpload = (): void => {
    // Implement bulk upload functionality
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Program Management" 
        text="Manage your educational programs and eligibility criteria"
      >
        <div className="flex space-x-2">
          <Button onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <AddProgramModal onSubmit={handleAddProgram} />
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search programs..." 
              className="pl-8" 
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.level}</TableCell>
                  <TableCell>
                    <StatusBadge status={program.isActive ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell>{program.eligibilityCriteria ? JSON.stringify(program.eligibilityCriteria) : 'N/A'}</TableCell>
                  <TableCell>{new Date(program.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <EditProgramModal 
                      program={program}
                      onSubmit={handleEditProgram}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ProgramsManagement;
