import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InvestigationGraph, GraphNodeData, ForensicIncident } from '../types/forensics';
import {
  Network,
  User,
  HardDrive,
  Terminal,
  FileCode,
  Globe,
  ShieldAlert,
  Search,
  Filter,
  Route,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

interface AttackGraphPageProps {
  graphData: InvestigationGraph | null;
  currentIncident: ForensicIncident | null;
  onNavigateTab: (tab: string) => void;
}

export const AttackGraphPage: React.FC<AttackGraphPageProps> = ({
  graphData,
  currentIncident,
  onNavigateTab,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedEntity, setSelectedEntity] = useState<GraphNodeData | null>(null);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [highlightAttackPath, setHighlightAttackPath] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Node color & icon mapping
  const getNodeStyle = (type: string, isCompromised: boolean) => {
    switch (type) {
      case 'USER':
        return {
          bg: isCompromised ? 'bg-red-950/80 border-red-500' : 'bg-slate-900 border-cyan-500',
          text: isCompromised ? 'text-red-300' : 'text-cyan-300',
          icon: User,
        };
      case 'DEVICE':
        return {
          bg: isCompromised ? 'bg-red-950/80 border-amber-500' : 'bg-slate-900 border-blue-500',
          text: isCompromised ? 'text-amber-300' : 'text-blue-300',
          icon: HardDrive,
        };
      case 'PROCESS':
        return {
          bg: isCompromised ? 'bg-red-950/80 border-red-500' : 'bg-slate-900 border-slate-600',
          text: isCompromised ? 'text-red-300' : 'text-slate-300',
          icon: Terminal,
        };
      case 'FILE':
        return {
          bg: isCompromised ? 'bg-red-950/80 border-purple-500' : 'bg-slate-900 border-slate-600',
          text: isCompromised ? 'text-purple-300' : 'text-slate-300',
          icon: FileCode,
        };
      case 'IP_ADDRESS':
        return {
          bg: 'bg-red-950/90 border-red-500 shadow-lg shadow-red-500/20',
          text: 'text-red-300',
          icon: Globe,
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700',
          text: 'text-slate-300',
          icon: Network,
        };
    }
  };

  // Convert API graph data to React Flow layout
  useEffect(() => {
    if (!graphData) return;

    const pathSet = new Set(graphData.criticalAttackPath || []);

    // Layout calculation: organize nodes into intuitive vertical/horizontal tiers
    // USER (x: 100) -> DEVICE (x: 350) -> PROCESS (x: 600) -> FILE / IP (x: 900)
    const typeXMap: Record<string, number> = {
      USER: 100,
      DEVICE: 350,
      PROCESS: 650,
      FILE: 950,
      IP_ADDRESS: 1000,
      SECURITY_EVENT: 450,
    };

    const typeCountMap: Record<string, number> = {};

    const flowNodes: Node[] = graphData.nodes.map((node) => {
      const type = node.type || 'DEVICE';
      const count = typeCountMap[type] || 0;
      typeCountMap[type] = count + 1;

      const baseX = typeXMap[type] || 400;
      const baseY = 80 + count * 110;

      const style = getNodeStyle(type, node.isCompromised);
      const isPathMember = highlightAttackPath && pathSet.has(node.id);

      return {
        id: node.id,
        position: { x: baseX, y: baseY },
        data: {
          ...node,
          label: (
            <div
              onClick={() => setSelectedEntity(node)}
              className={`p-3 rounded-xl border-2 font-mono text-xs transition-all cursor-pointer shadow-lg ${
                style.bg
              } ${isPathMember ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <style.icon className={`w-3.5 h-3.5 ${style.text}`} />
                <span className="text-[10px] uppercase font-bold text-slate-400">{type}</span>
                {node.isCompromised && (
                  <span className="text-[8px] bg-red-500 text-slate-950 px-1 py-0.2 rounded font-extrabold">
                    HOSTILE
                  </span>
                )}
              </div>
              <div className={`font-bold truncate max-w-[160px] ${style.text}`}>{node.label}</div>
            </div>
          ),
        },
      };
    });

    const flowEdges: Edge[] = graphData.edges.map((edge) => {
      const isPathEdge =
        highlightAttackPath &&
        pathSet.has(edge.source) &&
        pathSet.has(edge.target);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: edge.isMalicious,
        style: {
          stroke: isPathEdge ? '#22d3ee' : edge.isMalicious ? '#ef4444' : '#64748b',
          strokeWidth: isPathEdge ? 3 : edge.isMalicious ? 2 : 1,
        },
        labelStyle: {
          fill: isPathEdge ? '#22d3ee' : '#94a3b8',
          fontWeight: 700,
          fontSize: 10,
          fontFamily: 'monospace',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#22d3ee' : edge.isMalicious ? '#ef4444' : '#64748b',
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, highlightAttackPath]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col font-mono">
      {/* Top Controls Bar */}
      <div className="p-4 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Interactive Attack Reconstruction Graph
            </div>
            <div className="text-[11px] text-slate-400">
              Correlated topological relationships powered by BFS shortest-path & DFS cluster analysis
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Attack Path Highlighter Toggle */}
          <button
            onClick={() => setHighlightAttackPath(!highlightAttackPath)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              highlightAttackPath
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Highlight BFS Critical Path</span>
          </button>

          {/* Entity Type Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="USER">Users</option>
            <option value="DEVICE">Endpoints</option>
            <option value="PROCESS">Processes</option>
            <option value="FILE">Files</option>
            <option value="IP_ADDRESS">IP Sockets</option>
          </select>
        </div>
      </div>

      {/* Main Canvas with React Flow */}
      <div className="flex-1 relative bg-[#070b14]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-[#070b14]"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-slate-900 border-slate-700 text-slate-300" />
          <MiniMap
            nodeColor={(n) => {
              if (n.data?.isCompromised) return '#ef4444';
              return '#06b6d4';
            }}
            className="bg-slate-900/90 border border-slate-800 rounded-lg"
          />
        </ReactFlow>

        {/* Floating BFS Attack Path Indicator */}
        {graphData?.criticalAttackPath && graphData.criticalAttackPath.length > 0 && (
          <div className="absolute bottom-6 left-6 max-w-lg bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl shadow-cyan-950/40 text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold mb-1.5">
              <Route className="w-4 h-4 text-cyan-400" />
              <span>Breadth-First Search (BFS) Attack Traversal:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
              {graphData.criticalAttackPath.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-800/50">
                    {step}
                  </span>
                  {idx < graphData.criticalAttackPath.length - 1 && (
                    <span className="text-slate-500 font-bold">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Selected Entity Inspector Drawer */}
        {selectedEntity && (
          <div className="absolute top-6 right-6 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase text-cyan-400 font-mono">
                  {selectedEntity.type} Entity Detail
                </span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Label / Identifier</div>
                <div className="font-bold text-slate-100 font-mono break-all">{selectedEntity.label}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Node ID</div>
                <div className="text-cyan-300 font-mono">{selectedEntity.id}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Hostile State</div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      selectedEntity.isCompromised
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {selectedEntity.isCompromised ? 'COMPROMISED / ADVERSARY' : 'NORMAL / UNTAINTED'}
                  </span>
                </div>
              </div>

              {selectedEntity.metadata && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Entity Telemetry</div>
                  <pre className="bg-slate-950 p-2 rounded text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedEntity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('time-machine')}
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold text-xs transition-colors"
            >
              Trace in Time Machine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
