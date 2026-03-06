import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader
} from '@/components/ui/sidebar';
import { useScenarios, useDeleteScenario } from '@/hooks/use-scenarios';
import { Clock, Cpu, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scenario } from '@shared/schema';

interface AppSidebarProps {
  onLoadScenario: (scenario: Scenario) => void;
  onSaveCurrent: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onLoadScenario, onSaveCurrent }) => {
  const { data: scenarios, isLoading } = useScenarios();
  const deleteMutation = useDeleteScenario();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null)
    });
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b border-border bg-sidebar">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
          <Cpu className="w-5 h-5" />
        </div>
        <h2 className="font-bold text-lg tracking-tight">CoreSched</h2>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-4 border-b border-border/50">
          <Button 
            onClick={onSaveCurrent} 
            className="w-full gap-2 font-medium hover-elevate shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Current State
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Saved Scenarios
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            {isLoading ? (
              <div className="p-4 flex justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !scenarios || scenarios.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No saved scenarios yet. Build one and click save!
              </div>
            ) : (
              <SidebarMenu>
                {scenarios.map((scenario) => (
                  <SidebarMenuItem key={scenario.id}>
                      <div
                        onClick={() => onLoadScenario(scenario)}
                        className="group flex flex-1 items-center justify-between px-3 py-4 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col items-start gap-1 overflow-hidden">
                          <span className="font-medium text-sm truncate w-full text-left">{scenario.name}</span>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-1.5 rounded text-[10px] uppercase font-bold">{scenario.algorithm}</span>
                            <span>{Array.isArray(scenario.processes) ? scenario.processes.length : 0} Procs</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={(e) => handleDelete(e, scenario.id)}
                          disabled={deletingId === scenario.id}
                        >
                          {deletingId === scenario.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
