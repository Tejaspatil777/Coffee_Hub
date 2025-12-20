package com.javabite.javabite_backend.model;

public enum OrderStatus {
    PENDING,         // Created, waiting for chef assignment / start
    PREPARING,       // Chef started preparing
    READY_TO_SERVE,  // Chef finished and marked ready
    SERVED,          // Waiter served to table
    COMPLETED        // Final state (paid/closed)
}
