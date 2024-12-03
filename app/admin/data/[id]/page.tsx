'use client';

import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import parse from 'html-react-parser';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
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
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDataPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch(`/api/data/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        const data = await response.json();
        setDoc(data);
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-48">
          Loading...
        </div>
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
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading={doc.title}
          text="Document Details"
        />
        <Button onClick={() => router.push("/admin/data")}>
          Back
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Basic details about the document</CardDescription>
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
                    <Badge key={index} variant="outline">{keyword}</Badge>
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
                    {format(new Date(doc.createdAt), 'PPpp')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">
                    {format(new Date(doc.updatedAt), 'PPpp')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default AdminDataPage;
