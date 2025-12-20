package com.javabite.javabite_backend.repository;

import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
}
