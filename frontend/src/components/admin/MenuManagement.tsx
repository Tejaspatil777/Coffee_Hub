import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Plus,
  Pencil,
  Trash2,
  Coffee,
  Search,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  Leaf,
  Drumstick,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getAllCategories,
  type MenuItem,
} from '../../services/menuService';

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    mealType: 'All Day' as 'Breakfast' | 'Lunch' | 'Dinner' | 'All Day',
    dietaryType: 'Veg' as 'Veg' | 'Non-Veg',
    available: true,
    isPopular: false,
    isNew: false,
  });

  useEffect(() => {
    loadMenuItems();
    
    // Listen for menu updates
    const handleMenuUpdated = () => {
      loadMenuItems();
    };
    
    window.addEventListener('menuUpdated', handleMenuUpdated);
    
    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdated);
    };
  }, []);

  const loadMenuItems = () => {
    const items = getAllMenuItems();
    setMenuItems(items);
  };

  const categories = ['All', ...getAllCategories()];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newItem = createMenuItem({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
      mealType: formData.mealType,
      dietaryType: formData.dietaryType,
      available: formData.available,
      isPopular: formData.isPopular,
      isNew: formData.isNew,
    });

    toast.success(`${newItem.name} added to menu!`);
    setShowAddDialog(false);
    resetForm();
    loadMenuItems();
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updated = updateMenuItem(editingItem.id, {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      mealType: formData.mealType,
      dietaryType: formData.dietaryType,
      available: formData.available,
      isPopular: formData.isPopular,
      isNew: formData.isNew,
    });

    if (updated) {
      toast.success(`${updated.name} updated successfully!`);
      setShowEditDialog(false);
      setEditingItem(null);
      resetForm();
      loadMenuItems();
    }
  };

  const handleDeleteItem = (item: MenuItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const success = deleteMenuItem(item.id);
      if (success) {
        toast.success(`${item.name} deleted from menu`);
        loadMenuItems();
      } else {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleToggleAvailability = (item: MenuItem) => {
    const updated = toggleMenuItemAvailability(item.id);
    if (updated) {
      toast.success(`${item.name} is now ${updated.available ? 'available' : 'unavailable'}`);
      loadMenuItems();
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      mealType: item.mealType,
      dietaryType: item.dietaryType,
      available: item.available,
      isPopular: item.isPopular || false,
      isNew: item.isNew || false,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      mealType: 'All Day',
      dietaryType: 'Veg',
      available: true,
      isPopular: false,
      isNew: false,
    });
  };

  const FormFields = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground">Item Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Espresso"
            className="bg-input-background border-border text-foreground"
            required
          />
        </div>
        <div>
          <Label className="text-foreground">Price ($) *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="4.99"
            className="bg-input-background border-border text-foreground"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-foreground">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Rich and bold single shot of espresso"
          className="bg-input-background border-border text-foreground"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground">Category *</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Hot Coffees"
            className="bg-input-background border-border text-foreground"
            required
          />
        </div>
        <div>
          <Label className="text-foreground">Meal Type</Label>
          <Select value={formData.mealType} onValueChange={(val: any) => setFormData({ ...formData, mealType: val })}>
            <SelectTrigger className="bg-input-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All Day">All Day</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-foreground">Image URL</Label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
          className="bg-input-background border-border text-foreground"
        />
        {formData.image && (
          <img src={formData.image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Dietary Type</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.dietaryType === 'Veg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData({ ...formData, dietaryType: 'Veg' })}
            >
              <Leaf className="h-4 w-4 mr-1" />
              Veg
            </Button>
            <Button
              type="button"
              variant={formData.dietaryType === 'Non-Veg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData({ ...formData, dietaryType: 'Non-Veg' })}
            >
              <Drumstick className="h-4 w-4 mr-1" />
              Non-Veg
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground">Available</Label>
          <Switch
            checked={formData.available}
            onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Popular Item
          </Label>
          <Switch
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            New Item
          </Label>
          <Switch
            checked={formData.isNew}
            onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); resetForm(); }}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-accent text-white">
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Coffee className="h-5 w-5 text-primary" />
                Menu Management ☕
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Add, edit, and manage your restaurant menu items
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-accent text-white" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Menu Item</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Create a new item for your restaurant menu
                  </DialogDescription>
                </DialogHeader>
                <FormFields onSubmit={handleAddItem} submitLabel="Add Item" />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border text-foreground"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="sm:w-[200px] bg-input-background border-border text-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-foreground">{menuItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-primary">{menuItems.filter(i => i.available).length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-yellow-600 dark:text-yellow-500">{menuItems.filter(i => i.isPopular).length}</p>
              <p className="text-sm text-muted-foreground">Popular</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-blue-600 dark:text-blue-500">{menuItems.filter(i => i.isNew).length}</p>
              <p className="text-sm text-muted-foreground">New Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="bg-card/70 backdrop-blur-xl border-border overflow-hidden">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="h-32 w-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {item.isPopular && (
                  <Badge className="bg-yellow-500 text-white text-xs py-0 px-1.5">
                    <Star className="h-2.5 w-2.5 mr-0.5" />
                    Popular
                  </Badge>
                )}
                {item.isNew && (
                  <Badge className="bg-blue-500 text-white text-xs py-0 px-1.5">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    New
                  </Badge>
                )}
              </div>
              <Badge
                className={`absolute top-2 left-2 text-xs py-0 px-1.5 ${
                  item.available
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {item.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <CardContent className="pt-3 pb-3 px-3 space-y-2">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-foreground text-sm line-clamp-1">{item.name}</h3>
                  <Badge variant="outline" className="border-primary text-primary text-xs py-0 px-1.5 shrink-0">
                    ${item.price.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              
              <div className="flex gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs py-0 px-1.5">
                  {item.category}
                </Badge>
                <Badge variant="outline" className="text-xs py-0 px-1.5">
                  {item.mealType}
                </Badge>
                <Badge variant="outline" className="text-xs py-0 px-1.5 flex items-center gap-0.5">
                  {item.dietaryType === 'Veg' ? (
                    <Leaf className="h-2.5 w-2.5 text-green-600" />
                  ) : (
                    <Drumstick className="h-2.5 w-2.5 text-red-600" />
                  )}
                  {item.dietaryType}
                </Badge>
              </div>

              <div className="flex gap-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs px-2"
                  onClick={() => handleToggleAvailability(item)}
                >
                  {item.available ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Show
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => openEditDialog(item)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteItem(item)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No menu items found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add a new item</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Menu Item</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the details of {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <FormFields onSubmit={handleEditItem} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}