package com.connectly.connectly.repository.redis;

import com.connectly.connectly.model.redis.SessionProfile;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionProfileRepository extends CrudRepository<SessionProfile, String> {

}
