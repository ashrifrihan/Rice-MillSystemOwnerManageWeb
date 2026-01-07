// src/services/dealerService.js
import { db } from '../firebase/index.js';
import { collection, getDocs, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';

class DealerService {
  constructor() {
    this.collectionName = 'dealers';
  }

  // Get dealer by ID
  async getDealerById(dealerId) {
    try {
      const dealersRef = collection(db, this.collectionName);
      const q = query(dealersRef, where('uid', '==', dealerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }

      // Return default dealer data if not found
      return {
        name: 'Guest Dealer',
        creditLimit: 1000000,
        creditUsed: 0,
        creditRemaining: 1000000,
        trustLevel: 'standard',
        paymentMethods: ['online'],
        savedAddress: null
      };
    } catch (error) {
      console.error('Error fetching dealer:', error);
      // Return default data on error
      return {
        name: 'Guest Dealer',
        creditLimit: 1000000,
        creditUsed: 0,
        creditRemaining: 1000000,
        trustLevel: 'standard',
        paymentMethods: ['online'],
        savedAddress: null
      };
    }
  }

  // Submit bank statement for credit approval
  async submitBankStatement(statementData) {
    try {
      const statementId = `STMT-${Date.now().toString().slice(-8)}`;
      const statementRef = doc(collection(db, 'bank_statements'), statementId);

      await setDoc(statementRef, {
        ...statementData,
        id: statementId,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      return { id: statementId, success: true };
    } catch (error) {
      console.error('Error submitting bank statement:', error);
      throw error;
    }
  }

  // Get all dealers
  async getAllDealers() {
    try {
      const dealersRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(dealersRef);

      const dealers = [];
      querySnapshot.forEach((doc) => {
        dealers.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return dealers;
    } catch (error) {
      console.error('Error fetching dealers:', error);
      throw error;
    }
  }

  // Update dealer credit information
  async updateDealerCredit(dealerId, creditData) {
    try {
      const dealer = await this.getDealerById(dealerId);
      if (!dealer.id) {
        throw new Error('Dealer not found');
      }

      const dealerRef = doc(db, this.collectionName, dealer.id);
      await updateDoc(dealerRef, {
        ...creditData,
        updated_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating dealer credit:', error);
      throw error;
    }
  }
}

export const dealerService = new DealerService();