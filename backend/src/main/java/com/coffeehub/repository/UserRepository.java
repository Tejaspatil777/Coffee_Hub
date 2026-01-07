package com.coffeehub.repository;

import com.coffeehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByRoleAndEnabledTrue(User.Role role);

    @Query("SELECT u FROM User u WHERE u.role IN :roles AND u.enabled = true")
    List<User> findByRolesAndEnabled(@Param("roles") List<User.Role> roles);

    @Query("SELECT u FROM User u WHERE u.id IN :userIds AND u.enabled = true")
    List<User> findByIdInAndEnabled(@Param("userIds") List<Long> userIds);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") User.Role role);

    // Invitation methods
    Optional<User> findByInvitationToken(String token);

    @Query("SELECT u FROM User u WHERE u.invitationToken IS NOT NULL AND u.invitationAcceptedAt IS NULL")
    List<User> findPendingInvitations();

    @Query("SELECT u FROM User u WHERE u.invitationToken IS NOT NULL AND u.invitationAcceptedAt IS NULL AND u.invitationSentAt < :expiryDate")
    List<User> findExpiredInvitations(@Param("expiryDate") LocalDateTime expiryDate);
}