import React from 'react';
import { Process, SimulationResult } from '@/lib/simulator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsTableProps {
  processes: Process[];
  result: SimulationResult;
}

export const StatsTable: React.FC<StatsTableProps> = ({ processes, result }) => {
  if (processes.length === 0) return null;

  return (
    <Card className="shadow-2xl border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-3 border-b border-border/50">
        <CardTitle className="text-xl font-black flex items-center gap-2">
          <div className="w-2 h-6 bg-accent rounded-full animate-pulse" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2 border-muted">
              <TableHead className="w-[120px] font-bold text-primary">PROCESS</TableHead>
              <TableHead className="text-right font-bold">ARRIVAL</TableHead>
              <TableHead className="text-right font-bold">BURST</TableHead>
              <TableHead className="text-right border-l font-bold bg-muted/20">FINISH</TableHead>
              <TableHead className="text-right font-black text-blue-600 dark:text-blue-400 bg-blue-500/5">TAT</TableHead>
              <TableHead className="text-right font-black text-purple-600 dark:text-purple-400 bg-purple-500/5">WT</TableHead>
              <TableHead className="text-right font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">RT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map(p => {
              const metrics = result.metrics[p.id] || { completionTime: 0, turnaroundTime: 0, waitingTime: 0, responseTime: 0 };
              return (
                <TableRow key={p.id} className="hover:bg-accent/5 transition-colors group">
                  <TableCell className="font-black text-lg group-hover:scale-110 transition-transform origin-left">{p.name}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{p.arrivalTime}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{p.burstTime}</TableCell>
                  <TableCell className="text-right font-mono border-l bg-muted/5">{metrics.completionTime}</TableCell>
                  <TableCell className="text-right font-mono font-black text-blue-600/80">{metrics.turnaroundTime}</TableCell>
                  <TableCell className="text-right font-mono font-black text-purple-600/80">{metrics.waitingTime}</TableCell>
                  <TableCell className="text-right font-mono font-black text-emerald-600/80">{metrics.responseTime}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-primary/5 hover:bg-primary/5 border-t-2 border-primary/20">
              <TableCell colSpan={4} className="text-right font-black text-primary uppercase tracking-widest">Global Averages</TableCell>
              <TableCell className="text-right font-mono font-black text-xl text-blue-600 underline decoration-2 underline-offset-4">
                {result.averages.turnaroundTime.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono font-black text-xl text-purple-600 underline decoration-2 underline-offset-4">
                {result.averages.waitingTime.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono font-black text-xl text-emerald-600 underline decoration-2 underline-offset-4">
                {result.averages.responseTime.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
