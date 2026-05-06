package com.disney.planning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())   // H2 console
                )

                .authorizeHttpRequests(auth -> auth
                        // Endpoints d'auth : ouverts à tous
                        .requestMatchers("/api/auth/**").permitAll()

                        // H2 console : ouverte (à désactiver en prod !)
                        .requestMatchers("/h2-console/**").permitAll()

                        // Fichiers statiques publics
                        .requestMatchers("/", "/react.html", "/team.js").permitAll()

                        // admin.html : accessible uniquement en étant connecté
                        // (la vérification du rôle ADMIN est faite dans admin.js via /api/auth/me)
                        .requestMatchers("/admin.html", "/admin.js").permitAll()

                        // Toutes les autres routes API : accessibles (auth gérée côté session)
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}