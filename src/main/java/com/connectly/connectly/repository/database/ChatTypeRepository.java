package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.ChatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatTypeRepository extends JpaRepository<ChatType, Integer> {
    Optional<ChatType> findByName(String name);
}
