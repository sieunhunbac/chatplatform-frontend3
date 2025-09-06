package com.example.chatplatform.dto;

public class UserDto {
    private Long id;
    private String username;

    public UserDto(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    // Getter
    public Long getId() { return id; }
    public String getUsername() { return username; }
}
