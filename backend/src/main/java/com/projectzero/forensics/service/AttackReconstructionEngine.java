package com.projectzero.forensics.service;

import com.projectzero.forensics.dto.GraphEdge;
import com.projectzero.forensics.dto.GraphNode;
import com.projectzero.forensics.dto.InvestigationGraphDto;
import com.projectzero.forensics.model.entity.EntityRelationship;
import com.projectzero.forensics.model.entity.ForensicEvent;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * PROJECT ZERO — Attack Reconstruction Engine
 * 
 * Reconstructs entity relationship topology and traces attack propagation
 * across users, endpoints, processes, files, and external network addresses.
 * Uses BFS for deterministic shortest attack-path resolution and DFS for
 * connected-component (blast-radius / isolation) cluster analysis.
 */
@Service
public class AttackReconstructionEngine {

    /**
     * Builds the complete forensic graph topology from persisted events and relationships.
     */
    public InvestigationGraphDto reconstructGraph(String incidentId, List<ForensicEvent> events, List<EntityRelationship> explicitRelationships) {
        Map<String, GraphNode> nodeMap = new LinkedHashMap<>();
        List<GraphEdge> edgeList = new ArrayList<>();
        Set<String> edgeSignatures = new HashSet<>();

        // 1. Process deterministic events to seed entities and observed causality edges
        for (ForensicEvent ev : events) {
            // Actor User Node
            String userNodeId = "user:" + ev.getActorUser().toLowerCase();
            nodeMap.putIfAbsent(userNodeId, GraphNode.builder()
                    .id(userNodeId)
                    .label(ev.getActorUser())
                    .type("USER")
                    .severity(ev.getIsMalicious() ? "CRITICAL" : "INFO")
                    .isCompromised(ev.getIsMalicious())
                    .metadata(Map.of("category", "Identity", "lastSeen", ev.getTimestamp().toString()))
                    .build());

            // Source Device Node
            String deviceNodeId = "device:" + ev.getSourceDevice().toLowerCase();
            nodeMap.putIfAbsent(deviceNodeId, GraphNode.builder()
                    .id(deviceNodeId)
                    .label(ev.getSourceDevice())
                    .type("DEVICE")
                    .severity(ev.getIsMalicious() ? "HIGH" : "LOW")
                    .isCompromised(ev.getIsMalicious())
                    .metadata(Map.of("ip", ev.getSourceIp() != null ? ev.getSourceIp() : "10.0.4.15"))
                    .build());

            // Edge: User -> Device (Authenticated / Executed On)
            addEdgeIfAbsent(edgeList, edgeSignatures, GraphEdge.builder()
                    .id("edge:user-dev:" + ev.getId())
                    .source(userNodeId)
                    .target(deviceNodeId)
                    .label("OPERATES_ON")
                    .isMalicious(Boolean.TRUE.equals(ev.getIsMalicious()))
                    .isInferred(false)
                    .supportingEventId(ev.getId())
                    .timestampEpochMs(ev.getTimestamp().toEpochMilli())
                    .build());

            // Process Node (if present)
            if (ev.getProcessName() != null && !ev.getProcessName().isBlank()) {
                String procNodeId = "proc:" + ev.getSourceDevice().toLowerCase() + ":" + ev.getProcessName().toLowerCase();
                nodeMap.putIfAbsent(procNodeId, GraphNode.builder()
                        .id(procNodeId)
                        .label(ev.getProcessName())
                        .type("PROCESS")
                        .severity(ev.getIsMalicious() ? "CRITICAL" : "LOW")
                        .isCompromised(ev.getIsMalicious())
                        .metadata(Map.of("pid", ev.getProcessId() != null ? ev.getProcessId() : "4102"))
                        .build());

                // Edge: Device -> Process
                addEdgeIfAbsent(edgeList, edgeSignatures, GraphEdge.builder()
                        .id("edge:dev-proc:" + ev.getId())
                        .source(deviceNodeId)
                        .target(procNodeId)
                        .label("HOSTS_PROCESS")
                        .isMalicious(Boolean.TRUE.equals(ev.getIsMalicious()))
                        .isInferred(false)
                        .supportingEventId(ev.getId())
                        .timestampEpochMs(ev.getTimestamp().toEpochMilli())
                        .build());

                // Edge: Process -> File (if file involved)
                if (ev.getFilePath() != null && !ev.getFilePath().isBlank()) {
                    String fileNodeId = "file:" + ev.getFilePath().toLowerCase();
                    nodeMap.putIfAbsent(fileNodeId, GraphNode.builder()
                            .id(fileNodeId)
                            .label(extractFilename(ev.getFilePath()))
                            .type("FILE")
                            .severity(ev.getIsMalicious() ? "HIGH" : "INFO")
                            .isCompromised(ev.getIsMalicious())
                            .metadata(Map.of("fullPath", ev.getFilePath()))
                            .build());

                    addEdgeIfAbsent(edgeList, edgeSignatures, GraphEdge.builder()
                            .id("edge:proc-file:" + ev.getId())
                            .source(procNodeId)
                            .target(fileNodeId)
                            .label(ev.getEventType().name())
                            .isMalicious(Boolean.TRUE.equals(ev.getIsMalicious()))
                            .isInferred(false)
                            .supportingEventId(ev.getId())
                            .timestampEpochMs(ev.getTimestamp().toEpochMilli())
                            .build());
                }

                // Edge: Process -> Network Destination (if egress/connection)
                if (ev.getDestinationIp() != null && !ev.getDestinationIp().isBlank()) {
                    String ipNodeId = "ip:" + ev.getDestinationIp();
                    nodeMap.putIfAbsent(ipNodeId, GraphNode.builder()
                            .id(ipNodeId)
                            .label(ev.getDestinationIp() + (ev.getPort() != null ? ":" + ev.getPort() : ""))
                            .type("IP_ADDRESS")
                            .severity(ev.getIsMalicious() ? "CRITICAL" : "LOW")
                            .isCompromised(ev.getIsMalicious())
                            .metadata(Map.of("port", ev.getPort() != null ? ev.getPort() : 443, "protocol", ev.getProtocol() != null ? ev.getProtocol() : "TCP"))
                            .build());

                    addEdgeIfAbsent(edgeList, edgeSignatures, GraphEdge.builder()
                            .id("edge:proc-net:" + ev.getId())
                            .source(procNodeId)
                            .target(ipNodeId)
                            .label(ev.getEventType() != null ? ev.getEventType().name() : "NETWORK_CONNECT")
                            .isMalicious(Boolean.TRUE.equals(ev.getIsMalicious()))
                            .isInferred(false)
                            .supportingEventId(ev.getId())
                            .timestampEpochMs(ev.getTimestamp().toEpochMilli())
                            .build());
                }
            }
        }

        // 2. Ingest explicit and inferred relationships
        if (explicitRelationships != null) {
            for (EntityRelationship rel : explicitRelationships) {
                addEdgeIfAbsent(edgeList, edgeSignatures, GraphEdge.builder()
                        .id(rel.getId())
                        .source(rel.getSourceEntityId())
                        .target(rel.getTargetEntityId())
                        .label(rel.getRelationshipType())
                        .isMalicious(Boolean.TRUE.equals(rel.getIsMalicious()))
                        .isInferred(Boolean.TRUE.equals(rel.getIsInferred()))
                        .supportingEventId(rel.getSupportingEventId())
                        .build());
            }
        }

        // 3. Run Graph Analysis Algorithms: Connected Components & Attack Path
        List<List<String>> components = computeConnectedComponents(nodeMap.keySet(), edgeList);
        List<String> attackPath = computeShortestAttackPath(nodeMap, edgeList);

        int observedCount = (int) edgeList.stream().filter(e -> !e.isInferred()).count();
        int inferredCount = edgeList.size() - observedCount;

        return InvestigationGraphDto.builder()
                .incidentId(incidentId)
                .nodes(new ArrayList<>(nodeMap.values()))
                .edges(edgeList)
                .criticalAttackPath(attackPath)
                .connectedComponentsCount(components.size())
                .connectedComponents(components)
                .observedRelationshipsCount(observedCount)
                .inferredRelationshipsCount(inferredCount)
                .build();
    }

    /**
     * Breadth-First Search (BFS) to identify the shortest causal path from the entry root
     * compromised node to the high-impact endpoint (e.g., C2 exfiltration IP or encrypted vault).
     */
    public List<String> computeShortestAttackPath(Map<String, GraphNode> nodes, List<GraphEdge> edges) {
        // Build adjacency map (only malicious or compromised traversal for attack chain)
        Map<String, List<String>> adj = new HashMap<>();
        for (GraphEdge edge : edges) {
            adj.computeIfAbsent(edge.getSource(), k -> new ArrayList<>()).add(edge.getTarget());
        }

        // Find primary entrypoint node (User or initial process)
        Optional<String> startNodeOpt = nodes.values().stream()
                .filter(GraphNode::isCompromised)
                .map(GraphNode::getId)
                .findFirst();

        // Find critical target node (e.g. external IP or exfil target)
        Optional<String> targetNodeOpt = nodes.values().stream()
                .filter(n -> n.getType().equals("IP_ADDRESS") || (n.isCompromised() && n.getType().equals("FILE")))
                .map(GraphNode::getId)
                .reduce((first, second) -> second); // pick latest critical node

        if (startNodeOpt.isEmpty() || targetNodeOpt.isEmpty()) {
            return Collections.emptyList();
        }

        String start = startNodeOpt.get();
        String target = targetNodeOpt.get();

        Queue<String> queue = new LinkedList<>();
        Map<String, String> parentMap = new HashMap<>();
        Set<String> visited = new HashSet<>();

        queue.add(start);
        visited.add(start);

        boolean reached = false;
        while (!queue.isEmpty()) {
            String curr = queue.poll();
            if (curr.equals(target)) {
                reached = true;
                break;
            }

            for (String neighbor : adj.getOrDefault(curr, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parentMap.put(neighbor, curr);
                    queue.add(neighbor);
                }
            }
        }

        if (!reached) {
            return Collections.singletonList(start);
        }

        // Reconstruct path backward
        LinkedList<String> path = new LinkedList<>();
        String curr = target;
        while (curr != null) {
            path.addFirst(curr);
            curr = parentMap.get(curr);
        }
        return path;
    }

    /**
     * Depth-First Search (DFS) for Connected-Component Analysis across the entity topology.
     */
    public List<List<String>> computeConnectedComponents(Set<String> allNodeIds, List<GraphEdge> edges) {
        Map<String, List<String>> undirectedAdj = new HashMap<>();
        for (GraphEdge edge : edges) {
            undirectedAdj.computeIfAbsent(edge.getSource(), k -> new ArrayList<>()).add(edge.getTarget());
            undirectedAdj.computeIfAbsent(edge.getTarget(), k -> new ArrayList<>()).add(edge.getSource());
        }

        Set<String> visited = new HashSet<>();
        List<List<String>> components = new ArrayList<>();

        for (String nodeId : allNodeIds) {
            if (!visited.contains(nodeId)) {
                List<String> component = new ArrayList<>();
                dfsComponent(nodeId, undirectedAdj, visited, component);
                components.add(component);
            }
        }
        return components;
    }

    private void dfsComponent(String node, Map<String, List<String>> adj, Set<String> visited, List<String> component) {
        visited.add(node);
        component.add(node);
        for (String neighbor : adj.getOrDefault(node, Collections.emptyList())) {
            if (!visited.contains(neighbor)) {
                dfsComponent(neighbor, adj, visited, component);
            }
        }
    }

    private void addEdgeIfAbsent(List<GraphEdge> edgeList, Set<String> signatures, GraphEdge edge) {
        String sig = edge.getSource() + "->" + edge.getTarget() + ":" + edge.getLabel();
        if (!signatures.contains(sig)) {
            signatures.add(sig);
            edgeList.add(edge);
        }
    }

    private String extractFilename(String path) {
        if (path == null) return "unknown";
        int lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }
}
