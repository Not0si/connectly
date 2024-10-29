package com.connectly.connectly.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.connectly.connectly.model.User;

@Repository
public interface UserRepository extends CrudRepository<User, String>  {

}
