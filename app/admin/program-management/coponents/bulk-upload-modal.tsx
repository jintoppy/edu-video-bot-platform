'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { BuilderSchema } from '@/types/organization';

interface BulkUploadModalProps {
  schema: BuilderSchema;
  onUpload: (data: any[]) => Promise<void>;
}

interface DynamicRecord {
    [key: string]: {
      [key: string]: any;
    };
  }

interface ValidationError {
    row: number;
    errors: string[];
  }

export function BulkUploadModal({ schema, onUpload }: BulkUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const validateData = (data: DynamicRecord[]): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const rowErrors: string[] = [];

        // Validate required name field
        if (!record.name) {
          rowErrors.push('Program name is required');
        }
    
        schema.sections.forEach(section => {
          const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
          const recordSection = record[sectionKey] || {};
    
          section.fields.forEach(field => {
            const value = recordSection[field.name];
            
            // Check required fields
            if (field.required && !value) {
              rowErrors.push(`Missing required field "${field.label}" in section "${section.name}"`);
            }
    
            // Validate enum values
            if (field.type === 'enum' && value && field.options) {
              if (!field.options.includes(value)) {
                rowErrors.push(`Invalid value "${value}" for field "${field.label}". Allowed values: ${field.options.join(', ')}`);
              }
            }
    
            // Validate number values
            if (field.type === 'number' && value) {
              if (isNaN(Number(value))) {
                rowErrors.push(`Invalid number value "${value}" for field "${field.label}"`);
              }
            }
          });
        });
    
        if (rowErrors.length > 0) {
          validationErrors.push({
            row: i + 1,
            errors: rowErrors
          });
        }
      }
    
      return validationErrors;
  };

  const getFlattenedHeaders = () => {
    const headers: string[] = [];
    schema.sections.forEach(section => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
      section.fields.forEach(field => {
        headers.push(`${sectionKey}.${field.name}`);
      });
    });
    return headers;
  };

  const createEmptyTemplateRow = () => {
    const row: Record<string, string> = {};
    getFlattenedHeaders().forEach(header => {
      row[header] = '';
    });
    return row;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
  
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
      setError('Please upload a CSV or Excel file');
      return;
    }
  
    setFile(file);
    setIsLoading(true);
  
    try {
      const flatData = await readFile(file);
      console.log('Flat data:', flatData);
      
      // Restructure the flat data into nested format
      const structuredData = restructureData(flatData);
      console.log('Structured data before validation:', structuredData);
      
      const validationErrors = validateData(structuredData);
      if (validationErrors.length > 0) {
        setError(`Validation errors:\n${validationErrors.join('\n')}`);
        return;
      }
  
      setPreviewData(structuredData);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error reading file. Please ensure it matches the template format.');
    } finally {
      setIsLoading(false);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // Skip the description row (second row) by starting from index 2
          const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 2 });
          console.log('Raw data from file:', jsonData);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!previewData.length) return;

    setIsLoading(true);
    try {
      await onUpload(previewData);
      setOpen(false);
      setFile(null);
      setPreviewData([]);
    } catch (err) {
      setError('Failed to upload programs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create headers and example row
    const templateRows = [];
    
    // Add headers
    const headers: Record<string, string> = {};
    schema.sections.forEach(section => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
      section.fields.forEach(field => {
        const header = `${sectionKey}.${field.name}`;
        let description = field.label;
        if (field.required) description += ' (Required)';
        headers[header] = description;
      });
    });
    templateRows.push(headers);
  
    // Add empty row as template
    // const emptyRow = Object.keys(headers).reduce((acc, header) => {
    //   acc[header] = '';
    //   return acc;
    // }, {} as Record<string, string>);
    // templateRows.push(emptyRow);
  
    // Add example row
    const exampleRow = Object.keys(headers).reduce((acc, header) => {
      const [section, field] = header.split('.');
      acc[header] = `Example ${field}`;
      return acc;
    }, {} as Record<string, string>);
    templateRows.push(exampleRow);
  
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
    // Add instructions sheet
    const instructionsData = schema.sections.map(section => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
      return section.fields.map(field => ({
        'Column Header': `${sectionKey}.${field.name}`,
        'Field Name': field.label,
        'Required': field.required ? 'Yes' : 'No',
        'Type': field.type,
        'Description': `Field for ${field.label}${field.required ? ' (Required)' : ''}`
      }));
    }).flat();
  
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  
    XLSX.writeFile(wb, 'program_template.xlsx');
  };

  const restructureData = (flatData: Record<string, any>[]) => {
    return flatData.map(row => {
      const structured: Record<string, any> = {};
      
      Object.entries(row).forEach(([key, value]) => {
        const [section, field] = key.split('.');
        if (!structured[section]) {
          structured[section] = {};
        }
        structured[section][field] = value;
      });
  
      console.log('Structured data:', structured);
      return structured;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Programs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Upload CSV or Excel file following the template format
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {previewData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Preview</h3>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                <pre className="text-sm">
                  {JSON.stringify(previewData[0], null, 2)}
                </pre>
              </div>
              <p className="text-sm text-muted-foreground">
                {previewData.length} records found
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!previewData.length || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload {previewData.length} Programs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
