package com.javabite.javabite_backend.repository;

import com.javabite.javabite_backend.model.InviteToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InviteTokenRepository extends MongoRepository<InviteToken, String> {

    Optional<InviteToken> findByToken(String token);

    // 🔥 THIS IS THE MISSING METHOD - Add this line:
    List<InviteToken> findAllByUsedFalse();

    // (Optional: Also make sure this one is present for the InviteService logic)
    Optional<InviteToken> findByEmailAndUsedFalse(String email);
}