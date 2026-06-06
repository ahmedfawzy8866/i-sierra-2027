'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Calendar, Check, X, Send } from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([
    {
      id: 'L-1029',
      name: 'Michael Chen',
      budget: 850000,
      location: 'Downtown Hubtown',
      propertyType: 'Penthouse',
      roiTarget: 6.5,
      status: 'Requires Agent Approval',
      stage: 2,
      matchedUnits: [
        { id: 'U-01', title: 'Skyline Penthouse A', price: 820000, projectedRoi: 6.8, matchScore: 95, approved: false },
        { id: 'U-02', title: 'Luxury Loft B', price: 790000, projectedRoi: 7.1, matchScore: 88, approved: false }
      ]
    }
  ]);

  const toggleApproval = (leadId: string, unitId: string) => {
    setLeads(leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          matchedUnits: l.matchedUnits.map(u => 
            u.id === unitId ? { ...u, approved: !u.approved } : u
          )
        };
      }
      return l;
    }));
  };

  const scheduleViewing = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    const approvedUnits = lead.matchedUnits.filter(u => u.approved);
    if (approvedUnits.length === 0) {
      alert("Please approve at least one unit before scheduling.");
      return;
    }

    try {
      const res = await fetch('/api/admin/schedule-viewing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, units: approvedUnits })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Viewing scheduled successfully! Telegram and Google Calendar notifications sent.");
        setLeads(leads.map(l => l.id === leadId ? { ...l, stage: 3, status: 'Scheduled' } : l));
      } else {
        alert("Failed to schedule: " + data.error);
      }
    } catch (e) {
      alert("Error scheduling viewing.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Handoff Queue</h1>
        <p className="text-muted-foreground mt-2">
          Review units matched by Leila AI and approve them for client viewing.
        </p>
      </div>

      <div className="grid gap-6">
        {leads.map(lead => (
          <Card key={lead.id} className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {lead.name}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Stage {lead.stage}</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Budget: ${lead.budget.toLocaleString()} • {lead.location} • {lead.propertyType} • ROI: {lead.roiTarget}%+
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={lead.status === 'Scheduled' ? 'default' : 'outline'} className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  {lead.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <h3 className="font-medium text-sm text-muted-foreground mb-4">Leila's Top Matches</h3>
              <div className="space-y-3">
                {lead.matchedUnits.map(unit => (
                  <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition">
                    <div>
                      <div className="font-medium">{unit.title}</div>
                      <div className="text-sm text-muted-foreground">
                        ${unit.price.toLocaleString()} • Expected ROI: {unit.projectedRoi}% • Match: {unit.matchScore}%
                      </div>
                    </div>
                    {lead.stage === 2 && (
                      <button 
                        onClick={() => toggleApproval(lead.id, unit.id)}
                        className={`p-2 rounded-full border transition ${unit.approved ? 'bg-green-100 border-green-500 text-green-600' : 'bg-background hover:bg-muted'}`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {lead.stage === 2 && (
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => scheduleViewing(lead.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition"
                  >
                    <Calendar className="h-4 w-4" />
                    Approve & Schedule Viewing
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
