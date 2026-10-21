package com.projectzero.forensics.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI projectZeroOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PROJECT ZERO — Digital Forensics REST API")
                        .description("High-fidelity cybercrime time machine, timeline reconstruction, BFS/DFS graph correlation, and SHA-256 evidence vault APIs.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Forensics Engineering Core")
                                .email("forensics@projectzero.sec"))
                        .license(new License().name("Apache 2.0")));
    }
}
