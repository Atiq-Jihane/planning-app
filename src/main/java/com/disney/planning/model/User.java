package com.disney.planning.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String email;

    private String equipe;
    private String prenom;
    private String nom;
    private String role;

    // GETTERS / SETTERS
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEquipe() { return equipe; }
    public void setEquipe(String equipe) { this.equipe = equipe; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}