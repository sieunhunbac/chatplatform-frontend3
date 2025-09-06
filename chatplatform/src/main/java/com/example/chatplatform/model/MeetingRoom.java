package com.example.chatplatform.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "meeting_rooms")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "users"}) // Tránh vòng lặp JSON
public class MeetingRoom {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID) // nếu dùng String UUID
	private String id;

    private String name;
    private String description;
    private Long adminId;

    @ElementCollection
    private List<Long> participants;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "room_users",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users = new HashSet<>();

    public MeetingRoom() {}

    public MeetingRoom(String name, String description, Long adminId, List<Long> participants) {
        this.name = name;
        this.description = description;
        this.adminId = adminId;
        this.participants = participants;
    }

    // Getters và Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public List<Long> getParticipants() { return participants; }
    public void setParticipants(List<Long> participants) { this.participants = participants; }

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }
}
