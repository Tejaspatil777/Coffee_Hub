package com.javabite.javabite_backend.dto;

import com.javabite.javabite_backend.model.Role;
import lombok.Data;

@Data
public class InviteCreateRequest {
    private String email;
    private String name;
    private Role role; // CHEF / WAITER
}
