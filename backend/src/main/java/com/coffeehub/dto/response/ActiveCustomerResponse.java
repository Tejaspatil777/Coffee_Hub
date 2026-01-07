package com.coffeehub.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActiveCustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDateTime lastActivityAt;
    private boolean hasActiveOrder;
    private Long activeOrderCount;
    private String currentTableNumber;
    
    public static ActiveCustomerResponse fromUser(com.coffeehub.entity.User user) {
        ActiveCustomerResponse response = new ActiveCustomerResponse();
        response.setId(user.getId());
        response.setName(user.getFirstName() + " " + user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        return response;
    }
}
