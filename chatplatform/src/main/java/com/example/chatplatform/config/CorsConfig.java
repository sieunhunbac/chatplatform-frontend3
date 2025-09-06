package com.example.chatplatform.config;

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
                .allowedOrigins(
                	    "https://inspiring-cobbler-196c25.netlify.app/", 
                	    "http://localhost:4200"
                	)
                	.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                	.allowedHeaders("*")
                	.allowCredentials(true);
            }
        };
    }
}
