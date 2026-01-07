package com.coffeehub.dto.response;

import com.coffeehub.entity.RestaurantTable;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TableResponse {
    private Long id;
    private String tableNumber;
    private String tableToken;
    private Integer capacity;
    private RestaurantTable.TableStatus status;
    private String qrCodeUrl;
    private LocalDateTime createdAt;
}