'use client'

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIModelConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  responseSpeed: 'fast' | 'balanced' | 'precise';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const AIModelSettings: React.FC = () => {
  const [config, setConfig] = useState<AIModelConfig>({
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    responseSpeed: 'balanced'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Configuration</CardTitle>
        <CardDescription>Configure the AI model behavior and parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Model Selection</Label>
          <Select defaultValue={config.modelName}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="streamResponse">Stream Response</Label>
          <Switch id="streamResponse" />
        </div>
      </CardContent>
    </Card>
  );
};

const EmailTemplates: React.FC = () => {
  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Student Counseling',
      content: 'Welcome to our platform...'
    }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>Manage automated email templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map(template => (
          <div key={template.id} className="space-y-2">
            <Label>{template.name}</Label>
            <Input value={template.subject} className="mb-2" />
            <Textarea value={template.content} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const SystemPreferences: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>System Preferences</CardTitle>
      <CardDescription>Configure system-wide settings</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Email Notifications</Label>
        <Switch id="notifications" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="autoAssign">Auto-assign Counselors</Label>
        <Switch id="autoAssign" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Default Timezone</Label>
        <Select value="UTC">
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="EST">EST</SelectItem>
            <SelectItem value="PST">PST</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const SettingsDashboard: React.FC = () => {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="System Settings" 
        text="Manage your system configurations and preferences"
      />

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai">AI Model</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="preferences">System Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <div className="grid gap-4 md:grid-cols-2">
            <AIModelSettings />
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="grid gap-4">
            <EmailTemplates />
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid gap-4 md:grid-cols-2">
            <SystemPreferences />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
};

export default SettingsDashboard;
