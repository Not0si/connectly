package com.connectly.connectly.ParticipantRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRoleRepository extends JpaRepository<ParticipantRole, Integer> {
    ParticipantRole findByName(String name);
}
