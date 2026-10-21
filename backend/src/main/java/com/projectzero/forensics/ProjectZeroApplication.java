package com.projectzero.forensics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProjectZeroApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectZeroApplication.class, args);
    }
}
