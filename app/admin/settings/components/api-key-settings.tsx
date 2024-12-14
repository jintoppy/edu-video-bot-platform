"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Label } from "@/components/ui/label";
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<string>("");
  const [widgetOptions, setWidgetOptions] = useState({
    greeting: "👋 Need help choosing a program?",
    autoOpen: true,
    delay: 2000
  });

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
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedApiKey(key.key);
                        setExportDialogOpen(true);
                      }}
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteKey(key.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
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

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Export SDK Integration Code</DialogTitle>
            <DialogDescription>
              Configure the chat widget and get the integration code
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Input 
                  value={widgetOptions.greeting}
                  onChange={(e) => setWidgetOptions(prev => ({...prev, greeting: e.target.value}))}
                  placeholder="Enter greeting message"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delay (ms)</Label>
                <Input 
                  type="number"
                  value={widgetOptions.delay}
                  onChange={(e) => setWidgetOptions(prev => ({...prev, delay: parseInt(e.target.value)}))}
                  placeholder="Enter delay in milliseconds"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={widgetOptions.autoOpen}
                  onCheckedChange={(checked) => setWidgetOptions(prev => ({...prev, autoOpen: checked}))}
                />
                <Label>Auto Open Widget</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Integration Code</Label>
              <div className="relative">
                <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                  <code className="text-sm">{`<script src="http://localhost:3000/sdk/edubot.js"></script>

<script>
    const eduBot = new EduBot({
        apiKey: '${selectedApiKey}'
    });

    // to initialize as a chatwidget on the page
    eduBot.initWidget({
        greeting: "${widgetOptions.greeting}",
        autoOpen: ${widgetOptions.autoOpen},
        delay: ${widgetOptions.delay}
    });
</script>

<button onclick="eduBot.startChat()">Start Chat</button>`}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`<script src="http://localhost:3000/sdk/edubot.js"></script>

<script>
    const eduBot = new EduBot({
        apiKey: '${selectedApiKey}'
    });

    // to initialize as a chatwidget on the page
    eduBot.initWidget({
        greeting: "${widgetOptions.greeting}",
        autoOpen: ${widgetOptions.autoOpen},
        delay: ${widgetOptions.delay}
    });
</script>

<button onclick="eduBot.startChat()">Start Chat</button>`);
                    toast.success("Code copied to clipboard");
                  }}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
