import axios from "axios";

export const createOrder = async (orderData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const payload = {
    items: orderData.items,
    // Let backend calculate the total
  };

  console.log("📤 Creating order with payload:", payload);

  try {
    const response = await axios.post(
      "http://localhost:8080/order/create",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("📥 Order created successfully:", response.data);
    return response;
    
  } catch (error) {
    console.error("❌ Error creating order:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    throw error;
  }
};