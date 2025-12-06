package com.community.profession_connect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // ✅ Allowed frontend origins
                        .allowedOrigins(
                                "http://localhost:3000",
                                "http://192.168.124.1:3000"
                        )
                        // HTTP methods you use
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        // Allow all headers
                        .allowedHeaders("*")
                        // If you ever use cookies / auth headers
                        .allowCredentials(true);
            }
        };
    }
}

