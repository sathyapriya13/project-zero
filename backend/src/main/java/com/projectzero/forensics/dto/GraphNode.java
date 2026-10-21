package com.projectzero.forensics.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraphNode {
    private String id;
    private String label;
    private String type; // USER, DEVICE, PROCESS, FILE, IP_ADDRESS, SECURITY_EVENT
    private String severity;
    private boolean isCompromised;
    private Map<String, Object> metadata;
}
