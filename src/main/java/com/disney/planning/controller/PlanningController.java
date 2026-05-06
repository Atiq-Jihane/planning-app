package com.disney.planning.controller;

import com.disney.planning.model.Planning;
import com.disney.planning.service.PlanningService;
import com.disney.planning.repository.PlanningRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/planning")
@CrossOrigin
public class PlanningController {

    private final PlanningRepository repo;
    private final PlanningService service;

    public PlanningController(PlanningRepository repo, PlanningService service) {
        this.repo = repo;
        this.service = service;
    }

    // 👉 SAVE
    @PostMapping
    public Planning save(@RequestBody Planning planning) {
        return repo.save(planning);
    }

    // 👉 GET planning
    @GetMapping
    public List<Planning> getPlanning(
            @RequestParam String email,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.getPlanning(email, year, month);
    }

    // 👉 STATS
    @GetMapping("/stats")
    public Map<String, Double> stats(
            @RequestParam String email,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.getStats(email, year, month);
    }

    @GetMapping("/team")
    public List<Planning> getTeamPlanning(
            @RequestParam String equipe,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.getTeamPlanning(equipe, year, month);
    }
}