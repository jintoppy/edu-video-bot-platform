'use client';

import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentCategoryEnum } from "@/types/data";
import { documentFormSchema, type DocumentFormData } from "@/types/form";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";

// Import TipTap editor dynamically to avoid SSR issues
const Tiptap = dynamic(() => import("@/components/ui/tiptap"), {
  ssr: false,
});

const AdminAddDataPage = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      subcategory: "",
      slug: "",
      description: "",
      keywords: [],
      isPublished: false,
      metadata: {},
    },
  });

  const onSubmit = async (data: DocumentFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add custom data");

      router.push("/admin/data");
      router.refresh();
      toast({
        title: "Success",
        description: "Document added successfully",
      });
    } catch (error) {
      console.error("Error adding custom data:", error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Add Custom Data"
          text="Add new custom data with rich text formatting"
        />
        <Button variant="outline" onClick={() => router.push("/admin/data")}>
          Cancel
        </Button>
      </div>
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="w-full p-2 border rounded-md"
                      {...field}
                    >
                      {documentCategoryEnum.options.map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subcategory" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="enter-url-friendly-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter short description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="keyword1, keyword2, keyword3" 
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                        field.onChange(keywords);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Tiptap 
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Publish immediately</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Custom Data"}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardShell>
  );
};

export default AdminAddDataPage;
