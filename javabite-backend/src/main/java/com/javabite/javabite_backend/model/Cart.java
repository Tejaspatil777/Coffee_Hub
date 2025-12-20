package com.javabite.javabite_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    private String userId;        // Email stored from JWT
    private List<CartItem> items;
}
