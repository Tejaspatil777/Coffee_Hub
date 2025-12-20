// Mock data for Chef Dashboard

export const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "#1234",
    tableNumber: "T-05",
    customerName: "John Doe",
    items: [
      { name: "Margherita Pizza", quantity: 2, notes: "Extra cheese" },
      { name: "Caesar Salad", quantity: 1, notes: "No croutons" },
      { name: "Pasta Carbonara", quantity: 1, notes: "" }
    ],
    status: "pending",
    priority: "high",
    orderTime: "2024-11-30T10:30:00",
    estimatedTime: "25 mins"
  },
  {
    id: "ORD-002",
    orderNumber: "#1235",
    tableNumber: "T-12",
    customerName: "Sarah Smith",
    items: [
      { name: "Grilled Salmon", quantity: 1, notes: "Well done" },
      { name: "French Fries", quantity: 2, notes: "Extra crispy" }
    ],
    status: "preparing",
    priority: "medium",
    orderTime: "2024-11-30T10:45:00",
    estimatedTime: "15 mins"
  },
  {
    id: "ORD-003",
    orderNumber: "#1236",
    tableNumber: "T-08",
    customerName: "Mike Johnson",
    items: [
      { name: "BBQ Chicken Wings", quantity: 1, notes: "" },
      { name: "Coleslaw", quantity: 1, notes: "" },
      { name: "Iced Tea", quantity: 2, notes: "No sugar" }
    ],
    status: "ready",
    priority: "medium",
    orderTime: "2024-11-30T10:15:00",
    estimatedTime: "Ready"
  },
  {
    id: "ORD-004",
    orderNumber: "#1237",
    tableNumber: "T-03",
    customerName: "Emily Brown",
    items: [
      { name: "Vegetarian Burger", quantity: 1, notes: "Gluten-free bun" },
      { name: "Sweet Potato Fries", quantity: 1, notes: "" }
    ],
    status: "pending",
    priority: "high",
    orderTime: "2024-11-30T11:00:00",
    estimatedTime: "20 mins"
  },
  {
    id: "ORD-005",
    orderNumber: "#1238",
    tableNumber: "T-15",
    customerName: "David Wilson",
    items: [
      { name: "Steak", quantity: 1, notes: "Medium rare" },
      { name: "Mashed Potatoes", quantity: 1, notes: "" },
      { name: "Grilled Vegetables", quantity: 1, notes: "" }
    ],
    status: "preparing",
    priority: "high",
    orderTime: "2024-11-30T10:50:00",
    estimatedTime: "18 mins"
  }
];

export const mockChefStats = {
  pendingOrders: 8,
  preparingOrders: 5,
  completedToday: 42,
  averageTime: "22 mins"
};

export const mockOrderHistory = [
  {
    id: "ORD-H001",
    orderNumber: "#1220",
    tableNumber: "T-10",
    items: ["Club Sandwich", "Orange Juice"],
    completedTime: "2024-11-30T09:45:00",
    preparationTime: "18 mins"
  },
  {
    id: "ORD-H002",
    orderNumber: "#1221",
    tableNumber: "T-07",
    items: ["Pancakes", "Coffee"],
    completedTime: "2024-11-30T09:30:00",
    preparationTime: "12 mins"
  }
];
