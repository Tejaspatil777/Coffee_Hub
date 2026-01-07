// Menu Management Service

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'All Day';
  dietaryType: 'Veg' | 'Non-Veg';
  createdAt: string;
  updatedAt: string;
}

// Default menu items
const defaultMenuItems: MenuItem[] = [
  // Hot Coffees
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold single shot of espresso',
    price: 3.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and thick foam',
    price: 4.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Latte',
    description: 'Smooth espresso with silky steamed milk',
    price: 4.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Americano',
    description: 'Espresso diluted with hot water',
    price: 3.49,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Mocha',
    description: 'Espresso with chocolate and steamed milk',
    price: 5.49,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400&q=80',
    available: true,
    isNew: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Cold Coffees
  {
    id: '6',
    name: 'Iced Latte',
    description: 'Chilled espresso with cold milk over ice',
    price: 5.49,
    category: 'Cold Coffees',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Iced Cappuccino',
    description: 'Cold cappuccino with ice',
    price: 5.49,
    category: 'Cold Coffees',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Pastries
  {
    id: '8',
    name: 'Croissant',
    description: 'Buttery and flaky French pastry',
    price: 3.99,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Chocolate Muffin',
    description: 'Rich chocolate muffin with chocolate chips',
    price: 4.49,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80',
    available: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Sandwiches
  {
    id: '10',
    name: 'Club Sandwich',
    description: 'Triple decker with chicken, bacon, lettuce, tomato',
    price: 8.99,
    category: 'Sandwiches',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'Lunch',
    dietaryType: 'Non-Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '11',
    name: 'Veggie Wrap',
    description: 'Grilled vegetables wrapped in tortilla',
    price: 7.49,
    category: 'Sandwiches',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80',
    available: true,
    mealType: 'Lunch',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Salads
  {
    id: '12',
    name: 'Caesar Salad',
    description: 'Romaine lettuce with parmesan and croutons',
    price: 9.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
    available: true,
    mealType: 'Lunch',
    dietaryType: 'Veg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize menu items in localStorage if not exists
function initializeMenu(): void {
  const stored = localStorage.getItem('menuItems');
  if (!stored) {
    localStorage.setItem('menuItems', JSON.stringify(defaultMenuItems));
  }
}

// Get all menu items
export function getAllMenuItems(): MenuItem[] {
  initializeMenu();
  const items = localStorage.getItem('menuItems');
  return items ? JSON.parse(items) : defaultMenuItems;
}

// Get menu item by ID
export function getMenuItemById(id: string): MenuItem | null {
  const items = getAllMenuItems();
  return items.find(item => item.id === id) || null;
}

// Create new menu item
export function createMenuItem(itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): MenuItem {
  const items = getAllMenuItems();
  
  const newItem: MenuItem = {
    ...itemData,
    id: 'MENU' + Date.now() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  items.push(newItem);
  localStorage.setItem('menuItems', JSON.stringify(items));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: newItem }));
  
  return newItem;
}

// Update menu item
export function updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
  const items = getAllMenuItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('menuItems', JSON.stringify(items));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: items[index] }));
  
  return items[index];
}

// Delete menu item
export function deleteMenuItem(id: string): boolean {
  const items = getAllMenuItems();
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length === items.length) {
    return false; // Item not found
  }
  
  localStorage.setItem('menuItems', JSON.stringify(filteredItems));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: { id, deleted: true } }));
  
  return true;
}

// Get menu items by category
export function getMenuItemsByCategory(category: string): MenuItem[] {
  const items = getAllMenuItems();
  return items.filter(item => item.category === category);
}

// Get available menu items
export function getAvailableMenuItems(): MenuItem[] {
  const items = getAllMenuItems();
  return items.filter(item => item.available);
}

// Toggle menu item availability
export function toggleMenuItemAvailability(id: string): MenuItem | null {
  const items = getAllMenuItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  items[index].available = !items[index].available;
  items[index].updatedAt = new Date().toISOString();
  
  localStorage.setItem('menuItems', JSON.stringify(items));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('menuUpdated', { detail: items[index] }));
  
  return items[index];
}

// Get all categories
export function getAllCategories(): string[] {
  const items = getAllMenuItems();
  return Array.from(new Set(items.map(item => item.category)));
}
