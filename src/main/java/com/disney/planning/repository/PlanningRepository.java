package com.disney.planning.repository;

import com.disney.planning.model.Planning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlanningRepository extends JpaRepository<Planning, Long> {

    @Query("SELECT p FROM Planning p WHERE p.equipe = :equipe AND YEAR(p.date) = :year AND MONTH(p.date) = :month")
    List<Planning> findTeamPlanning(
            @Param("equipe") String equipe,
            @Param("year") int year,
            @Param("month") int month
    );
}