package com.example.chatplatform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.chatplatform.dto.LoginRequest;
import com.example.chatplatform.dto.LoginResponse;
import com.example.chatplatform.model.User;
import com.example.chatplatform.repository.UserRepository;
import com.example.chatplatform.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
	    "https://inspiring-cobbler-196c25.netlify.app",
	    "http://localhost:4200"
	})
public class AuthController {
	@Autowired
	private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Xác thực username/password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Nếu thành công → tạo token
            String token = jwtUtil.generateToken(request.getUsername());

            return ResponseEntity.ok(new LoginResponse(token));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // ⚠ nên mã hóa sau này
        userRepository.save(user);

        return ResponseEntity.ok("User " + request.getUsername() + " registered");
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testApi() {
        return ResponseEntity.ok("✅ API đã nhận request kèm Authorization");
    }


}
