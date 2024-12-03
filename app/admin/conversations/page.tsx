"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ChatSession {
  id: string;
  studentId: string;
  communicationMode: string;
  category: string;
  startTime: string;
  endTime: string | null;
  summary: string | null;
  status: string;
  user?: {
    fullName: string;
    email: string;
  };
}

const AdminConversationsPage = () => {
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conversation => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      conversation.user?.fullName.toLowerCase().includes(searchTerm) ||
      conversation.summary?.toLowerCase().includes(searchTerm) ||
      conversation.category.toLowerCase().includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Students Conversations"
        text="View all conversations"
      />

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : filteredConversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No conversations found</TableCell>
                </TableRow>
              ) : (
                filteredConversations.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell className="font-medium">
                      {conversation.user?.fullName || 'Unknown'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {conversation.category.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="capitalize">
                      {conversation.communicationMode.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>{formatDate(conversation.startTime)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        conversation.status === 'active' ? 'bg-green-50 text-green-700' :
                        conversation.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {conversation.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {conversation.summary || 'No summary available'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/conversations/${conversation.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
};

export default AdminConversationsPage;
