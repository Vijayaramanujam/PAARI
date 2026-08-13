package com.paari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Required for auto-expire scheduled jobs
public class PaariApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaariApplication.class, args);
    }
}