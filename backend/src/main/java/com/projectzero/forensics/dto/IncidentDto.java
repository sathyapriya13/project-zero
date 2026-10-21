package com.projectzero.forensics.dto;

import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentDto {
    private String title;
    private ScenarioType scenarioType;
    private String description;
    private Severity severity;
    private String leadInvestigatorId;
}
