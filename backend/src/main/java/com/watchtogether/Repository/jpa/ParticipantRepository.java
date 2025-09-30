package com.watchtogether.Repository.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.watchtogether.Entity.jpa.Participant;
import java.util.List;


@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    List<Participant> findByRoomId(String roomId);
}
