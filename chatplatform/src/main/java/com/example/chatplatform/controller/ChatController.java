package com.example.chatplatform.controller;

import java.util.Optional;
import com.example.chatplatform.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.chatplatform.model.ChatMessage;
import com.example.chatplatform.model.MeetingRoom;
import com.example.chatplatform.repository.MeetingRoomRepository;
import com.example.chatplatform.repository.UserRepository;

@Controller
public class ChatController {
	@Autowired
	private MeetingRoomRepository roomRepository;

	@Autowired
	private UserRepository userRepository;

	private final SimpMessagingTemplate messagingTemplate;

	public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
	@MessageMapping("/chat.sendMessage")
	public void sendMessage(@Payload ChatMessage chatMessage) {
	    String roomId = chatMessage.getRoomId();

	    if ("LEAVE".equals(chatMessage.getType())) {
	        System.out.println("🔴 User LEAVE: " + chatMessage.getSender() + " room " + roomId);

	        chatMessage.setContent(chatMessage.getSender() + " đã rời phòng");

	        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
	    } else {
	        messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
	    }
	}

	@MessageMapping("/chat.addUser")
	public void addUser(@Payload ChatMessage chatMessage) {
	    String roomId = chatMessage.getRoomId();
	    String username = chatMessage.getSender();

	    Optional<MeetingRoom> roomOpt = roomRepository.findById(roomId);
	    if (roomOpt.isEmpty()) return; // phòng không tồn tại

	    Optional<User> userOpt = userRepository.findByUsername(username);
	    if (userOpt.isEmpty()) return; // user không tồn tại

	    MeetingRoom room = roomOpt.get();
	    User user = userOpt.get();

	    if (!room.getUsers().contains(user)) {
	        room.getUsers().add(user);
	        roomRepository.save(room);
	        System.out.println("User " + username + " đã được thêm vào phòng " + roomId);
	    }

	    chatMessage.setContent(username + " đã tham gia phòng");
	    messagingTemplate.convertAndSend("/topic/room/" + roomId, chatMessage);
	}



}
