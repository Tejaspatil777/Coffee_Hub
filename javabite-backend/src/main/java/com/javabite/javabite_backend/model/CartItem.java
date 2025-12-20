package com.javabite.javabite_backend.model;

import lombok.Data;

@Data
public class CartItem {
    private String id;
    private String name;
    private String description;
    private String image;
    private int price;
    private int quantity;
}
