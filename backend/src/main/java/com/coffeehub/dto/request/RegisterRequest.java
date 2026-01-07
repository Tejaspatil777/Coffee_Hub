package com.coffeehub.dto.request;

import com.coffeehub.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

      @NotBlank
     private String firstName;

     @NotBlank
     private String lastName;

    private User.Role role = User.Role.CUSTOMER;
}