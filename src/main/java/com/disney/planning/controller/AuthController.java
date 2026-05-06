package com.disney.planning.controller;

import com.disney.planning.model.User;
import com.disney.planning.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // Body : { "email": "jihane.atiq@disney.com" }
    // Renvoie : { role, email, prenom, nom, equipe }
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpSession session) {

        String email = body.getOrDefault("email", "").trim();

        if (email.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email manquant."));
        }

        return userRepo.findByEmail(email)
                .<ResponseEntity<?>>map(u -> {
                    // Stocker la session
                    session.setAttribute("email", u.getEmail());
                    session.setAttribute("role",  u.getRole() != null ? u.getRole() : "USER");

                    return ResponseEntity.ok(Map.of(
                            "role",   u.getRole() != null ? u.getRole() : "USER",
                            "email",  u.getEmail(),
                            "prenom", u.getPrenom(),
                            "nom",    u.getNom(),
                            "equipe", u.getEquipe()
                    ));
                })
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("error", "Email introuvable. Vérifiez votre adresse.")));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/me  →  session courante (utilisé au rechargement de page)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        String email = (String) session.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Non connecté"));
        }

        return userRepo.findByEmail(email)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
                        "role",   u.getRole() != null ? u.getRole() : "USER",
                        "email",  u.getEmail(),
                        "prenom", u.getPrenom(),
                        "nom",    u.getNom(),
                        "equipe", u.getEquipe()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Session invalide")));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Déconnecté"));
    }
}