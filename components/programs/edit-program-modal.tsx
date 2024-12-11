'use client'

import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from '@/components/ui/switch'
import { useForm } from "react-hook-form"
import { BuilderSchema, DefaultValueType } from '@/types/organization'

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

interface Program {
  id: string;
  organizationId: string;
  data: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditProgramModalProps {
  program: Program;
  schema: BuilderSchema;
  onSubmit: (programId: string, programData: any) => Promise<void>;
}

export function EditProgramModal({ program, schema, onSubmit }: EditProgramModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm();

  // Initialize form with program data
  useEffect(() => {
    if (program && open) {
      // Transform program data to match section structure
      const sectionData = schema.sections.reduce((acc, section) => {
        const sectionKey = section.name.toLowerCase().replace(/\s+/g, '_');
        const sectionFields = section.fields.reduce((fieldAcc, field) => ({
          ...fieldAcc,
          [field.name]: program.data[field.name]
        }), {});
        
        return {
          ...acc,
          [sectionKey]: sectionFields
        };
      }, {});
      
      form.reset(sectionData);
    }
  }, [program, open, form, schema]);

  const renderField = (
    field: SchemaField,
    path: string,
  ): React.ReactNode => {
    const fieldValue = form.watch(path);

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...form.register(path)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            step={path.includes('GPA') || path.includes('Score') ? '0.1' : '1'}
            {...form.register(path, {
              setValueAs: (v: string) => (v === "" ? null : parseFloat(v))
            })}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={fieldValue || false}
            onCheckedChange={(checked: boolean) => form.setValue(path, checked)}
          />
        );

      case 'enum':
        return (
          <Select
            value={fieldValue || ''}
            onValueChange={(value: string) => form.setValue(path, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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

      case 'array':
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
                const newValue = [...arrayValue, getDefaultValue(field.arrayType!)];
                form.setValue(path, newValue);
              }}
            >
              Add {field.label}
            </Button>
          </div>
        );

      case 'object':
        if (!field.fields) return null;
        return (
          <div className="space-y-4 border rounded-lg p-4">
            {Object.entries(field.fields).map(([fieldName, fieldSchema]) => (
              <div key={fieldName} className="space-y-2">
                <Label className="flex justify-between">
                  {fieldSchema.label}
                  {fieldSchema.required && <span className="text-red-500">*</span>}
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
            [key]: getDefaultValue(fieldSchema)
          }),
          {}
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Transform sectioned data back to flat structure
      const flatData = Object.entries(data).reduce((acc, [sectionKey, sectionData]) => ({
        ...acc,
        ...(sectionData as object)
      }), {});

      await onSubmit(program.id, flatData);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update program:', error);
    }
  };

  if (!schema) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Program Name<span className="text-red-500">*</span></Label>
            <Input
              {...form.register('name')}
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
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(
                      field,
                      `${section.name.toLowerCase().replace(/\s+/g, '_')}.${field.name}`
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Program</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
