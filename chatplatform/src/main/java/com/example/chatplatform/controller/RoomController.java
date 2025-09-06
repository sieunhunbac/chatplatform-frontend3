package com.example.chatplatform.controller;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.chatplatform.dto.UserDto;
import com.example.chatplatform.model.ChatMessage;
import com.example.chatplatform.model.MeetingRoom;
import com.example.chatplatform.model.User;
import com.example.chatplatform.repository.MeetingRoomRepository;
import com.example.chatplatform.repository.UserRepository;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {
	    "https://inspiring-cobbler-196c25.netlify.app"
	})
public class RoomController {

    @Autowired
    private MeetingRoomRepository roomRepository;

   
    private final UserRepository userRepository;

    public RoomController(MeetingRoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody MeetingRoom room) {
        // Khi tạo phòng mới, chưa thêm participants
        room.setParticipants(new ArrayList<>());
        MeetingRoom saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }
    @PostMapping("/{roomId}/invite")
    public ResponseEntity<?> inviteUser(@PathVariable String roomId, @RequestBody List<Long> userIds) {
        Optional<MeetingRoom> optionalRoom = roomRepository.findById(roomId);
        if (!optionalRoom.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        MeetingRoom room = optionalRoom.get();

        List<Long> participants = room.getParticipants();
        if (participants == null) {
            participants = new ArrayList<>();
        }
        for (Long userId : userIds) {
            if (!participants.contains(userId)) {
                participants.add(userId);
            }
        }
        room.setParticipants(participants);
        MeetingRoom saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRoomsByUserId(@PathVariable Long userId) {
        List<MeetingRoom> rooms = roomRepository.findByParticipantId(userId);
        return ResponseEntity.ok(rooms);
    }
    
    @GetMapping
    public ResponseEntity<?> getAllRooms() {
        List<MeetingRoom> allRooms = roomRepository.findAll();
        return ResponseEntity.ok(allRooms);
    }

    @GetMapping("/{roomId}/users")
    @Transactional
    public ResponseEntity<List<UserDto>> getUsersInRoom(@PathVariable String roomId) {
        Optional<MeetingRoom> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MeetingRoom room = roomOptional.get();
        List<UserDto> users = room.getUsers().stream()
                .map(user -> new UserDto(user.getId(), user.getUsername()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{roomId}/kick/{userId}")
    public ResponseEntity<Void> kickUserFromRoom(@PathVariable String roomId, @PathVariable Long userId) {
        Optional<MeetingRoom> roomOpt = roomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (roomOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MeetingRoom room = roomOpt.get();
        User user = userOpt.get();

        room.getUsers().remove(user);    // ❌ Xoá user khỏi danh sách trong phòng
        roomRepository.save(room);       // 💾 Lưu lại phòng

        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{roomId}/join/{userId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @PathVariable Long userId) {
        Optional<MeetingRoom> roomOpt = roomRepository.findById(roomId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (roomOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MeetingRoom room = roomOpt.get();
        User user = userOpt.get();

        if (!room.getUsers().contains(user)) {
            room.getUsers().add(user);
            roomRepository.save(room);
        }

        return ResponseEntity.ok().build();
    }
    
    @MessageMapping("/chat")
    @SendTo("/topic/room/{roomId}")
    public ChatMessage handleMessage(@Payload ChatMessage message, @DestinationVariable String roomId) {
        if ("LEAVE".equals(message.getType())) {
            Optional<User> userOpt = userRepository.findByUsername(message.getSender());
            Optional<MeetingRoom> roomOpt = roomRepository.findById(roomId);

            if (userOpt.isPresent() && roomOpt.isPresent()) {
                User user = userOpt.get();
                MeetingRoom room = roomOpt.get();

                room.getUsers().remove(user);
                roomRepository.save(room);
                System.out.println("👋 " + user.getUsername() + " đã rời khỏi phòng " + roomId);
            }
        }

        return message;
    }



}
