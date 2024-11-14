package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserName(String userName);


    List<User> findByUserNameContainsIgnoreCase(String userName);

}
