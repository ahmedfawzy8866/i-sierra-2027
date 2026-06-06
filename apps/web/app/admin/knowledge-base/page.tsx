'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Search, FileText, Loader2 } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/knowledge-base')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            View the rules, memory, and logic imported from the Obsidian Vault that guides AI behavior.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <span className="font-mono text-sm">{notes.length} Active Nodes</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to sync with Obsidian Vault: {error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => (
            <Card key={note.id} className="border-border hover:border-primary/50 transition cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-medium truncate" title={note.title}>
                  {note.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {(!note.tags || note.tags.length === 0) && (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Priority: {note.metadata?.priority || 'normal'}</span>
                  <span>{new Date(note.lastModified).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
              No markdown files found in the specified Obsidian Vault.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
