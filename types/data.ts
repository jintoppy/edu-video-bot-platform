import { z } from "zod";

export const documentCategoryEnum = z.enum([
  'faq',
  'visa_information',
  'application_guide',
  'program_information',
  'country_guide',
  'financial_information',
  'test_preparation',
  'general'
]);

export const customDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: documentCategoryEnum,
  subcategory: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CustomData = z.infer<typeof customDataSchema>;
