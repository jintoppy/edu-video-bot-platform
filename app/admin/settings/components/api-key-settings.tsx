"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, CopyIcon, TrashIcon, PlusIcon } from "lucide-react";
import { createApiKey, deleteApiKey, getApiKeys } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const apiKeyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  allowedDomains: z.string().optional(),
  allowedIps: z.string().optional(),
  monthlyQuota: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export function ApiKeySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      allowedDomains: "",
      allowedIps: "",
      monthlyQuota: 0,
    },
  });

  useEffect(() => {
    // Fetch API keys on component mount
    const fetchApiKeys = async () => {
      try {
        const keys = await getApiKeys();
        setApiKeys(keys);
      } catch (error) {
        toast.error("Failed to fetch API keys");
      }
    };
    fetchApiKeys();
  }, []);

  async function onSubmit(data: ApiKeyFormValues) {
    setIsLoading(true);
    try {
      const formattedData = {
        ...data,
        allowedDomains: data.allowedDomains ? data.allowedDomains.split(",").map(d => d.trim()) : undefined,
        allowedIps: data.allowedIps ? data.allowedIps.split(",").map(ip => ip.trim()) : undefined,
      };

      const response = await createApiKey(formattedData);
      
      setApiKeys(prev => [response, ...prev]);
      
      toast.success(
        <div className="space-y-2">
          <p>API key created successfully</p>
          <p className="text-sm font-mono break-all">
            Key: {response.key}
          </p>
          <p className="text-xs text-muted-foreground">
            Make sure to copy this key now. You won&apos;t be able to see it again.
          </p>
        </div>
      );
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const deleteKey = async (keyId: string) => {
    try {
      await deleteApiKey(keyId);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">API Keys</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for accessing your organization&apos;s services.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My API Key" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowedDomains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Domains</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="example.com, subdomain.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of domains that can use this key (leave empty to allow all)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowedIps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed IPs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="192.168.1.1, 10.0.0.0/24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of IP addresses or CIDR ranges (leave empty to allow all)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyQuota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Quota</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of API calls allowed per month (leave empty for unlimited)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create API Key"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No API keys created yet.
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{key.name}</p>
                    <div className="flex items-center space-x-2">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {showKey[key.id] ? key.key : key.prefix}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showKey[key.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteKey(key.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                {(key.allowedDomains?.length > 0 || key.allowedIps?.length > 0 || key.monthlyQuota) && (
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    {key.allowedDomains?.length > 0 && (
                      <p>Domains: {key.allowedDomains.join(", ")}</p>
                    )}
                    {key.allowedIps?.length > 0 && (
                      <p>IPs: {key.allowedIps.join(", ")}</p>
                    )}
                    {key.monthlyQuota && (
                      <p>Monthly Quota: {key.monthlyQuota.toLocaleString()} calls</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
