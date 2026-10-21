package com.projectzero.forensics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraphEdge {
    private String id;
    private String source;
    private String target;
    private String label;
    private boolean isMalicious;
    private boolean isInferred;
    private String supportingEventId;
    private Long timestampEpochMs;
}
