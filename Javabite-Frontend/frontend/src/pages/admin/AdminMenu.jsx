import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Coffee, Upload } from 'lucide-react'; 
import { toast } from 'react-toastify';
import axios from 'axios'; 

// Data for categories (required for select input and icon rendering)
const categories = [
    { value: 'coffee', label: 'Coffee', emoji: '☕' },
    { value: 'tea', label: 'Tea', emoji: '🫖' },
    { value: 'pastry', label: 'Pastry', emoji: '🥐' },
    { value: 'sandwich', label: 'Sandwich', emoji: '🥪' },
    { value: 'other', label: 'Other', emoji: '✨' },
];

// Configuration
const API_BASE_URL = 'http://localhost:8080/api/admin/menu';
// NOTE: This MUST match the ImageUploadController path
const IMAGE_UPLOAD_URL = 'http://localhost:8080/api/admin/image/upload'; 

// Helper to get the JWT token and headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); 
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};


function AdminMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // ⭐ 1. State for the image file
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'coffee',
        available: true,
        imageUrl: '', // Holds the final public URL string
    });

    // 1. Fetch Menu Items
    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`, getAuthHeaders());
            setMenuItems(response.data);
        } catch (error) {
            console.error('Failed to fetch menu items:', error);
            if (error.response && error.response.status === 403) {
                toast.error('Permission denied. Please ensure you are logged in as Admin.');
            } else {
                toast.error('Failed to load menu items.');
            }
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    // Utility to reset form and close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setSelectedFile(null); // ⭐ Reset file state
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'coffee',
            available: true,
            imageUrl: '',
        });
    };
    
    // Helper function: Open Add Modal (Called by "Add Menu Item" button)
    const openAddModal = () => {
        closeModal(); // Resets form data
        setShowModal(true);
    };
    
    // Helper function: Open Edit Modal (Called by Edit button)
    const openEditModal = (item) => {
        setEditingItem(item);
        // Convert price (paise/integer from backend) back to string for input field (Rupees)
        setFormData({ 
            ...item, 
            price: (item.price / 100).toFixed(2),
            imageUrl: item.imageUrl || '', // Ensure imageUrl is preserved
        }); 
        setShowModal(true);
    };

    // ⭐ 2. Handler for file input change
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // ⭐ 3. Function to upload image file
    const uploadImage = async (file) => {
        const data = new FormData();
        // 'file' must match the @RequestParam name in your Spring Boot controller (ImageUploadController.java)
        data.append('file', file); 

        try {
            // Must remove Content-Type header so Axios/Browser can set it correctly for FormData boundary
            const authHeaders = { ...getAuthHeaders().headers };
            delete authHeaders['Content-Type']; 

            const response = await axios.post(IMAGE_UPLOAD_URL, data, {
                headers: authHeaders,
            });

            // Assuming the backend returns the public URL in the response body, e.g., { url: "..." }
            return { url: response.data.url }; 

        } catch (error) {
            console.error('Image upload failed:', error.response || error);
            return { error: error.response?.data?.message || 'Failed to upload image. Please check the backend endpoint.' };
        }
    };
    
    // Helper function: Toggle Availability (Connects to PUT /api/admin/menu/update/{id})
    const toggleAvailability = async (itemId) => {
        const itemToUpdate = menuItems.find(item => item.id === itemId);

        if (!itemToUpdate) {
            toast.error("Item not found!");
            return;
        }

        const updatedData = {
            ...itemToUpdate,
            available: !itemToUpdate.available,
        };
        
        try {
            // Note: Sending the full object is necessary for the update endpoint
            await axios.put(`${API_BASE_URL}/update/${itemId}`, updatedData, getAuthHeaders());
            toast.success(`'${itemToUpdate.name}' availability toggled to ${!itemToUpdate.available ? 'Available' : 'Unavailable'}.`);
            fetchMenuItems(); 
        } catch (error) {
            const errorMessage = error.response?.data || 'Failed to toggle availability.';
            console.error('API Error:', errorMessage);
            toast.error(errorMessage);
        }
    };
    
    // Helper function: Delete Item
    const deleteItem = async (itemId) => { 
        const itemToDelete = menuItems.find(item => item.id === itemId);
        const name = itemToDelete ? itemToDelete.name : 'this item';
        
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/delete/${itemId}`, getAuthHeaders());
                toast.success(`'${name}' deleted.`);
                fetchMenuItems(); 
            } catch (error) {
                const errorMessage = error.response?.data || 'Failed to delete menu item.';
                console.error('API Error:', errorMessage);
                toast.error(errorMessage);
            }
        }
    };


    // ⭐ 4. Update/Add Submission (Handles image upload before saving item data)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || parseFloat(formData.price) <= 0) {
            toast.warn('Please fill out all required fields correctly.');
            return;
        }
        
        let finalImageUrl = formData.imageUrl || null; // Start with existing URL or null

        if (selectedFile) {
            // 4a. Upload the file first
            toast.info(`Uploading image for '${formData.name}'...`);
            const imageUploadResult = await uploadImage(selectedFile);

            if (imageUploadResult.error) {
                toast.error(imageUploadResult.error);
                return; // Stop submission if upload fails
            }
            finalImageUrl = imageUploadResult.url; // 4b. Get the public URL
        }


        // Ensure price is converted to the integer/paise format expected by the Java model
        const priceInPaise = Math.round(parseFloat(formData.price) * 100);

        const payload = { 
            ...formData, 
            price: priceInPaise,
            imageUrl: finalImageUrl, // 4c. Use the uploaded URL in the payload
        };

        try {
            if (editingItem) {
                // Update Existing Item
                await axios.put(`${API_BASE_URL}/update/${editingItem.id}`, payload, getAuthHeaders());
                toast.success(`'${payload.name}' updated successfully!`);
            } else {
                // Add New Item
                await axios.post(`${API_BASE_URL}/add`, payload, getAuthHeaders());
                toast.success(`'${payload.name}' added successfully!`);
            }
            
            closeModal();
            fetchMenuItems(); // Refresh the list from the database
            
        } catch (error) {
            const errorMessage = error.response?.data || 'An unexpected error occurred.';
            console.error('API Error:', errorMessage);
            toast.error(errorMessage);
        }
    };


    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-8"
            >
                <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    Menu Management
                </h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openAddModal}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
                    data-testid="add-menu-item-btn"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Menu Item</span>
                </motion.button>
            </motion.div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 ${
                            !item.available ? 'opacity-60' : ''
                        }`}
                    >
                         {/* Image Display */}
                        <div className="relative mb-4 w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300x160/333/fff?text=Image+Load+Error" }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <Coffee className="h-8 w-8 opacity-50" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl">
                                    {categories.find(c => c.value === item.category)?.emoji || '☕'}
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {item.name}
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                            {/* Price display in Rupees: converting paise (integer) to Rupees (float) */}
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                ₹{(item.price / 100).toFixed(2)} 
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {item.description}
                        </p>

                        <div className="flex items-center space-x-2">
                            {/* Availability Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleAvailability(item.id)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                                    item.available
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                                data-testid={`toggle-availability-${item.id}`}
                            >
                                {item.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                <span className="text-sm font-medium">
                                    {item.available ? 'Available' : 'Unavailable'}
                                </span>
                            </motion.button>

                            {/* Edit Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(item)}
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                data-testid={`edit-menu-${item.id}`}
                            >
                                <Edit className="h-4 w-4" />
                            </motion.button>

                            {/* Delete Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteItem(item.id)}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                data-testid={`delete-menu-${item.id}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}

                {menuItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        <Coffee className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No menu items yet. Add your first item!</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeModal}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="Enter item name"
                                        data-testid="menu-name-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="Enter item description"
                                        data-testid="menu-description-input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        placeholder="0.00"
                                        data-testid="menu-price-input"
                                    />
                                </div>

                                {/* ⭐ 5. Image Upload Section (Restored) */}
                                <div className="border-t pt-4 border-gray-200 dark:border-gray-700 space-y-4">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                        <Upload className="h-4 w-4 mr-2" /> Image
                                    </p>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Upload New Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            data-testid="menu-image-file-input"
                                        />
                                        {selectedFile && (
                                            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                File selected: **{selectedFile.name}**
                                            </p>
                                        )}
                                        {/* Display existing URL when editing */}
                                        {editingItem && !selectedFile && formData.imageUrl && (
                                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 truncate">
                                                Current image: {formData.imageUrl.substring(formData.imageUrl.lastIndexOf('/') + 1)}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                                                OR
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            External Image URL (Will be ignored if file is uploaded)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                            placeholder="https://example.com/image.jpg"
                                            data-testid="menu-image-url-input"
                                            disabled={!!selectedFile} // Disable if a file is selected for upload
                                        />
                                    </div>
                                </div>
                                {/* END: Image Upload Section */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        data-testid="menu-category-select"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="available"
                                        checked={formData.available}
                                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        data-testid="menu-available-checkbox"
                                    />
                                    <label
                                        htmlFor="available"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        Available for order
                                    </label>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg font-semibold"
                                    data-testid="submit-menu-btn"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminMenu;