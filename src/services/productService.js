// src/services/productService.js
import { db } from '../firebase/index.js';
import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';

class ProductService {
  constructor() {
    this.collectionName = 'products';
  }

  // Get all products from Firestore
  async getAllProducts() {
    try {
      const productsRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(productsRef);

      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const productRef = doc(db, this.collectionName, productId);
      const productDoc = await getDocs(query(collection(db, this.collectionName), where('id', '==', productId)));

      if (!productDoc.empty) {
        const doc = productDoc.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Update product stock
  async updateProductStock(productId, quantitySold) {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newStock = product.stock_quantity - quantitySold;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      const productRef = doc(db, this.collectionName, productId);
      await updateDoc(productRef, {
        stock_quantity: newStock,
        stock_status: newStock === 0 ? 'Out of Stock' : newStock < 100 ? 'Low' : 'Available',
        updated_at: new Date().toISOString()
      });

      return { success: true, newStock };
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Create order in Firestore (for dealer's order history)
  async createOrder(orderData) {
    try {
      const orderId = `ORD-${Date.now().toString().slice(-8)}`;
      const orderRef = doc(collection(db, 'dealer_orders'), orderId);

      await setDoc(orderRef, {
        ...orderData,
        id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return { orderId, success: true };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get orders for a dealer
  async getDealerOrders(dealerId) {
    try {
      const ordersRef = collection(db, 'dealer_orders');
      const q = query(ordersRef, where('dealerId', '==', dealerId), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return orders;
    } catch (error) {
      console.error('Error fetching dealer orders:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();