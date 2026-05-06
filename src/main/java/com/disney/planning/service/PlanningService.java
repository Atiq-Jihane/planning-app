package com.disney.planning.service;

import com.disney.planning.model.Planning;
import com.disney.planning.repository.PlanningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlanningService {

    @Autowired
    private PlanningRepository repo;

    // 👉 récupérer planning filtré
    public List<Planning> getPlanning(String email, int year, int month) {
        return repo.findAll().stream()
                .filter(p -> p.getEmail().equalsIgnoreCase(email))
                .filter(p -> p.getDate().getYear() == year)
                .filter(p -> p.getDate().getMonthValue() == month)
                .collect(Collectors.toList());
    }

    // 👉 stats type Excel
    public Map<String, Double> getStats(String email, int year, int month) {

        List<Planning> list = getPlanning(email, year, month);

        double tt = count(list, "TT"); // ✅ AJOUT
        double cx = count(list, "CX");
        double c4 = count(list, "C4");
        double rj = count(list, "RJ") + count(list, "R2") / 2.0;
        double zz = count(list, "ZZ") + count(list, "Z2") / 2.0;

        Map<String, Double> stats = new HashMap<>();
        stats.put("TT", tt); // ✅ AJOUT
        stats.put("CX", cx);
        stats.put("RJ", rj);
        stats.put("C4", c4);
        stats.put("ZZ", zz);

        return stats;
    }

    private long count(List<Planning> list, String status) {
        return list.stream()
                .filter(p -> status.equalsIgnoreCase(p.getStatus()))
                .count();
    }

    public List<Planning> getTeamPlanning(String equipe, int year, int month) {
        return repo.findTeamPlanning(equipe, year, month);
    }
}