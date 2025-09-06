package com.example.chatplatform.model;

public class ChatMessage {
    private String content;
    private String sender;
    private String roomId;
    private String type; // "CHAT", "JOIN", "LEAVE"
    private Long userId;
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getSender() {
		return sender;
	}
	public void setSender(String sender) {
		this.sender = sender;
	}
	public String getRoomId() {
		return roomId;
	}
	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public ChatMessage(String content, String sender, String roomId, String type) {
		super();
		this.content = content;
		this.sender = sender;
		this.roomId = roomId;
		this.type = type;
	}
	public ChatMessage() {
		super();
		// TODO Auto-generated constructor stub
	}

    // getters, setters, constructors
}
