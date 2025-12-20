package com.javabite.javabite_backend.repository;

import com.javabite.javabite_backend.model.Menu;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuRepository extends MongoRepository<Menu, String> {
    boolean existsByName(String name);
}
