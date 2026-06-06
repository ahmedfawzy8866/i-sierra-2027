import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, BrainCircuit, Users, Activity, Settings2, RefreshCw } from 'lucide-react';

export default function AgentControlCenter() {
  const agents = [
    {
      id: 'core-orchestrator',
      name: 'Orchestrator Agent (The Conductor)',
      role: 'Central Nervous System & Dispatcher',
      status: 'online',
      tasksHandled: 1542,
      lastActive: 'Just now',
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />
    },
    {
      id: 'memory-obedian',
      name: 'Obedian (Memory & Data Architect)',
      role: 'Persistent Knowledge & Context Keeper',
      status: 'online',
      tasksHandled: 8903,
      lastActive: '2 mins ago',
      icon: <Activity className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'leila-concierge',
      name: 'Leila (Lead Concierge)',
      role: 'Front-line User Interaction & Lead Qualifying',
      status: 'active',
      tasksHandled: 230,
      lastActive: 'Active in 3 conversations',
      icon: <Users className="h-6 w-6 text-pink-500" />
    },
    {
      id: 'system-sentinel',
      name: 'System Sentinel',
      role: 'Infrastructure & Reliability Watcher',
      status: 'monitoring',
      tasksHandled: 42,
      lastActive: 'Watching logs',
      icon: <Shield className="h-6 w-6 text-emerald-500" />
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Control Center</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manually intervene with autonomous agents across the Sierra Estates network.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition">
          <RefreshCw className="h-4 w-4" />
          Sync Agents
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {agent.name}
              </CardTitle>
              {agent.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{agent.tasksHandled}</div>
              <p className="text-xs text-muted-foreground mb-4">Operations handled</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium text-right max-w-[150px] truncate">{agent.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={agent.status === 'online' ? 'default' : 'secondary'} className="capitalize">
                    {agent.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Ping:</span>
                  <span className="font-medium">{agent.lastActive}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition">
                  <Settings2 className="h-3 w-3" />
                  Configure
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Memory Explorer (Obedian)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/50 p-4 font-mono text-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <span className="text-muted-foreground">Global Knowledge Graph</span>
                <Badge variant="outline">Connected</Badge>
              </div>
              <p className="text-green-500 mb-1">✓ System state synchronized</p>
              <p className="text-green-500 mb-1">✓ 1,245 user preferences indexed</p>
              <p className="text-green-500">✓ Vector cache warmed up</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Intervention Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No alerts requiring human override.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                The Orchestrator will escalate items here if an agent reaches its confidence threshold or requests permission for a destructive action.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
