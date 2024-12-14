import { z } from "zod";
import { documentCategoryEnum } from "./data";

export const documentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(documentCategoryEnum.options),
  subcategory: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  keywords: z.array(z.string()),
  isPublished: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;
