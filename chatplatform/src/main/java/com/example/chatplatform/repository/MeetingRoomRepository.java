package com.example.chatplatform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.chatplatform.model.MeetingRoom;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, String> {
	@Query("SELECT r FROM MeetingRoom r WHERE :userId IN elements(r.participants)")
	List<MeetingRoom> findByParticipantId(@Param("userId") Long userId);

}

