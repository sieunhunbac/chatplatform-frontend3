package com.example.chatplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class ChatplatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatplatformApplication.class, args);
		String rawPassword = "1234";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode(rawPassword));
	}

}
