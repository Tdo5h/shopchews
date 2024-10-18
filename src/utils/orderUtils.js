import { ref, get, update } from "firebase/database";
import { database } from "./firebase";  // You'll need to create this file
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_PHONE_ENCRYPTION_KEY;

const decryptOrder = (encryptedOrder) => {
  try {
    // Check if the order is already decrypted
    if (typeof encryptedOrder === 'object' && encryptedOrder !== null) {
      console.log("Order appears to be already decrypted:", encryptedOrder);
      return encryptedOrder;
    }

    const bytes = CryptoJS.AES.decrypt(encryptedOrder, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      console.error("Decryption resulted in empty string. Encrypted data:", encryptedOrder);
      return null;
    }
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error, "Encrypted data:", encryptedOrder);
    return null;
  }
};

export const getAllOrders = async () => {
  const ordersRef = ref(database, 'choosers/e2e2fc5c16146a08c75074f0d0180279f42130be772ae4dc01b7a6538a68a0dd/orders');
  try {
    const snapshot = await get(ordersRef);
    const data = snapshot.val();
    
    if (data) {
      const allOrders = Object.entries(data).map(([orderId, orderData]) => {
        if (!orderData) {
          console.error(`Order ${orderId} data is null`);
          return null;
        }
        let decryptedOrder;
        try {
          decryptedOrder = decryptOrder(orderData.data || orderData);
        } catch (error) {
          console.error(`Failed to decrypt order ${orderId}:`, error);
          return null;
        }
        if (!decryptedOrder) {
          console.error(`Decryption failed for order ${orderId}. Raw data:`, orderData);
          // Return the raw data if decryption fails
          return {
            id: orderId,
            ...orderData,
            status: orderData.status || 'unknown'
          };
        }
        return {
          id: orderId,
          ...decryptedOrder,
          status: orderData.status || decryptedOrder.status || 'unknown'
        };
      }).filter(Boolean);
      return allOrders;
    } else {
      console.log("No orders found in the database");
      return [];
    }
  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = ref(database, `choosers/e2e2fc5c16146a08c75074f0d0180279f42130be772ae4dc01b7a6538a68a0dd/orders/${orderId}`);
  try {
    const snapshot = await get(orderRef);
    const orderData = snapshot.val();
    
    if (!orderData) {
      console.error(`No data found for order ${orderId}`);
      return false;
    }

    let decryptedOrder = decryptOrder(orderData.data || orderData);
    if (!decryptedOrder) {
      console.error(`Failed to decrypt order ${orderId}. Updating status directly.`);
      await update(orderRef, { status: newStatus });
      return true;
    }

    decryptedOrder.status = newStatus;
    const updatedEncryptedOrder = CryptoJS.AES.encrypt(JSON.stringify(decryptedOrder), ENCRYPTION_KEY).toString();
    
    await update(orderRef, { data: updatedEncryptedOrder, status: newStatus });
    console.log(`Order ${orderId} status updated to ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    return false;
  }
};

// Add other shared functions here
