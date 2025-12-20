package com.javabite.javabite_backend.dto;

public class InviteRegisterRequest {
    public String token;
    public String email;
    public String name;
    public String password;

    // Manual getters
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPassword() { return password; }

    // Manual setters
    public void setToken(String token) { this.token = token; }
    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
    public void setPassword(String password) { this.password = password; }
}