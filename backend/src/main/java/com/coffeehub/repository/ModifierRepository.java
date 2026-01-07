package com.coffeehub.repository;

import com.coffeehub.entity.Modifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModifierRepository extends JpaRepository<Modifier, Long> {

    List<Modifier> findByAvailableTrue();

    List<Modifier> findByTypeAndAvailableTrue(Modifier.ModifierType type);

    List<Modifier> findByIdIn(List<Long> modifierIds);

    @Query("SELECT m FROM Modifier m WHERE m.available = true AND m.id IN :modifierIds")
    List<Modifier> findAvailableModifiersByIds(@Param("modifierIds") List<Long> modifierIds);

    @Query("SELECT m FROM Modifier m WHERE m.available = true ORDER BY m.type, m.name")
    List<Modifier> findAllAvailableOrdered();

    @Query("SELECT DISTINCT m.type FROM Modifier m WHERE m.available = true")
    List<Modifier.ModifierType> findDistinctAvailableTypes();

    Optional<Modifier> findByNameAndType(String name, Modifier.ModifierType type);

    Boolean existsByNameAndTypeAndIdNot(String name, Modifier.ModifierType type, Long id);
}