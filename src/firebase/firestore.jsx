// Firebase Firestore
// This is a stub for Firebase Firestore
// In a real app, you would import and initialize Firebase Firestore here
export const getCollection = async collectionName => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock data based on collection name
  switch (collectionName) {
    case 'orders':
      return (await import('../data/mockData')).mockOrdersData.allOrders;
    case 'inventory':
      return (await import('../data/mockData')).mockInventoryData.allItems;
    case 'loans':
      return (await import('../data/mockData')).mockLoanData.allLoans;
    case 'deliveries':
      return (await import('../data/mockData')).mockDeliveryData.allDeliveries;
    case 'workers':
      return (await import('../data/mockData')).mockWorkerData.allWorkers;
    case 'proposals':
      return (await import('../data/mockData')).mockProposalData.allProposals;
    default:
      return [];
  }
};
export const getDocument = async (collectionName, documentId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Get collection data and find the document with matching ID
  const collection = await getCollection(collectionName);
  return collection.find(doc => doc.id === documentId);
};
export const addDocument = async (collectionName, data) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  // Generate a mock document ID
  const id = `doc_${Math.random().toString(36).substr(2, 9)}`;
  // Return the data with the new ID
  return {
    id,
    ...data,
    createdAt: new Date().toISOString()
  };
};
export const updateDocument = async (collectionName, documentId, data) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    id: documentId,
    ...data,
    updatedAt: new Date().toISOString()
  };
};
export const deleteDocument = async (collectionName, documentId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    success: true
  };
};
export const queryCollection = async (collectionName, field, operator, value) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  // Get collection data
  const collection = await getCollection(collectionName);
  // Filter based on the query parameters
  return collection.filter(doc => {
    switch (operator) {
      case '==':
        return doc[field] === value;
      case '!=':
        return doc[field] !== value;
      case '>':
        return doc[field] > value;
      case '>=':
        return doc[field] >= value;
      case '<':
        return doc[field] < value;
      case '<=':
        return doc[field] <= value;
      case 'contains':
        return doc[field].includes(value);
      default:
        return true;
    }
  });
};