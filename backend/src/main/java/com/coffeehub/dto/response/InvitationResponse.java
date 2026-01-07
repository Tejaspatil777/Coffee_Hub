package com.coffeehub.dto.response;

import com.coffeehub.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    private String token;
    private String email;
    private User.Role role;
    private String message;
    private String invitationLink;
}
