package com.disney.planning.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Planning {

    @Id
    @GeneratedValue
    private Long id;

    private String email;

    private LocalDate date;

    private String status; // P, TT, RJ, C4...

    private String equipe;

    // Getter & Setter
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEquipe() {
        return equipe;
    }

    public void setEquipe(String equipe) {
        this.equipe = equipe;
    }
}