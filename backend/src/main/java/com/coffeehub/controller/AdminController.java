package com.coffeehub.controller;

import com.coffeehub.dto.request.InviteStaffRequest;
import com.coffeehub.dto.request.MenuItemImportRequest;
import com.coffeehub.dto.response.ActiveCustomerResponse;
import com.coffeehub.dto.response.AdminDashboardSummary;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.InvitationResponse;
import com.coffeehub.dto.response.MenuImportSummary;
import com.coffeehub.dto.response.UserResponse;
import com.coffeehub.entity.Order;
import com.coffeehub.entity.RestaurantTable;
import com.coffeehub.entity.StaffInvitation;
import com.coffeehub.entity.User;
import com.coffeehub.repository.OrderRepository;
import com.coffeehub.repository.RestaurantTableRepository;
import com.coffeehub.repository.StaffInvitationRepository;
import com.coffeehub.service.MenuService;
import com.coffeehub.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuService menuService;

    @Autowired
    private StaffInvitationRepository invitationRepository;
    @Autowired
    private RestaurantTableRepository tableRepository;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<AdminDashboardSummary>> getDashboardSummary() {
        logger.info("Fetching admin dashboard summary");

        try {
            AdminDashboardSummary summary = new AdminDashboardSummary();
            
            LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime todayEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            
            // User stats
            summary.setTotalUsers(userService.countByRole(User.Role.CUSTOMER));
            Long chefs = userService.countByRole(User.Role.CHEF);
            Long waiters = userService.countByRole(User.Role.WAITER);
            Long admins = userService.countByRole(User.Role.ADMIN);
            summary.setActiveStaff(chefs + waiters + admins);
            
            // Order stats
            summary.setTodayOrders(orderRepository.countByDateRange(todayStart, todayEnd));
            summary.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
            summary.setPreparingOrders(orderRepository.countByStatus(Order.OrderStatus.PREPARING));
            
            // Revenue
            BigDecimal revenue = orderRepository.getTotalRevenueByDateRange(todayStart, todayEnd);
            summary.setTodayRevenue(revenue != null ? revenue : BigDecimal.ZERO);
            
            // Table stats
            summary.setAvailableTables(tableRepository.countAvailableTables());
            summary.setOccupiedTables((long) tableRepository.findByStatus(RestaurantTable.TableStatus.OCCUPIED).size());
            
            // Active customers (users with orders in last 4 hours)
            LocalDateTime recentTime = LocalDateTime.now().minusHours(4);
            List<Order> recentOrders = orderRepository.findByStatusIn(List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY,
                Order.OrderStatus.OUT_FOR_DELIVERY
            ));
            summary.setActiveCustomers((long) recentOrders.stream()
                .map(order -> order.getUser().getId())
                .distinct()
                .count());
            
            // Top selling items
            List<Object[]> topItems = orderRepository.findTopSellingItems(todayStart, todayEnd, 5);
            List<AdminDashboardSummary.TopSellingItem> topSellingItems = topItems.stream()
                .map(item -> new AdminDashboardSummary.TopSellingItem(
                    (String) item[0],
                    ((Number) item[1]).longValue()
                ))
                .collect(Collectors.toList());
            summary.setTopSellingItems(topSellingItems);
            
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (Exception e) {
            logger.error("Error fetching dashboard summary", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching dashboard summary"));
        }
    }

    @GetMapping("/active-customers")
    public ResponseEntity<ApiResponse<List<ActiveCustomerResponse>>> getActiveCustomers() {
        logger.info("Fetching active customers");

        try {
            // Get users with orders in last 4 hours
            List<Order> recentOrders = orderRepository.findByStatusIn(List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY
            ));
            
            // Group by user and create response
            List<ActiveCustomerResponse> activeCustomers = recentOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getUser()))
                .entrySet().stream()
                .map(entry -> {
                    User user = entry.getKey();
                    List<Order> userOrders = entry.getValue();
                    
                    ActiveCustomerResponse response = ActiveCustomerResponse.fromUser(user);
                    response.setHasActiveOrder(true);
                    response.setActiveOrderCount((long) userOrders.size());
                    response.setLastActivityAt(
                        userOrders.stream()
                            .map(Order::getCreatedAt)
                            .max(LocalDateTime::compareTo)
                            .orElse(null)
                    );
                    
                    // Get current table if any
                    userOrders.stream()
                        .filter(order -> order.getTable() != null)
                        .findFirst()
                        .ifPresent(order -> 
                            response.setCurrentTableNumber(order.getTable().getTableNumber())
                        );
                    
                    return response;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(activeCustomers));
        } catch (Exception e) {
            logger.error("Error fetching active customers", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching active customers"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        logger.info("Fetching all users");

        try {
            List<UserResponse> users = userService.findAllUsers().stream()
                    .map(UserResponse::fromUser)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            logger.error("Error fetching users", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching users"));
        }
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable User.Role role) {
        logger.info("Fetching users by role: {}", role);

        try {
            List<UserResponse> users = userService.findByRole(role).stream()
                    .map(UserResponse::fromUser)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            logger.error("Error fetching users by role: {}", role, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching users: " + e.getMessage()));
        }
    }

    @GetMapping("/users/staff")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaffUsers() {
        logger.info("Fetching staff users");

        try {
            List<UserResponse> users = userService.findStaffUsers().stream()
                    .map(UserResponse::fromUser)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            logger.error("Error fetching staff users", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching staff users"));
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCustomers() {
        logger.info("Fetching all customers");

        try {
            List<UserResponse> customers = userService.findByRole(User.Role.CUSTOMER).stream()
                    .map(UserResponse::fromUser)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(customers));
        } catch (Exception e) {
            logger.error("Error fetching customers", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching customers"));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        logger.info("Fetching user by id: {}", id);

        try {
            User user = userService.findById(id);
            return ResponseEntity.ok(ApiResponse.success(UserResponse.fromUser(user)));
        } catch (Exception e) {
            logger.error("Error fetching user with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long id, @RequestParam User.Role newRole) {

        logger.info("Changing user role - user: {}, new role: {}", id, newRole);

        try {
            User updatedUser = userService.changeUserRole(id, newRole);
            return ResponseEntity.ok(ApiResponse.success("User role updated successfully", UserResponse.fromUser(updatedUser)));
        } catch (Exception e) {
            logger.error("Error changing user role for user: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error changing user role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with id: {}", id);

        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting user with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }

    @GetMapping("/stats/users/count")
    public ResponseEntity<ApiResponse<Long>> getUserCountByRole(@RequestParam User.Role role) {
        logger.info("Fetching user count for role: {}", role);

        try {
            Long count = userService.countByRole(role);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            logger.error("Error fetching user count for role: {}", role, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching user count: " + e.getMessage()));
        }
    }

    @PostMapping("/invite-staff")
    public ResponseEntity<ApiResponse<InvitationResponse>> inviteStaff(
            @Valid @RequestBody InviteStaffRequest request,
            Authentication authentication) {
        logger.info("Invite staff request for email: {}, role: {}", request.getEmail(), request.getRole());

        try {
            // Validate role is staff (CHEF or WAITER)
            if (request.getRole() != User.Role.CHEF && request.getRole() != User.Role.WAITER && request.getRole() != User.Role.ADMIN) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only CHEF, WAITER, or ADMIN roles can be invited"));
            }

            // Check if user already exists
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("A user with this email already exists"));
            }

            // Check if there's already a pending invitation
            if (invitationRepository.existsByEmailAndStatus(request.getEmail(), StaffInvitation.InvitationStatus.PENDING)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("A pending invitation already exists for this email"));
            }

            // Get the admin user who is sending the invitation
            String adminEmail = authentication.getName();
            User adminUser = userService.findByEmail(adminEmail);

            // Generate unique invitation token
            String token = UUID.randomUUID().toString();

            // Create invitation record
            StaffInvitation invitation = new StaffInvitation();
            invitation.setToken(token);
            invitation.setEmail(request.getEmail());
            invitation.setRole(request.getRole());
            invitation.setMessage(request.getMessage());
            invitation.setInvitedBy(adminUser);
            invitation.setExpiresAt(LocalDateTime.now().plusDays(7));

            invitationRepository.save(invitation);

            // Generate invitation link (frontend URL)
            String invitationLink = "http://localhost:3000/accept-invitation?token=" + token;

            // In a real application, you would send an email here
            // emailService.sendInvitation(request.getEmail(), invitationLink, request.getRole());

            InvitationResponse response = new InvitationResponse(
                    token,
                    request.getEmail(),
                    request.getRole(),
                    request.getMessage(),
                    invitationLink
            );

            logger.info("Staff invitation created successfully for: {} with token: {}", request.getEmail(), token);
            return ResponseEntity.ok(ApiResponse.success("Invitation sent successfully. Copy the link to share with the candidate.", response));
        } catch (Exception e) {
            logger.error("Error sending staff invitation to: {}", request.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error sending invitation: " + e.getMessage()));
        }
    }

    // ==================== MENU MANAGEMENT ====================

    /**
     * 📥 IMPORT MENU ITEMS
     * Admin-only endpoint to import menu data from frontend
     * ✅ Accepts menu items WITHOUT IDs (backend generates them)
     * ✅ Creates categories automatically if missing
     * ✅ Skips duplicate items (by name + category)
     * ✅ Safe, idempotent operation
     *
     * Endpoint: POST /admin/menu/import
     * Access: ADMIN role only
     * Request body: List of MenuItemImportRequest
     */
    @PostMapping("/menu/import")
    public ResponseEntity<ApiResponse<MenuImportSummary>> importMenuItems(
            @Valid @RequestBody List<MenuItemImportRequest> importRequests) {
        logger.info("Admin menu import request received with {} items", importRequests.size());

        try {
            MenuImportSummary summary = menuService.importMenuItems(importRequests);
            logger.info("Menu import completed successfully: {}", summary.getMessage());
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (Exception e) {
            logger.error("Error importing menu items", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error importing menu items: " + e.getMessage()));
        }
    }
}