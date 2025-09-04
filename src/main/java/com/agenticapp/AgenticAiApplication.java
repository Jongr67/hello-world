package com.agenticapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.agenticapp.repository.jpa")
@EnableMongoRepositories(basePackages = "com.agenticapp.repository.mongo")
public class AgenticAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgenticAiApplication.class, args);
    }
}
