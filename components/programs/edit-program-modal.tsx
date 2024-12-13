"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { BuilderSchema, DefaultValueType } from "@/types/organization";
import { Program } from "@/types/programs";

interface SchemaField {
  type: "text" | "number" | "boolean" | "array" | "object" | "enum";
  required?: boolean;
  options?: string[];
  fields?: Record<string, SchemaField>;
  arrayType?: SchemaField;
  label: string;
}

interface OrganizationSchema {
  id: string;
  name: string;
  programSchema: Record<string, SchemaField>;
}

interface ProgramFormData {
  name: string;
  eligibility?: Record<string, {
    value: any;
    operator: string;
  }>;
  [key: string]: any; // This allows dynamic section keys
}

interface EditProgramModalProps {
  program: Program;
  schema: BuilderSchema;
  onSubmit: (programId: string, programData: any) => Promise<void>;
}

export function EditProgramModal({
  program,
  schema,
  onSubmit,
}: EditProgramModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<ProgramFormData>({
    defaultValues: {
      name: '',
    }
  });

  // Initialize form with program data
  useEffect(() => {
    if (program && open) {
      // Initialize with program name
      const formData: any = {
        name: program.name,
        ...Object.fromEntries(
          schema.sections.map(section => [
            section.name.toLowerCase().replace(/\s+/g, '_'),
            {}
          ])
        )
      };

      // Transform program data to match section structure
      schema.sections.forEach(section => {
        const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
        
        // Get existing section data or create empty object
        const sectionData = program.data[sectionKey] || {};
        
        // Fill in fields
        section.fields.forEach(field => {
          const existingValue = sectionData[field.name];
          formData[sectionKey][field.name] = existingValue ?? getDefaultValue(field);
        });
      });

      if (schema.eligibilityCriteria) {
        formData.eligibility = {};
        const existingEligibility = program.eligibility || {};
  
        schema.eligibilityCriteria.fields.forEach(field => {
          formData.eligibility[field.name] = {
            value: existingEligibility[field.name]?.value ?? getDefaultValue(field),
            operator: existingEligibility[field.name]?.operator ?? field.operator ?? 'equals'
          };
        });
      }

      form.reset(formData);
    }
  }, [program?.id, open]);

  const renderField = (field: SchemaField, path: string): React.ReactNode => {
    const fieldValue = form.watch(path);

    switch (field.type) {
      case "text":
        return (
          <Input
            {...form.register(path)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            step={path.includes("GPA") || path.includes("Score") ? "0.1" : "1"}
            {...form.register(path, {
              setValueAs: (v: string) => (v === "" ? null : parseFloat(v)),
            })}
          />
        );

      case "boolean":
        return (
          <Switch
            checked={fieldValue || false}
            onCheckedChange={(checked: boolean) => form.setValue(path, checked)}
          />
        );

      case "enum":
        return (
          <Select
            value={fieldValue || ""}
            onValueChange={(value: string) => form.setValue(path, value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "array":
        if (!field.arrayType) return null;
        const arrayValue = (fieldValue || []) as unknown[];
        return (
          <div className="space-y-2">
            {arrayValue.map((_, index) => (
              <div key={index} className="flex gap-2">
                {renderField(field.arrayType!, `${path}.${index}`)}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newValue = [...arrayValue];
                    newValue.splice(index, 1);
                    form.setValue(path, newValue);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newValue = [
                  ...arrayValue,
                  getDefaultValue(field.arrayType!),
                ];
                form.setValue(path, newValue);
              }}
            >
              Add {field.label}
            </Button>
          </div>
        );

      case "object":
        if (!field.fields) return null;
        return (
          <div className="space-y-4 border rounded-lg p-4">
            {Object.entries(field.fields).map(([fieldName, fieldSchema]) => (
              <div key={fieldName} className="space-y-2">
                <Label className="flex justify-between">
                  {fieldSchema.label}
                  {fieldSchema.required && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                {renderField(fieldSchema, `${path}.${fieldName}`)}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const getDefaultValue = (field: SchemaField): any => {
    switch (field.type) {
      case "text":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
      case "enum":
        return field.options?.[0] || "";
      case "array":
        return [];
      case "object":
        if (!field.fields) return {};
        return Object.entries(field.fields).reduce(
          (acc, [key, fieldSchema]) => ({
            ...acc,
            [key]: getDefaultValue(fieldSchema),
          }),
          {}
        );
      default:
        return null;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      // Extract name from form data
      const { name, eligibility, ...sectionData } = formData;

      const transformedEligibility = eligibility
        ? Object.entries(eligibility).reduce(
            (acc, [key, value]: [string, any]) => ({
              ...acc,
              [key]: {
                value: value.value,
                operator: value.operator,
              },
            }),
            {}
          )
        : undefined;

      // Create properly structured program data
      const programData = {
        name,
        data: sectionData,
        ...(transformedEligibility && { eligibility: transformedEligibility }),
      };

      await onSubmit(program.id, programData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update program:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>
              Program Name<span className="text-red-500">*</span>
            </Label>
            <Input
              {...form.register("name")}
              defaultValue={program.name}
              placeholder="Enter program name"
              required
            />
          </div>
          {schema.sections.map((section) => (
            <div key={section.name} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.name}</h3>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="flex justify-between">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    {renderField(
                      field,
                      `${section.name.toLowerCase().replace(/\s+/g, "_")}.${
                        field.name
                      }`
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {schema.eligibilityCriteria && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
              <div className="space-y-4">
                {schema.eligibilityCriteria.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="flex justify-between">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <Select
                          value={
                            form.watch(`eligibility.${field.name}.operator`) ||
                            field.operator
                          }
                          onValueChange={(value) =>
                            form.setValue(
                              `eligibility.${field.name}.operator`,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="greaterThan">
                              Greater Than
                            </SelectItem>
                            <SelectItem value="lessThan">Less Than</SelectItem>
                            <SelectItem value="greaterThanOrEqual">
                              Greater Than or Equal
                            </SelectItem>
                            <SelectItem value="lessThanOrEqual">
                              Less Than or Equal
                            </SelectItem>
                            <SelectItem value="in">In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        {renderField(field, `eligibility.${field.name}.value`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Program"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
