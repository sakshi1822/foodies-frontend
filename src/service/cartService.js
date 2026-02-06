import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/cart`;
export const addToCart = async (foodId, token) => {
  if (!token) return;

  try {
    await axios.post(
      API_URL,
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    console.error("Error while adding cart", error.response?.status);
  }
};

export const removeItemFromCart = async (foodId, token) => {
  if (!token) return;

  try {
    await axios.post(
      `${API_URL}/remove`,
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    console.error("Error while removing item", error.response?.status);
  }
};

export const getCartData = async (token) => {
  if (!token) return [];

  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.items;
  } catch (error) {
    console.error("Error fetching cart", error.response?.status);
    throw error;
  }
};
