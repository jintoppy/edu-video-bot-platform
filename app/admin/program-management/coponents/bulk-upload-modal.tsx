"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { BuilderSchema } from "@/types/organization";

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

  const reset = () => {
    setError(null);
    setFile(null);
    setPreviewData([]);
  };

  const validateData = (data: any[]): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    data.forEach((record, index) => {
      const rowErrors: string[] = [];

      // Validate required name field
      if (!record.name) {
        rowErrors.push("Program name is required");
      }

      // Validate other fields based on schema
      schema.sections.forEach((section) => {
        const sectionKey = section.name.toLowerCase().replace(/\s+/g, "_");
        const sectionData = record.data?.[sectionKey];

        section.fields.forEach((field) => {
          const value = sectionData?.[field.name];

          // Check required fields
          if (field.required && !value && value !== 0) {
            rowErrors.push(
              `Missing required field "${field.label}" in section "${section.name}"`
            );
          }

          // Validate enum values
          if (field.type === "enum" && value && field.options) {
            if (!field.options.includes(value)) {
              rowErrors.push(
                `Invalid value "${value}" for field "${
                  field.label
                }" in section "${
                  section.name
                }". Allowed values: ${field.options.join(", ")}`
              );
            }
          }

          // Validate number values
          if (field.type === "number" && value) {
            if (isNaN(Number(value))) {
              rowErrors.push(
                `Invalid number value "${value}" for field "${field.label}" in section "${section.name}"`
              );
            }
          }

          // Validate array values
          if (field.type === "array" && value) {
            if (!Array.isArray(value)) {
              rowErrors.push(
                `Invalid array value for field "${field.label}" in section "${section.name}"`
              );
            }
          }

          // Validate object values
          if (field.type === "object" && value) {
            if (typeof value !== "object" || Array.isArray(value)) {
              rowErrors.push(
                `Invalid object value for field "${field.label}" in section "${section.name}"`
              );
            }
          }
        });
      });

      if (schema.eligibilityCriteria) {
        schema.eligibilityCriteria.fields.forEach((field) => {
          const fieldData = record.eligibility?.[field.name];

          // Validate value
          if (field.required && !fieldData?.value && fieldData?.value !== 0) {
            rowErrors.push(
              `Missing required eligibility value for "${field.label}"`
            );
          }

          // Validate operator
          if (fieldData?.operator) {
            const validOperators = [
              "equals",
              "greaterThan",
              "lessThan",
              "greaterThanOrEqual",
              "lessThanOrEqual",
              "in",
            ];
            if (!validOperators.includes(fieldData.operator)) {
              rowErrors.push(
                `Invalid operator "${fieldData.operator}" for eligibility field "${field.label}"`
              );
            }
          }

          // Type-specific validation for values
          if (fieldData?.value !== undefined) {
            switch (field.type) {
              case "number":
                if (isNaN(Number(fieldData.value))) {
                  rowErrors.push(
                    `Invalid number value for eligibility field "${field.label}"`
                  );
                }
                break;
              case "enum":
                if (
                  field.validation?.allowedValues &&
                  !field.validation.allowedValues.includes(fieldData.value)
                ) {
                  rowErrors.push(
                    `Invalid enum value for eligibility field "${field.label}"`
                  );
                }
                break;
            }
          }
        });
      }

      if (rowErrors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors: rowErrors,
        });
      }
    });

    return validationErrors;
  };

  const getFlattenedHeaders = () => {
    const headers: string[] = [];
    schema.sections.forEach((section) => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, "_");
      section.fields.forEach((field) => {
        headers.push(`${sectionKey}.${field.name}`);
      });
    });
    if (schema.eligibilityCriteria) {
      schema.eligibilityCriteria.fields.forEach((field) => {
        headers.push(`eligibility.${field.name}.value`);
        headers.push(`eligibility.${field.name}.operator`);
      });
    }
    return headers;
  };

  const createEmptyTemplateRow = () => {
    const row: Record<string, string> = {};
    getFlattenedHeaders().forEach((header) => {
      row[header] = "";
    });
    return row;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      setError("Please upload a CSV or Excel file");
      return;
    }

    setFile(file);
    setIsLoading(true);

    try {
      const flatData = await readFile(file);
      console.log("Flat data:", flatData);

      // Restructure the flat data into nested format
      const structuredData = restructureData(flatData);
      console.log("Structured data before validation:", structuredData);

      const validationErrors = validateData(structuredData);
      console.log(validationErrors);
      if (validationErrors.length > 0) {
        setError(`Validation errors:\n${validationErrors.join("\n")}`);
        return;
      }

      setPreviewData(structuredData);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        "Error reading file. Please ensure it matches the template format."
      );
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
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // Skip the description row (second row) by starting from index 2
          // Get the range of the sheet
          const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

          // Start from row 4 (index 3) onwards to skip headers, instructions, and header labels
          const startRow = 3; // Index 3 is the 4th row where actual data starts
          const lastRow = range.e.r;

          // Get headers from row 1 (index 0) which contains our column headers
          const headers = XLSX.utils.sheet_to_json(sheet, {
            range: 0, // First row contains our headers
            header: 1,
          })[0] as string[];

          // Only process if we have data rows after the template rows
          if (lastRow >= startRow) {
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
              range: {
                s: { r: startRow, c: 0 },
                e: { r: lastRow, c: range.e.c },
              },
              defval: "", // Default empty value for missing cells
              header: headers, // Use headers from the template file
            });

            // Map the data to match our expected structure
            const mappedData = jsonData.map((row: any) => {
              const mappedRow: Record<string, any> = {};
              Object.entries(row).forEach(([key, value]) => {
                // Skip empty cells
                if (value === "") return;
                mappedRow[key.trim()] = value;
              });
              return mappedRow;
            });

            console.log("Mapped data:", mappedData);
            resolve(mappedData);
          } else {
            resolve([]); // Return empty array if no data rows found
          }
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
      setError("Failed to upload programs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(schema);

  const downloadTemplate = () => {
    // Create template rows
    const templateRows = [];

    // Create headers array (we'll use this for structure but not push it)
    const headers: string[] = ["name"];
    schema.sections.forEach((section) => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, "_");
      section.fields.forEach((field) => {
        headers.push(`${sectionKey}.${field.name}`);
      });
    });
    if (schema.eligibilityCriteria) {
      schema.eligibilityCriteria.fields.forEach((field) => {
        headers.push(`eligibility.${field.name}`);
      });
    }

    // Add instructions row
    const instructionsRow: Record<string, string> = {};
    headers.forEach(header => {
      instructionsRow[header] = header === "name" 
        ? "Instructions: Fill in the program details below. Required fields are marked with (Required)"
        : "";
    });
    templateRows.push(instructionsRow);

    // Add header labels row (this will be our column headers)
    const headerLabels: Record<string, string> = {
      name: "Program Name (Required)",
    };
    schema.sections.forEach((section) => {
      const sectionKey = section.name.toLowerCase().replace(/\s+/g, "_");
      section.fields.forEach((field) => {
        const header = `${sectionKey}.${field.name}`;
        headerLabels[header] = `${field.label}${field.required ? " (Required)" : ""}`;
      });
    });
    if (schema.eligibilityCriteria) {
      schema.eligibilityCriteria.fields.forEach((field) => {
        const header = `eligibility.${field.name}`;
        headerLabels[header] = `${field.label} Value${
          field.required ? " (Required)" : ""
        } (${field.operator})`;
      });
    }
    templateRows.push(headerLabels);

    // Add example row with more meaningful examples
    const exampleRow = Object.keys(headers).reduce((acc, header) => {
      if (header === "name") {
        acc[header] = "Master of Business Administration";
      } else {
        const [section, field] = header.split(".");
        switch (field?.toLowerCase()) {
          case "duration":
            acc[header] = "2 years";
            break;
          case "tuition":
            acc[header] = "50000";
            break;
          case "location":
            acc[header] = "New York";
            break;
          default:
            acc[header] = `Example ${field}`;
        }
      }
      return acc;
    }, {} as Record<string, string>);

    if (schema.eligibilityCriteria) {
      schema.eligibilityCriteria.fields.forEach((field) => {
        exampleRow[`eligibility.${field.name}`] =
          field.type === "number" ? "75" : "Example Value";
      });
    }
    templateRows.push(exampleRow);

    console.log(templateRows);

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateRows);
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Add instructions sheet
    const instructionsData = [
      {
        "Column Header": "name",
        "Field Name": "Program Name",
        Required: "Yes",
        Type: "text",
        Description: "Name of the program (Required)",
      },
      ...schema.sections
        .map((section) => {
          const sectionKey = section.name.toLowerCase().replace(/\s+/g, "_");
          return section.fields.map((field) => ({
            "Column Header": `${sectionKey}.${field.name}`,
            "Field Name": field.label,
            Required: field.required ? "Yes" : "No",
            Type: field.type,
            Description: `Field for ${field.label}${
              field.required ? " (Required)" : ""
            }`,
          }));
        })
        .flat(),
      ...(schema.eligibilityCriteria?.fields.map((field) => {
        return {
          "Column Header": `eligibility.${field.name}`,
          "Field Name": `${field.label} Value`,
          Required: field.required ? "Yes" : "No",
          Type: field.type,
          Description: `Value for eligibility criteria "${field.label}. 
              Operator (${field.operator})
            "`,
        };
      }) ?? []),
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "program_template.xlsx");
  };

  const restructureData = (flatData: Record<string, any>[]) => {
    return flatData.map((row) => {
      const structured: Record<string, any> = {
        name: row.name,
        data: {},
        eligibility: {},
      };

      Object.entries(row).forEach(([key, value]) => {
        if (key === "name") return;

        const parts = key.split(".");
        if (parts[0] === "eligibility") {
          // Eligibility field
          const [, field, type] = parts;
          if (!structured.eligibility[field]) {
            structured.eligibility[field] = {};
          }
          structured.eligibility[field][type] = value;
        } else {
          // Regular section field
          const [section, field] = parts;
          if (!structured.data[section]) {
            structured.data[section] = {};
          }
          structured.data[section][field] = value;
        }
      });

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
                {error.split("\n").map((line, i) => (
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
              onClick={() => {
                reset();
                setOpen(false);
              }}
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
