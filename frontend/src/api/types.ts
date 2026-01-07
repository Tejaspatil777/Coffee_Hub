/**
 * Type definitions matching Java Spring Boot backend DTOs
 * This file contains all TypeScript interfaces that correspond to backend response/request models
 */

// ==================== COMMON ====================

/**
 * Generic API Response wrapper from Spring Boot
 * All backend endpoints return this format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
  error: string | null;
}

// ==================== AUTH ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface AcceptInvitationRequest {
  token: string;
  name: string;
  password: string;
  phoneNumber?: string;
}

export interface StaffInvitationInfo {
  email: string;
  role: string;
  message: string;
  expiresAt: string;
}

// ==================== USER ====================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CHEF = 'CHEF',
  WAITER = 'WAITER',
  ADMIN = 'ADMIN'
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  isAvailable: boolean;
  currentActiveOrders: number;
  maxActiveOrders: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== MENU ====================

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  displayOrder: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: CategoryResponse;
  imageUrl: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  preparationTime: number;
  calories: number | null;
  allergens: string | null;
  spiceLevel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModifierResponse {
  id: number;
  name: string;
  type: ModifierType;
  price: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ModifierType {
  SIZE = 'SIZE',
  EXTRA = 'EXTRA',
  ADDON = 'ADDON',
  CUSTOMIZATION = 'CUSTOMIZATION'
}

export interface MenuItemImportRequest {
  name: string;
  description: string;
  price: number;
  categoryName: string;
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  preparationTime: number;
  calories?: number;
  allergens?: string;
  spiceLevel?: string;
}

export interface MenuImportSummary {
  totalItems: number;
  createdItems: number;
  skippedItems: number;
  message: string;
  errors: string[];
}

// ==================== CART ====================

export interface CartItemRequest {
  menuItemId: number;
  quantity: number;
  modifierIds?: number[];
  specialInstructions?: string;
}

export interface CartItemResponse {
  id: number;
  menuItem: MenuItemResponse;
  quantity: number;
  modifiers: ModifierResponse[];
  specialInstructions: string | null;
  itemTotal: number;
}

export interface CartResponse {
  id: number;
  userId: number | null;
  sessionToken: string | null;
  tableId: number | null;
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== ORDER ====================

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  modifierIds?: number[];
  specialInstructions?: string;
}

export interface OrderRequest {
  orderType: OrderType;
  tableId?: number;
  items: OrderItemRequest[];
  specialInstructions?: string;
  deliveryAddress?: string;
}

export interface OrderItemResponse {
  id: number;
  menuItem: MenuItemResponse;
  quantity: number;
  modifiers: ModifierResponse[];
  specialInstructions: string | null;
  itemTotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  user: UserResponse;
  orderType: OrderType;
  table: TableResponse | null;
  items: OrderItemResponse[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  specialInstructions: string | null;
  deliveryAddress: string | null;
  estimatedCompletionTime: string | null;
  actualCompletionTime: string | null;
  assignedChef: UserResponse | null;
  assignedWaiter: UserResponse | null;
  stripePaymentIntentId: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// ==================== TABLE ====================

export interface TableResponse {
  id: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location: string | null;
  qrCode: string | null;
  tableToken: string;
  currentOrder: OrderResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface TableQRResponse {
  tableId: number;
  tableNumber: string;
  qrCode: string;
  tableToken: string;
  qrUrl: string;
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING'
}

// ==================== PAYMENT ====================

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

// ==================== ADMIN ====================

export interface InviteStaffRequest {
  email: string;
  role: UserRole;
  message?: string;
}

export interface InvitationResponse {
  token: string;
  email: string;
  role: UserRole;
  message: string | null;
  invitationLink: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeStaff: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  todayRevenue: number;
  availableTables: number;
  occupiedTables: number;
  activeCustomers: number;
  topSellingItems: TopSellingItem[];
}

export interface TopSellingItem {
  itemName: string;
  count: number;
}

export interface ActiveCustomerResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  hasActiveOrder: boolean;
  activeOrderCount: number;
  lastActivityAt: string | null;
  currentTableNumber: string | null;
}

// ==================== BOOKING ====================

export interface BookingRequest {
  tableId: number;
  bookingDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface BookingResponse {
  id: number;
  user: UserResponse;
  table: TableResponse;
  bookingDate: string;
  numberOfGuests: number;
  status: BookingStatus;
  specialRequests: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

// ==================== PAGINATION ====================

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
