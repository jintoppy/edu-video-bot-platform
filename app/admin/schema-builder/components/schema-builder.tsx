"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, ChevronDown, ChevronRight, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { saveOrganizationSchema } from "@/app/actions/organizations";
import {
  BuilderSchema,
  EligibilityField,
  FieldType,
  SchemaBuilderProps,
} from "@/types/organization";

const SchemaBuilder = ({
  organizationId,
  initialSchema,
}: SchemaBuilderProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [schema, setSchema] = useState<BuilderSchema>({
    sections: initialSchema.sections,
    eligibilityCriteria: initialSchema.eligibilityCriteria,
  });

  const addSection = () => {
    setSchema((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          name: "New Section",
          isExpanded: true,
          fields: [],
        },
      ],
    }));
  };

  useEffect(() => {
    setSchema(initialSchema);
  }, [initialSchema]);

  const addEligibilityField = () => {
    if (!schema.eligibilityCriteria) return;

    setSchema((prev) => ({
      ...prev,
      eligibilityCriteria: {
        isExpanded: prev.eligibilityCriteria?.isExpanded || false,
        fields: [
          ...(prev.eligibilityCriteria?.fields ?? []),
          {
            name: "newEligibilityField",
            label: "New Eligibility Field",
            type: "number",
            required: true,
            operator: "greaterThanOrEqual",
          },
        ],
      },
    }));
  };

  const updateEligibilityField = (
    fieldIndex: number,
    updates: Partial<EligibilityField>
  ) => {
    if (!schema.eligibilityCriteria) return;

    setSchema((prev) => ({
      ...prev,
      eligibilityCriteria: {
        isExpanded: prev.eligibilityCriteria?.isExpanded || false,
        fields: prev.eligibilityCriteria ? prev.eligibilityCriteria.fields.map((field, index) =>
          index === fieldIndex ? { ...field, ...updates } : field
        ) : [],
      },
    }));
  };

  const removeEligibilityField = (fieldIndex: number) => {
    if (!schema.eligibilityCriteria) return;

    setSchema((prev) => ({
      ...prev,
      eligibilityCriteria: {
        isExpanded: prev.eligibilityCriteria?.isExpanded || false,
        fields: prev.eligibilityCriteria ? prev.eligibilityCriteria.fields.filter(
          (_, index) => index !== fieldIndex
        ): [],
      },
    }));
  };

  const toggleEligibilitySection = () => {
    if (!schema.eligibilityCriteria) return;

    setSchema((prev) => ({
      ...prev,
      eligibilityCriteria: {
        isExpanded: !prev.eligibilityCriteria?.isExpanded,
        fields: prev.eligibilityCriteria?.fields ?? [],
      },
    }));
  };

  // Add eligibility section
  const addEligibilityCriteria = () => {
    setSchema((prev) => ({
      ...prev,
      eligibilityCriteria: {
        isExpanded: true,
        fields: [],
      },
    }));
  };

  const addField = (sectionIndex: number) => {
    const newSections = [...schema.sections];
    newSections[sectionIndex].fields.push({
      name: "newField",
      label: "New Field",
      type: "text",
      required: false,
    });
    setSchema({ ...schema, sections: newSections });
  };

  const updateSectionName = (sectionIndex: number, newName: string) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, name: newName } : section
      ),
    }));
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.filter(
                (_, fIndex) => fIndex !== fieldIndex
              ),
            }
          : section
      ),
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const toggleSection = (sectionIndex: number) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      ),
    }));
  };

  const updateFieldRequired = (
    sectionIndex: number,
    fieldIndex: number,
    required: boolean
  ) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, fIndex) =>
                fIndex === fieldIndex ? { ...field, required } : field
              ),
            }
          : section
      ),
    }));
  };

  const updateFieldLabel = (
    sectionIndex: number,
    fieldIndex: number,
    newLabel: string
  ) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, fIndex) =>
                fIndex === fieldIndex ? { ...field, label: newLabel } : field
              ),
            }
          : section
      ),
    }));
  };

  const sanitizeFieldName = (name: string) => {
    // Remove spaces and special characters, convert to camelCase
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+(.)/g, (match, group1) => group1.toUpperCase())
      .replace(/\s/g, "");
  };

  const updateFieldName = (
    sectionIndex: number,
    fieldIndex: number,
    newName: string
  ) => {
    const sanitizedName = sanitizeFieldName(newName);
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, fIndex) =>
                fIndex === fieldIndex
                  ? { ...field, name: sanitizedName }
                  : field
              ),
            }
          : section
      ),
    }));
  };

  const updateFieldType = (
    sectionIndex: number,
    fieldIndex: number,
    newType: FieldType
  ) => {
    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, fIndex) =>
                fIndex === fieldIndex
                  ? {
                      ...field,
                      type: newType,
                      options: newType === "enum" ? [] : undefined,
                      fields: newType === "object" ? {} : undefined,
                      arrayType: newType === "array" ? undefined : undefined,
                    }
                  : field
              ),
            }
          : section
      ),
    }));
  };

  const handleSave = async () => {
    try {
      if (!organizationId) {
        return;
      }
      setIsSaving(true);

      // Validate schema before saving
      const hasEmptyFields = schema.sections.some(
        (section) =>
          !section.name ||
          section.fields.some(
            (field) => !field.name || !field.label || !field.type
          )
      );

      const hasEmptyEligibilityFields = schema.eligibilityCriteria?.fields.some(
        (field) => !field.name || !field.label || !field.type
      );

      if (
        hasEmptyFields ||
        (schema.eligibilityCriteria && hasEmptyEligibilityFields)
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all field names, labels, and types.",
          variant: "destructive",
        });
        return;
      }

      // Save schema
      await saveOrganizationSchema({
        organizationId: organizationId,
        schema,
      });

      toast({
        title: "Success",
        description: "Schema saved successfully.",
      });
    } catch (error) {
      console.error("Error saving schema:", error);
      toast({
        title: "Error",
        description: "Failed to save schema. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Program Schema Builder"
        text="Define how programs should be structured in your organization"
      >
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Schema"}
        </Button>
      </DashboardHeader>

      <div className="space-y-6">
        {schema.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {section.isExpanded ? <ChevronDown /> : <ChevronRight />}
                </button>
                <Input
                  value={section.name}
                  onChange={(e) =>
                    updateSectionName(sectionIndex, e.target.value)
                  }
                  className="font-semibold"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSection(sectionIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {section.isExpanded && (
              <div className="space-y-4 ml-6">
                {section.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateFieldLabel(
                          sectionIndex,
                          fieldIndex,
                          e.target.value
                        )
                      }
                      placeholder="Field Label"
                    />
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateFieldName(
                          sectionIndex,
                          fieldIndex,
                          e.target.value
                        )
                      }
                      placeholder="Field Name"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateFieldType(
                          sectionIndex,
                          fieldIndex,
                          value as FieldType
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Field Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="enum">Enum</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateFieldRequired(
                              sectionIndex,
                              fieldIndex,
                              e.target.checked
                            )
                          }
                        />
                        Required
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(sectionIndex, fieldIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addField(sectionIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" onClick={addSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>

        {/* Optional Add Eligibility button if not present */}
        {!schema.eligibilityCriteria && (
          <Button variant="outline" onClick={addEligibilityCriteria}>
            <Plus className="h-4 w-4 mr-2" />
            Add Eligibility Criteria
          </Button>
        )}

        {/* Eligibility Criteria Section */}
        {schema.eligibilityCriteria && (
          <div className="border rounded-lg p-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleEligibilitySection}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {schema.eligibilityCriteria?.isExpanded ? (
                    <ChevronDown />
                  ) : (
                    <ChevronRight />
                  )}
                </button>
                <h3 className="font-semibold">Eligibility Criteria</h3>
              </div>
            </div>

            {schema.eligibilityCriteria?.isExpanded && (
              <div className="space-y-4 ml-6">
                {schema.eligibilityCriteria.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="grid grid-cols-5 gap-4 items-center"
                  >
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateEligibilityField(fieldIndex, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Field Label"
                    />
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateEligibilityField(fieldIndex, {
                          name: sanitizeFieldName(e.target.value),
                        })
                      }
                      placeholder="Field Name"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateEligibilityField(fieldIndex, {
                          type: value as FieldType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Field Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="enum">Enum</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={field.operator}
                      onValueChange={(value) =>
                        updateEligibilityField(fieldIndex, {
                          operator: value as EligibilityField["operator"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEligibilityField(fieldIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEligibilityField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Eligibility Field
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Preview</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      </div>
    </DashboardShell>
  );
};

export default SchemaBuilder;
