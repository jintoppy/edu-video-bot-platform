'use client';

import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CustomData } from "@/types/data";
import { useEffect, useState } from "react";

async function getCustomData(): Promise<CustomData[]> {
  const response = await fetch("/api/data");
  if (!response.ok) throw new Error("Failed to fetch custom data");
  return response.json();
}

const AdminDataPage = () => {
  const [data, setData] = useState<CustomData[]>([]);

  useEffect(() => {
    getCustomData().then(response => {
        setData(response);
    })
  }, []);
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Custom Data"
          text="Manage your custom data entries"
        />
        <Button onClick={() => router.push("/admin/data/add")}>
          Add New Data
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  {item.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {item.subcategory && ` - ${item.subcategory}`}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.createdAt!).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.updatedAt!).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/data/${item.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
};

export default AdminDataPage;
