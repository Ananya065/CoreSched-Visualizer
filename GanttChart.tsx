
import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionBlock } from '@/lib/simulator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GanttChartProps {
  blocks: ExecutionBlock[];
}

// Generate stable colors for process IDs
const getColorForProcess = (id: string) => {
  if (id === 'IDLE') return 'hsl(0, 0%, 90%)';
  
  // Simple hash for stable hue
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 85%, 65%)`; // More vibrant colors
};

const getTextColorForProcess = (id: string) => {
  if (id === 'IDLE') return 'hsl(0, 0%, 40%)';
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 25%)`; // Dark readable text
};

export const GanttChart: React.FC<GanttChartProps> = ({ blocks }) => {
  const totalDuration = blocks.length > 0 ? blocks[blocks.length - 1].end : 0;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Execution Timeline</span>
          <Badge variant="outline" className="font-mono">{totalDuration}ms Total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
            No processes to simulate
          </div>
        ) : (
          <div className="relative pt-6 pb-8">
            <div className="flex h-16 w-full rounded-md overflow-hidden ring-1 ring-border shadow-inner bg-muted/20">
              {blocks.map((block, i) => {
                const duration = block.end - block.start;
                const widthPercent = (duration / totalDuration) * 100;
                
                return (
                  <motion.div
                    key={`${block.processId}-${block.start}-${i}`}
                    initial={{ opacity: 0, scaleX: 0, originX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    whileHover={{ scaleY: 1.1, zIndex: 10 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: i * 0.05 
                    }}
                    className="flex flex-col items-center justify-center border-r border-white/20 relative group overflow-visible cursor-pointer shadow-sm"
                    style={{ 
                      backgroundColor: getColorForProcess(block.processId),
                      color: getTextColorForProcess(block.processId),
                      width: `${widthPercent}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    
                    {widthPercent > 4 && (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-black text-sm truncate px-1 drop-shadow-sm z-10"
                      >
                        {block.name}
                      </motion.span>
                    )}
                    
                    {/* Tooltip on hover for small blocks */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                      <div className="bg-popover text-popover-foreground text-xs font-bold px-3 py-2 rounded-lg shadow-xl border border-border whitespace-nowrap flex flex-col items-center gap-1">
                        <span className="text-primary">{block.name}</span>
                        <div className="flex gap-2 text-[10px] opacity-80">
                          <span>Start: {block.start}</span>
                          <span>End: {block.end}</span>
                        </div>
                        <div className="w-2 h-2 bg-popover rotate-45 absolute -bottom-1 border-r border-b border-border" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Timestamps */}
            <div className="absolute bottom-0 left-0 right-0 flex h-6 text-xs text-muted-foreground font-mono">
              <div className="absolute left-0 bottom-0 -translate-x-1/2">0</div>
              {blocks.map((block, i) => {
                const widthPercent = (block.end / totalDuration) * 100;
                // Only show labels that are spaced out enough, except the last one
                const showLabel = i === blocks.length - 1 || (block.end - block.start > (totalDuration * 0.05));
                
                if (!showLabel) return null;
                
                return (
                  <motion.div
                    key={`time-${block.end}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.02) }}
                    className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${widthPercent}%` }}
                  >
                    <div className="h-1.5 w-px bg-border mb-1" />
                    {block.end}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
