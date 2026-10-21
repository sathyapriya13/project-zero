package com.projectzero.forensics.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationGraphDto {
    private String incidentId;
    private List<GraphNode> nodes;
    private List<GraphEdge> edges;
    private List<String> criticalAttackPath;
    private int connectedComponentsCount;
    private List<List<String>> connectedComponents;
    private int observedRelationshipsCount;
    private int inferredRelationshipsCount;
}
