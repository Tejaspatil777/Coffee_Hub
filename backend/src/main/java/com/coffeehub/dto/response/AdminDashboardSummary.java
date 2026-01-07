package com.coffeehub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminDashboardSummary {
    private Long totalUsers;
    private Long activeStaff;
    private Long todayOrders;
    private BigDecimal todayRevenue;
    private Long availableTables;
    private Long occupiedTables;
    private Long pendingOrders;
    private Long preparingOrders;
    private Long activeCustomers;
    private List<TopSellingItem> topSellingItems;

    @Data
    public static class TopSellingItem {
        private String name;
        private Long quantity;
        
        public TopSellingItem(String name, Long quantity) {
            this.name = name;
            this.quantity = quantity;
        }
    }
}
