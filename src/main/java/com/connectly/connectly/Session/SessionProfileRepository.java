package com.connectly.connectly.Session;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionProfileRepository extends CrudRepository<SessionProfile, String> {

}
