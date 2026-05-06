package com.disney.planning.controller;

import com.disney.planning.model.User;
import com.disney.planning.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ── Ajouter un utilisateur ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody User user) {
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(repo.save(user));
    }

    // ── Supprimer un utilisateur ──────────────────────────────────────────────
    @DeleteMapping("/{email}")
    public ResponseEntity<Void> deleteUser(@PathVariable String email) {
        return repo.findByEmail(email)
                .map(user -> {
                    repo.delete(user);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}