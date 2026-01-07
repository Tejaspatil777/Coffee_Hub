package com.coffeehub.repository;

import com.coffeehub.entity.StaffInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffInvitationRepository extends JpaRepository<StaffInvitation, Long> {
    Optional<StaffInvitation> findByToken(String token);
    Optional<StaffInvitation> findByEmail(String email);
    boolean existsByEmailAndStatus(String email, StaffInvitation.InvitationStatus status);
}
