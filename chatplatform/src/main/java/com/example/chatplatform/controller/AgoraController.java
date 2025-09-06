package com.example.chatplatform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agora")
public class AgoraController {

    @GetMapping("/token")
    public ResponseEntity<String> getToken(@RequestParam String channelName, @RequestParam int uid) {
        // 👉 gọi đến Agora SDK để tạo token
        String token = createAgoraToken(channelName, uid);
        return ResponseEntity.ok(token);
    }

    private String createAgoraToken(String channelName, int uid) {
        // TODO: Viết logic tạo token (có thể dùng hardcoded trước)
        return "dummy-token"; // ✅ Dùng tạm token test nếu chưa có SDK
    }
    
}
