package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.ParticipantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRoleRepository extends JpaRepository<ParticipantRole, Integer> {
    ParticipantRole findByName(String name);
}
