'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, BookOpen, BarChart2, ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
  trendValue: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        {trend === 'up' ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        )}
        <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
          {trendValue}%
        </span>
        <span className="ml-1">from last month</span>
      </div>
    </CardContent>
  </Card>
);

interface ActivityItem {
  time: string;
  text: string;
}

const RecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    { time: '2 hours ago', text: 'New program added: MS in Data Science' },
    { time: '5 hours ago', text: 'Student query pattern analysis completed' },
    { time: '1 day ago', text: 'System health check performed' },
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SystemMetric {
  name: string;
  value: string;
}

const SystemHealth: React.FC = () => {
  const metrics: SystemMetric[] = [
    { name: 'AI Model Performance', value: '98%' },
    { name: 'API Response Time', value: '145ms' },
    { name: 'Database Status', value: 'Healthy' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.name}</span>
              <span className="text-sm font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InviteCounselorDialog: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/counselors/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      
      setEmail('');
      setName('');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Counselor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Counselor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="counselor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader 
          heading="Admin Dashboard" 
          text="Overview of your system's performance and recent activities"
        />
        <InviteCounselorDialog />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Students"
          value="1,234"
          icon={Users}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Active Programs"
          value="89"
          icon={BookOpen}
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Daily Sessions"
          value="456"
          icon={Activity}
          trend="up"
          trendValue={15}
        />
        <StatCard
          title="Conversion Rate"
          value="24%"
          icon={BarChart2}
          trend="down"
          trendValue={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4">
        <RecentActivity />
        <SystemHealth />
      </div>
    </DashboardShell>
  );
};

export default AdminDashboard;
