import React, { useState, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Process, Algorithm, simulate } from '@/lib/simulator';
import { GanttChart } from '@/components/GanttChart';
import { StatsTable } from '@/components/StatsTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Play, 
  Settings2, 
  Sparkles, 
  Wand2,
  Save
} from 'lucide-react';
import { useCreateScenario } from '@/hooks/use-scenarios';
import { useToast } from '@/hooks/use-toast';
import { Scenario } from '@shared/schema';

// Helper to generate a short ID
const genId = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export default function Dashboard() {
  const { toast } = useToast();
  const createMutation = useCreateScenario();

  // State
  const [processes, setProcesses] = useState<Process[]>([
    { id: genId(), name: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: genId(), name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: genId(), name: 'P3', arrivalTime: 2, burstTime: 8, priority: 3 },
  ]);
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS');
  const [quantum, setQuantum] = useState<number>(2);

  // Form State
  const [newProc, setNewProc] = useState({
    name: 'P4',
    arrival: 0,
    burst: 1,
    priority: 1
  });

  // Derived Simulation
  const result = useMemo(() => {
    return simulate(processes, algorithm, quantum);
  }, [processes, algorithm, quantum]);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProc.name.trim() === '' || newProc.burst <= 0 || newProc.arrival < 0) {
      toast({ title: "Invalid Input", description: "Please enter valid process data.", variant: "destructive" });
      return;
    }
    
    setProcesses(prev => [...prev, {
      id: genId(),
      name: newProc.name.trim(),
      arrivalTime: newProc.arrival,
      burstTime: newProc.burst,
      priority: newProc.priority
    }]);

    // Auto increment name
    const match = newProc.name.match(/P(\d+)/);
    const nextNum = match ? parseInt(match[1]) + 1 : processes.length + 2;
    setNewProc(prev => ({ ...prev, name: `P${nextNum}` }));
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setAlgorithm(scenario.algorithm as Algorithm);
    if (scenario.quantum) setQuantum(scenario.quantum);
    
    // Type assertion because JSONB returns generic JSON value
    const loadedProcesses = (scenario.processes as any[]).map(p => ({
      id: p.id || genId(),
      name: p.name || 'P',
      arrivalTime: Number(p.arrivalTime) || 0,
      burstTime: Number(p.burstTime) || 1,
      priority: Number(p.priority) || 1
    }));
    
    setProcesses(loadedProcesses);
    
    // Update next name based on length
    setNewProc(prev => ({ ...prev, name: `P${loadedProcesses.length + 1}` }));
    
    toast({
      title: "Scenario Loaded",
      description: `Loaded ${scenario.name}`
    });
  };

  const handleSaveCurrent = () => {
    if (processes.length === 0) {
      toast({ title: "Cannot Save", description: "Add some processes first.", variant: "destructive" });
      return;
    }

    const name = `${algorithm} Scenario - ${processes.length} procs`;
    
    createMutation.mutate({
      name,
      description: `Saved config for ${algorithm}`,
      algorithm,
      quantum: algorithm === 'RR' ? quantum : null,
      processes: processes as any
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Scenario saved to sidebar." });
      }
    });
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar onLoadScenario={handleLoadScenario} onSaveCurrent={handleSaveCurrent} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="flex-none h-16 border-b border-border flex items-center justify-between px-6 bg-gradient-to-r from-background to-muted/30 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg rotate-3">C</div>
                <h1 className="font-black text-2xl tracking-tighter italic">CoreSched <span className="text-accent not-italic">Visualizer</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Status</span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  OPTIMIZED
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveCurrent} className="hover-elevate font-bold gap-2 border-2">
                <Save className="w-3 h-3 fill-current" /> Save Config
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
            
            {/* Top Config Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Algorithm Config */}
              <Card className="shadow-sm border-border lg:col-span-1 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    Algorithm Options
                  </CardTitle>
                  <CardDescription>Select scheduling strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label>Scheduling Algorithm</Label>
                    <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
                      <SelectTrigger className="w-full font-medium">
                        <SelectValue placeholder="Select Algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCFS">First Come First Serve (FCFS)</SelectItem>
                        <SelectItem value="SJF_NP">Shortest Job First (Non-Preemptive)</SelectItem>
                        <SelectItem value="SJF_P">Shortest Remaining Time First (SRTF)</SelectItem>
                        <SelectItem value="PRIORITY_NP">Priority (Non-Preemptive)</SelectItem>
                        <SelectItem value="PRIORITY_P">Priority (Preemptive)</SelectItem>
                        <SelectItem value="RR">Round Robin (RR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <AnimatePresence>
                    {algorithm === 'RR' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2 overflow-hidden"
                      >
                        <Label>Time Quantum</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={quantum} 
                          onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                          className="font-mono"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Add Process Form */}
              <Card className="shadow-sm border-border lg:col-span-2 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-accent" />
                    Add Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProcess} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input 
                          value={newProc.name} 
                          onChange={e => setNewProc(prev => ({...prev, name: e.target.value}))}
                          className="font-mono h-9"
                          placeholder="P1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Arrival Time</Label>
                        <Input 
                          type="number" min="0" 
                          value={newProc.arrival} 
                          onChange={e => setNewProc(prev => ({...prev, arrival: parseInt(e.target.value) || 0}))}
                          className="font-mono h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Burst Time</Label>
                        <Input 
                          type="number" min="1" 
                          value={newProc.burst} 
                          onChange={e => setNewProc(prev => ({...prev, burst: parseInt(e.target.value) || 1}))}
                          className="font-mono h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Priority <span className="text-[10px]">(Lower=Higher)</span></Label>
                        <Input 
                          type="number" min="1" 
                          value={newProc.priority} 
                          onChange={e => setNewProc(prev => ({...prev, priority: parseInt(e.target.value) || 1}))}
                          disabled={!algorithm.includes('PRIORITY')}
                          className="font-mono h-9 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full sm:w-auto h-9 hover-elevate shrink-0 gap-1 px-6">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Current Processes Table */}
            <Card className="shadow-sm border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Process ID</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Burst Time</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No processes. Add some above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      processes.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-semibold">{p.name}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{p.arrivalTime}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{p.burstTime}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {algorithm.includes('PRIORITY') ? p.priority : '-'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveProcess(p.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Visualization */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Mission Control: Execution
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-accent/10 text-accent border-accent/20 animate-bounce">
                    Active Simulation 🚀
                  </Badge>
                </div>
              </div>
              
              <GanttChart blocks={result.blocks} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg. Turnaround</div>
                    <div className="text-3xl font-black">{result.averages.turnaroundTime.toFixed(2)}ms</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg. Waiting</div>
                    <div className="text-3xl font-black">{result.averages.waitingTime.toFixed(2)}ms</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/50">
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Avg. Response</div>
                    <div className="text-3xl font-black">{result.averages.responseTime.toFixed(2)}ms</div>
                  </CardContent>
                </Card>
              </div>

              <StatsTable processes={processes} result={result} />
            </div>

          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
