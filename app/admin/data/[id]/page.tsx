"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import parse from "html-react-parser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentCategoryEnum } from "@/types/data";
import { documentFormSchema, type DocumentFormData } from "@/types/form";
import dynamic from "next/dynamic";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Import TipTap editor dynamically to avoid SSR issues
const Tiptap = dynamic(() => import("@/components/ui/tiptap"), {
  ssr: false,
});
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, use } from "react";
import { format } from "date-fns";

interface DocumentData {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  slug: string;
  description?: string;
  keywords: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminDataPage = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  console.log(form.formState.errors);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch(`/api/data/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch document");
        const data = await response.json();
        setDoc(data);
        // Set form values when document is loaded
        form.reset({
          ...data,
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
        });
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [params.id]);

  const onSubmit = async (data: CustomData) => {
    console.log(data);
    try {
      const response = await fetch(`/api/data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: params.id,
          ...data,
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");

      setDoc({ ...doc, ...data } as DocumentData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-48">Loading...</div>
      </DashboardShell>
    );
  }

  if (!doc) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-48">
          Document not found
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <>
        <div className="flex justify-between items-center mb-4">
          <DashboardHeader heading={doc.title} text="Document Details" />
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button onClick={() => router.push("/admin/data")}>Back</Button>
          </div>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
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
                              {category
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                        <Input
                          placeholder="enter-url-friendly-slug"
                          {...field}
                        />
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
                        <Input
                          placeholder="Enter short description"
                          {...field}
                        />
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
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const keywords = e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean);
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
                      <FormLabel>Published</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Document</Button>
              </form>
            </Form>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
                <CardDescription>
                  Basic details about the document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <Badge variant={doc.isPublished ? "default" : "secondary"}>
                      {doc.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{doc.category}</span>
                  </div>
                  {doc.subcategory && (
                    <div>
                      <span className="font-medium">Subcategory:</span>
                      <span className="ml-2">{doc.subcategory}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Slug:</span>
                    <span className="ml-2">{doc.slug}</span>
                  </div>
                  {doc.description && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1">{doc.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Keywords:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doc.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Content:</span>
                    <div className="mt-2 p-4 bg-muted rounded-lg prose max-w-none">
                      {parse(doc.content)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">
                        {format(new Date(doc.createdAt), "PPpp")}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">
                        {format(new Date(doc.updatedAt), "PPpp")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    </DashboardShell>
  );
};

export default AdminDataPage;
