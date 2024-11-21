package com.connectly.connectly.repository.redis;


import com.connectly.connectly.model.redis.SocketProfile;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocketProfileRepository extends CrudRepository<SocketProfile, String> {

}
