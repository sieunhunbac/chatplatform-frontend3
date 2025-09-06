package com.example.chatplatform.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.chatplatform.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
    	if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
    	    response.setStatus(HttpServletResponse.SC_OK);
    	    response.setHeader("Access-Control-Allow-Origin", "https://timely-dragon-c77f43.netlify.app");
    	    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    	    response.setHeader("Access-Control-Allow-Headers", "content-type,authorization");
    	    response.setHeader("Access-Control-Allow-Credentials", "true");
    	    return; // ⚠️ không đi tiếp filter chain
    	}

        // Xử lý JWT bình thường
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.validateToken(token)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();

        // Bỏ qua các path đã permit, nhưng **không check OPTIONS ở đây**
        return path.startsWith("/api/auth")
                || path.startsWith("/api/rooms")
                || path.startsWith("/api/chatrooms")
                || path.startsWith("/ws")
                || path.startsWith("/api/files")
                || path.startsWith("/uploads");
    }


}
