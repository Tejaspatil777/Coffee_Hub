// Mock data for Waiter Dashboard

export const mockReadyOrders = [
  {
    id: "ORD-001",
    orderNumber: "#1236",
    tableNumber: "T-08",
    customerName: "Mike Johnson",
    items: [
      { name: "BBQ Chicken Wings", quantity: 1 },
      { name: "Coleslaw", quantity: 1 },
      { name: "Iced Tea", quantity: 2 }
    ],
    status: "ready",
    readyTime: "2024-11-30T11:15:00",
    priority: "high"
  },
  {
    id: "ORD-002",
    orderNumber: "#1240",
    tableNumber: "T-12",
    customerName: "Lisa Anderson",
    items: [
      { name: "Chicken Alfredo", quantity: 1 },
      { name: "Garlic Bread", quantity: 2 }
    ],
    status: "ready",
    readyTime: "2024-11-30T11:20:00",
    priority: "medium"
  },
  {
    id: "ORD-003",
    orderNumber: "#1242",
    tableNumber: "T-05",
    customerName: "Robert Taylor",
    items: [
      { name: "Fish & Chips", quantity: 2 },
      { name: "Tartar Sauce", quantity: 2 }
    ],
    status: "ready",
    readyTime: "2024-11-30T11:25:00",
    priority: "high"
  }
];

export const mockServedOrders = [
  {
    id: "ORD-004",
    orderNumber: "#1235",
    tableNumber: "T-03",
    customerName: "Emma White",
    items: [
      { name: "Caesar Salad", quantity: 1 },
      { name: "Lemonade", quantity: 1 }
    ],
    status: "served",
    servedTime: "2024-11-30T11:10:00"
  }
];

export const mockCompletedOrders = [
  {
    id: "ORD-C001",
    orderNumber: "#1220",
    tableNumber: "T-10",
    customerName: "James Miller",
    items: ["Club Sandwich", "Orange Juice"],
    completedTime: "2024-11-30T10:30:00",
    totalAmount: "$25.00"
  },
  {
    id: "ORD-C002",
    orderNumber: "#1225",
    tableNumber: "T-07",
    customerName: "Sophia Davis",
    items: ["Margherita Pizza", "Coca Cola"],
    completedTime: "2024-11-30T10:15:00",
    totalAmount: "$32.00"
  },
  {
    id: "ORD-C003",
    orderNumber: "#1228",
    tableNumber: "T-15",
    customerName: "Oliver Brown",
    items: ["Steak", "Red Wine"],
    completedTime: "2024-11-30T09:50:00",
    totalAmount: "$58.00"
  }
];

export const mockWaiterStats = {
  ordersReady: 3,
  ordersServed: 8,
  ordersCompleted: 35,
  averageServiceTime: "5 mins"
};

export const mockNotifications = [
  {
    id: "NOT-001",
    message: "Order #1236 is ready for Table T-08",
    time: "2024-11-30T11:15:00",
    read: false,
    type: "ready"
  },
  {
    id: "NOT-002",
    message: "Order #1240 is ready for Table T-12",
    time: "2024-11-30T11:20:00",
    read: false,
    type: "ready"
  }
];
