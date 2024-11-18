package com.connectly.connectly.repository.database;

import com.connectly.connectly.model.database.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUserName(String userName);

    Page<User> findByUserNameContainsIgnoreCase(String userName, Pageable pageable);
}
