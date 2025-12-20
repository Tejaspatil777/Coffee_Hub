package com.javabite.javabite_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "menu")
public class Menu {

    @Id
    private String id;

    private String name;
    private String description;
    private int price;
    private String imageUrl;
    private boolean available = true;
    private String category;
}
