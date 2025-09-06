package com.example.chatplatform.websocket;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.example.chatplatform.model.ChatMessage;
import com.example.chatplatform.model.MeetingRoom;
import com.example.chatplatform.model.User;
import com.example.chatplatform.repository.MeetingRoomRepository;
import com.example.chatplatform.repository.UserRepository;

@Controller
public class WebSocketChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MeetingRoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat/{roomId}")
    public void handleMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        System.out.println("📩 WebSocket received: " + message.getType() + " - " + message.getSender());

        // Nếu là LEAVE → xóa user khỏi room (nếu cần)
        if ("LEAVE".equals(message.getType())) {
            Optional<MeetingRoom> roomOpt = roomRepository.findById(roomId);
            Optional<User> userOpt = userRepository.findByUsername(message.getSender());

            if (roomOpt.isPresent() && userOpt.isPresent()) {
                MeetingRoom room = roomOpt.get();
                User user = userOpt.get();

                room.getUsers().remove(user);
                roomRepository.save(room);

                System.out.println("👋 " + message.getSender() + " đã rời khỏi phòng " + roomId);
            }
        }

        // Broadcast lại cho các client trong phòng
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if (username != null && roomId != null) {
        	ChatMessage leaveMessage = new ChatMessage();            
        	leaveMessage.setType("LEAVE");
            leaveMessage.setSender(username);
            leaveMessage.setRoomId(roomId);
            leaveMessage.setContent(username + " đã rời phòng");

            messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveMessage);
        }
    }

}
