package com.example.chatplatform.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.chatplatform.security.JwtAuthenticationFilter;
import com.example.chatplatform.service.CustomUserDetailsService;

@Configuration
public class SecurityConfig {
	@Autowired
	private JwtAuthenticationFilter jwtAuthenticationFilter;
	@Autowired
	private CustomUserDetailsService customUserDetailsService;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
		    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
		    .csrf(csrf -> csrf.disable())
		    .authorizeHttpRequests(auth -> auth
		            .requestMatchers("/api/auth/**").permitAll()
		            .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
		            .requestMatchers(HttpMethod.POST, "/api/rooms").permitAll()
		            .requestMatchers(HttpMethod.GET, "/api/chatrooms/**").permitAll()
		            .requestMatchers("/ws/**").permitAll()
		            .requestMatchers("/api/files/**").permitAll()   // 👈 Cho upload API
		            .requestMatchers("/uploads/**").permitAll()    // 👈 Cho static files
//		            .anyRequest().authenticated()
		            .anyRequest().permitAll()
		        )
	        .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
	        .userDetailsService(customUserDetailsService);

	    return http.build();
	}



    // CORS cấu hình
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
	    CorsConfiguration configuration = new CorsConfiguration();

	    // Thêm domain FE thực tế
	    configuration.setAllowedOriginPatterns(List.of(
	        "http://localhost:4200", 
	        "https://inspiring-cobbler-196c25.netlify.app"
	    ));

	    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
	    configuration.setAllowedHeaders(List.of("*"));
	    configuration.setAllowCredentials(true);

	    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    source.registerCorsConfiguration("/**", configuration);
	    return source;
	}
	
    @Bean
    public PasswordEncoder passwordEncoder() {
    	return NoOpPasswordEncoder.getInstance();
//        return new BCryptPasswordEncoder();
    }

    // Cần thiết cho việc xử lý login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
