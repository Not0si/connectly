package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MediaTypeRepository extends JpaRepository<MediaType, Integer> {
    MediaType findByName(String name);
}
