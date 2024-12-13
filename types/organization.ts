// Define all possible field value types
type Primitive = string | number | boolean;
export type FieldValue =
  | Primitive
  | Primitive[]
  | { [key: string]: FieldValue };

// Schema field types
export type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "enum";

export interface SchemaField {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // For enum types
  fields?: Record<string, SchemaField>; // For object types
  arrayType?: SchemaField; // For array types
  label: string; // Adding label for display purposes
  section?: string; // To track which section this field belongs to
}

export interface OrganizationSchema {
  id: string;
  name: string;
  programSchema: BuilderSchema;
}

export type DefaultValueType<T extends SchemaField> = T extends { type: "text" }
  ? string
  : T extends { type: "number" }
  ? number
  : T extends { type: "boolean" }
  ? boolean
  : T extends { type: "enum" }
  ? string
  : T extends { type: "array" }
  ? Array<DefaultValueType<NonNullable<T["arrayType"]>>>
  : T extends { type: "object" }
  ? {
      [K in keyof NonNullable<T["fields"]>]: DefaultValueType<
        NonNullable<T["fields"]>[K]
      >;
    }
  : never;

// Helper type for inferring object shape
export type InferObjectShape<T extends Record<string, SchemaField>> = {
  [K in keyof T]: DefaultValueType<T[K]>;
};

export interface DBSchemaSection {
  name: string;
  fields: SchemaField[];
}

export interface SchemaSection extends DBSchemaSection {
  isExpanded: boolean;
}

export interface EligibilityField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
  operator?: 'equals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'in';
}



// Schema builder state interface
export interface BuilderSchema {
  sections: SchemaSection[];
  eligibilityCriteria?: {
    isExpanded: boolean;
    fields: EligibilityField[];
  };
}



// Schema builder props interface
export interface SchemaBuilderProps {
  organizationId: string;
  initialSchema: BuilderSchema;
}

export interface GetSchemaResponse {
  schema: BuilderSchema;
  orgId: string;
}