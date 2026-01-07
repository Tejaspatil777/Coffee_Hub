package com.coffeehub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AcceptInvitationRequest {
    @NotBlank(message = "Invitation token is required")
    private String token;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100)
    private String password;
    
    private String phoneNumber;
}
