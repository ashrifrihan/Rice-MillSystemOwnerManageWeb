import React from 'react';
// Mock data for the Rice Mill Owner application
// Sales data for the dashboard
export const mockSalesData = {
  summary: [{
    label: 'Total Sales',
    value: 'Rs. 1,234,567'
  }, {
    label: 'Orders',
    value: '156'
  }, {
    label: 'Avg. Order Value',
    value: 'Rs. 7,914'
  }]
  // This would contain more detailed chart data in a real implementation
};

// Add these new data structures to your existing mockData.jsx file

// Loan Customers data
export const mockLoanCustomersData = {
  allCustomers: [
    {
      id: 'C001',
      name: 'Sharma Foods Ltd',
      contact: '+91 98765 43210',
      email: 'sharma@foods.com',
      address: '123 Business Street, Mumbai',
      totalLoans: 3,
      activeLoans: 1,
      totalBorrowed: 155000,
      creditScore: 85,
      joinDate: '2022-01-15',
      status: 'Active'
    },
    {
      id: 'C002',
      name: 'Kumar Restaurants',
      contact: '+91 98765 43211',
      email: 'kumar@restaurants.com',
      address: '456 Food Court, Delhi',
      totalLoans: 2,
      activeLoans: 1,
      totalBorrowed: 62500,
      creditScore: 45,
      joinDate: '2022-03-20',
      status: 'High Risk'
    },
    {
      id: 'C003',
      name: 'Patel Grocery Chain',
      contact: '+91 98765 43212',
      email: 'patel@grocery.com',
      address: '789 Market Road, Ahmedabad',
      totalLoans: 4,
      activeLoans: 2,
      totalBorrowed: 210000,
      creditScore: 78,
      joinDate: '2021-11-10',
      status: 'Active'
    },
    {
      id: 'C004',
      name: 'Singh Exports',
      contact: '+91 98765 43213',
      email: 'singh@exports.com',
      address: '321 Trade Avenue, Kolkata',
      totalLoans: 2,
      activeLoans: 0,
      totalBorrowed: 68000,
      creditScore: 92,
      joinDate: '2022-02-05',
      status: 'Preferred'
    },
    {
      id: 'C005',
      name: 'Gupta Wholesalers',
      contact: '+91 98765 43214',
      email: 'gupta@wholesalers.com',
      address: '654 Wholesale Market, Chennai',
      totalLoans: 1,
      activeLoans: 1,
      totalBorrowed: 42000,
      creditScore: 65,
      joinDate: '2023-01-12',
      status: 'Active'
    },
    {
      id: 'C006',
      name: 'Reddy Supermarkets',
      contact: '+91 98765 43215',
      email: 'reddy@supermarkets.com',
      address: '987 Retail Park, Hyderabad',
      totalLoans: 1,
      activeLoans: 1,
      totalBorrowed: 24000,
      creditScore: 70,
      joinDate: '2023-03-08',
      status: 'Active'
    },
    {
      id: 'C007',
      name: 'Joshi Brothers',
      contact: '+91 98765 43216',
      email: 'joshi@brothers.com',
      address: '147 Industry Area, Pune',
      totalLoans: 3,
      activeLoans: 1,
      totalBorrowed: 167500,
      creditScore: 55,
      joinDate: '2022-05-15',
      status: 'Medium Risk'
    },
    {
      id: 'C008',
      name: 'Verma Distributors',
      contact: '+91 98765 43217',
      email: 'verma@distributors.com',
      address: '258 Distribution Center, Bangalore',
      totalLoans: 2,
      activeLoans: 1,
      totalBorrowed: 119500,
      creditScore: 80,
      joinDate: '2022-07-22',
      status: 'Active'
    }
  ]
};

// Loan Given data (Detailed loan records)
export const mockLoanGivenData = {
  allGivenLoans: [
    {
      id: 'L1001',
      customerId: 'C001',
      customer: 'Sharma Foods Ltd',
      riceType: 'Premium Basmati Rice',
      quantity: 500,
      amount: 42500,
      issueDate: '2023-05-10',
      dueDate: '2023-07-10',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Active',
      remainingAmount: 42500,
      nextDueDate: '2023-07-10',
      loanOfficer: 'Rajesh Mehta'
    },
    {
      id: 'L1002',
      customerId: 'C002',
      customer: 'Kumar Restaurants',
      riceType: 'Brown Rice',
      quantity: 300,
      amount: 19500,
      issueDate: '2023-05-15',
      dueDate: '2023-06-15',
      interestRate: '12%',
      repaymentTerm: '30 days',
      status: 'Overdue',
      remainingAmount: 19500,
      nextDueDate: '2023-06-15',
      overdueDays: 15,
      loanOfficer: 'Priya Sharma'
    },
    {
      id: 'L1003',
      customerId: 'C003',
      customer: 'Patel Grocery Chain',
      riceType: 'Jasmine Rice',
      quantity: 450,
      amount: 33750,
      issueDate: '2023-05-20',
      dueDate: '2023-07-20',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Partially Repaid',
      remainingAmount: 23750,
      nextDueDate: '2023-07-20',
      loanOfficer: 'Amit Patel'
    },
    {
      id: 'L1004',
      customerId: 'C004',
      customer: 'Singh Exports',
      riceType: 'Premium Basmati Rice',
      quantity: 800,
      amount: 68000,
      issueDate: '2023-04-05',
      dueDate: '2023-06-05',
      interestRate: '10%',
      repaymentTerm: '60 days',
      status: 'Fully Repaid',
      remainingAmount: 0,
      nextDueDate: '2023-06-05',
      loanOfficer: 'Rajesh Mehta'
    },
    {
      id: 'L1005',
      customerId: 'C005',
      customer: 'Gupta Wholesalers',
      riceType: 'Sona Masoori Rice',
      quantity: 600,
      amount: 42000,
      issueDate: '2023-05-25',
      dueDate: '2023-07-25',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Active',
      remainingAmount: 42000,
      nextDueDate: '2023-07-25',
      loanOfficer: 'Priya Sharma'
    },
    {
      id: 'L1006',
      customerId: 'C006',
      customer: 'Reddy Supermarkets',
      riceType: 'White Rice',
      quantity: 400,
      amount: 24000,
      issueDate: '2023-05-28',
      dueDate: '2023-07-28',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Active',
      remainingAmount: 24000,
      nextDueDate: '2023-07-28',
      loanOfficer: 'Amit Patel'
    },
    {
      id: 'L1007',
      customerId: 'C007',
      customer: 'Joshi Brothers',
      riceType: 'Basmati Rice',
      quantity: 550,
      amount: 46750,
      issueDate: '2023-04-15',
      dueDate: '2023-06-15',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Overdue',
      remainingAmount: 46750,
      nextDueDate: '2023-06-15',
      overdueDays: 25,
      loanOfficer: 'Rajesh Mehta'
    },
    {
      id: 'L1008',
      customerId: 'C008',
      customer: 'Verma Distributors',
      riceType: 'Premium Basmati Rice',
      quantity: 700,
      amount: 59500,
      issueDate: '2023-05-01',
      dueDate: '2023-07-01',
      interestRate: '12%',
      repaymentTerm: '60 days',
      status: 'Active',
      remainingAmount: 59500,
      nextDueDate: '2023-07-01',
      loanOfficer: 'Priya Sharma'
    }
  ]
};

// Loan Collection data
export const mockLoanCollectionData = {
  collectionSummary: {
    totalDue: 248250,
    collectedThisMonth: 125000,
    pendingCollections: 123250,
    collectionRate: '67%',
    overdueAmount: 66250
  },
  pendingCollections: [
    {
      id: 'LC001',
      loanId: 'L1001',
      customer: 'Sharma Foods Ltd',
      dueDate: '2023-07-10',
      dueAmount: 42500,
      status: 'Upcoming',
      contactPerson: 'Mr. Sharma',
      contactNumber: '+91 98765 43210'
    },
    {
      id: 'LC002',
      loanId: 'L1002',
      customer: 'Kumar Restaurants',
      dueDate: '2023-06-15',
      dueAmount: 19500,
      status: 'Overdue',
      overdueDays: 15,
      contactPerson: 'Mr. Kumar',
      contactNumber: '+91 98765 43211',
      lastContact: '2023-06-20'
    },
    {
      id: 'LC003',
      loanId: 'L1003',
      customer: 'Patel Grocery Chain',
      dueDate: '2023-07-20',
      dueAmount: 23750,
      status: 'Upcoming',
      contactPerson: 'Mr. Patel',
      contactNumber: '+91 98765 43212'
    },
    {
      id: 'LC004',
      loanId: 'L1005',
      customer: 'Gupta Wholesalers',
      dueDate: '2023-07-25',
      dueAmount: 42000,
      status: 'Upcoming',
      contactPerson: 'Mr. Gupta',
      contactNumber: '+91 98765 43214'
    },
    {
      id: 'LC005',
      loanId: 'L1006',
      customer: 'Reddy Supermarkets',
      dueDate: '2023-07-28',
      dueAmount: 24000,
      status: 'Upcoming',
      contactPerson: 'Mr. Reddy',
      contactNumber: '+91 98765 43215'
    },
    {
      id: 'LC006',
      loanId: 'L1007',
      customer: 'Joshi Brothers',
      dueDate: '2023-06-15',
      dueAmount: 46750,
      status: 'Overdue',
      overdueDays: 25,
      contactPerson: 'Mr. Joshi',
      contactNumber: '+91 98765 43216',
      lastContact: '2023-06-25'
    },
    {
      id: 'LC007',
      loanId: 'L1008',
      customer: 'Verma Distributors',
      dueDate: '2023-07-01',
      dueAmount: 59500,
      status: 'Upcoming',
      contactPerson: 'Mr. Verma',
      contactNumber: '+91 98765 43217'
    }
  ],
  collectionHistory: [
    {
      id: 'CH001',
      loanId: 'L1003',
      customer: 'Patel Grocery Chain',
      collectionDate: '2023-06-10',
      amount: 10000,
      method: 'Bank Transfer',
      collectedBy: 'Amit Patel',
      receiptNo: 'RCPT-2023-001'
    },
    {
      id: 'CH002',
      loanId: 'L1004',
      customer: 'Singh Exports',
      collectionDate: '2023-06-05',
      amount: 68000,
      method: 'Cheque',
      collectedBy: 'Rajesh Mehta',
      receiptNo: 'RCPT-2023-002'
    },
    {
      id: 'CH003',
      loanId: 'L1001',
      customer: 'Sharma Foods Ltd',
      collectionDate: '2023-05-25',
      amount: 25000,
      method: 'Cash',
      collectedBy: 'Priya Sharma',
      receiptNo: 'RCPT-2023-003'
    },
    {
      id: 'CH004',
      loanId: 'L1002',
      customer: 'Kumar Restaurants',
      collectionDate: '2023-05-20',
      amount: 5000,
      method: 'UPI',
      collectedBy: 'Amit Patel',
      receiptNo: 'RCPT-2023-004'
    }
  ]
};

// Settled Loans data
export const mockSettledLoansData = {
  settledLoans: [
    {
      id: 'L1004',
      customer: 'Singh Exports',
      riceType: 'Premium Basmati Rice',
      quantity: 800,
      loanAmount: 68000,
      interest: 6800,
      totalAmount: 74800,
      issueDate: '2023-04-05',
      dueDate: '2023-06-05',
      settlementDate: '2023-06-05',
      settlementAmount: 74800,
      status: 'Fully Settled',
      profit: 6800,
      loanOfficer: 'Rajesh Mehta'
    },
    {
      id: 'L2001',
      customer: 'Mehta Traders',
      riceType: 'Brown Rice',
      quantity: 350,
      loanAmount: 22750,
      interest: 2275,
      totalAmount: 25025,
      issueDate: '2023-03-10',
      dueDate: '2023-05-10',
      settlementDate: '2023-05-08',
      settlementAmount: 25025,
      status: 'Early Settlement',
      profit: 2275,
      loanOfficer: 'Priya Sharma'
    },
    {
      id: 'L2002',
      customer: 'Choudhary Enterprises',
      riceType: 'Jasmine Rice',
      quantity: 600,
      loanAmount: 45000,
      interest: 4500,
      totalAmount: 49500,
      issueDate: '2023-02-15',
      dueDate: '2023-04-15',
      settlementDate: '2023-04-20',
      settlementAmount: 49500,
      status: 'Settled',
      profit: 4500,
      loanOfficer: 'Amit Patel'
    },
    {
      id: 'L2003',
      customer: 'Aggarwal Stores',
      riceType: 'Sona Masoori Rice',
      quantity: 400,
      loanAmount: 28000,
      interest: 2800,
      totalAmount: 30800,
      issueDate: '2023-01-20',
      dueDate: '2023-03-20',
      settlementDate: '2023-03-15',
      settlementAmount: 30800,
      status: 'Early Settlement',
      profit: 2800,
      loanOfficer: 'Rajesh Mehta'
    },
    {
      id: 'L2004',
      customer: 'Malhotra Foods',
      riceType: 'Premium Basmati Rice',
      quantity: 550,
      loanAmount: 46750,
      interest: 4675,
      totalAmount: 51425,
      issueDate: '2022-12-05',
      dueDate: '2023-02-05',
      settlementDate: '2023-02-10',
      settlementAmount: 51425,
      status: 'Settled',
      profit: 4675,
      loanOfficer: 'Priya Sharma'
    }
  ],
  settlementStats: {
    totalSettled: 5,
    totalAmount: 231550,
    totalProfit: 21050,
    earlySettlements: 2,
    onTimeSettlements: 3
  }
};
// Orders data
export const mockOrdersData = {
  recentOrders: [{
    id: '10248',
    customer: 'Sharma Foods Ltd',
    product: 'Premium Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '45,600',
    status: 'Completed',
    date: '2023-06-15'
  }, {
    id: '10249',
    customer: 'Patel Grocery Chain',
    product: 'Brown Rice',
    address: '123 Market St, Mumbai',
    amount: '32,450',
    status: 'Pending',
    date: '2023-06-16'
  }, {
    id: '10250',
    customer: 'Singh Exports',
    product: 'Premium Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '78,900',
    status: 'Processing',
    date: '2023-06-16'
  }, {
    id: '10251',
    customer: 'Kumar Restaurants',
    product: 'Jasmine Rice',
    address: '123 Market St, Mumbai',
    amount: '12,750',
    status: 'Completed',
    date: '2023-06-17'
  }, {
    id: '10252',
    customer: 'Gupta Wholesalers',
    product: 'Sona Masoori Rice',
    address: '123 Market St, Mumbai',
    amount: '56,200',
    status: 'Cancelled',
    date: '2023-06-17'
  }],
  allOrders: [{
    id: '10248',
    customer: 'Sharma Foods Ltd',
    product: 'Premium Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '45,600',
    status: 'Completed',
    date: '2023-06-15'
  }, {
    id: '10249',
    customer: 'Patel Grocery Chain',
    product: 'Brown Rice',
    address: '123 Market St, Mumbai',
    amount: '32,450',
    status: 'Pending',
    date: '2023-06-16'
  }, {
    id: '10250',
    customer: 'Singh Exports',
    product: 'Premium Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '78,900',
    status: 'Processing',
    date: '2023-06-16'
  }, {
    id: '10251',
    customer: 'Kumar Restaurants',
    product: 'Jasmine Rice',
    address: '123 Market St, Mumbai',
    amount: '12,750',
    status: 'Completed',
    date: '2023-06-17'
  }, {
    id: '10252',
    customer: 'Gupta Wholesalers',
    product: 'Sona Masoori Rice',
    address: '123 Market St, Mumbai',
    amount: '56,200',
    status: 'Cancelled',
    date: '2023-06-17'
  }, {
    id: '10253',
    customer: 'Reddy Supermarkets',
    product: 'White Rice',
    address: '123 Market St, Mumbai',
    amount: '23,450',
    status: 'Completed',
    date: '2023-06-18'
  }, {
    id: '10254',
    customer: 'Joshi Brothers',
    product: 'Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '67,800',
    status: 'Processing',
    date: '2023-06-18'
  }, {
    id: '10255',
    customer: 'Verma Distributors',
    product: 'Premium Basmati Rice',
    address: '123 Market St, Mumbai',
    amount: '89,600',
    status: 'Pending',
    date: '2023-06-19'
  }, {
    id: '10256',
    customer: 'Sharma Foods Ltd',
    product: 'Brown Rice',
    address: '123 Market St, Mumbai',
    amount: '34,500',
    status: 'Completed',
    date: '2023-06-19'
  }, {
    id: '10257',
    customer: 'Patel Grocery Chain',
    product: 'Jasmine Rice',
    address: '123 Market St, Mumbai',
    amount: '22,300',
    status: 'Processing',
    date: '2023-06-20'
  }]
};
// Inventory data
export const mockInventoryData = {
  summary: [{
    product: 'Premium Basmati Rice',
    category: 'Processed Rice',
    quantity: '5,600',
    status: 'In Stock'
  }, {
    product: 'Brown Rice',
    category: 'Processed Rice',
    quantity: '2,300',
    status: 'Low'
  }, {
    product: 'Jasmine Rice',
    category: 'Processed Rice',
    quantity: '3,450',
    status: 'In Stock'
  }, {
    product: 'Raw Paddy',
    category: 'Raw Rice',
    quantity: '12,500',
    status: 'In Stock'
  }],
  allItems: [{
    id: 1,
    product: 'Premium Basmati Rice',
    category: 'Processed Rice',
    quantity: '5,600',
    unitPrice: '85',
    status: 'In Stock',
    lastUpdated: '2023-06-15'
  }, {
    id: 2,
    product: 'Brown Rice',
    category: 'Processed Rice',
    quantity: '2,300',
    unitPrice: '65',
    status: 'Low',
    lastUpdated: '2023-06-16'
  }, {
    id: 3,
    product: 'Jasmine Rice',
    category: 'Processed Rice',
    quantity: '3,450',
    unitPrice: '75',
    status: 'In Stock',
    lastUpdated: '2023-06-14'
  }, {
    id: 4,
    product: 'Raw Paddy',
    category: 'Raw Rice',
    quantity: '12,500',
    unitPrice: '40',
    status: 'In Stock',
    lastUpdated: '2023-06-12'
  }, {
    id: 5,
    product: 'Sona Masoori Rice',
    category: 'Processed Rice',
    quantity: '4,200',
    unitPrice: '70',
    status: 'In Stock',
    lastUpdated: '2023-06-13'
  }, {
    id: 6,
    product: 'Rice Bran',
    category: 'By-products',
    quantity: '1,800',
    unitPrice: '25',
    status: 'In Stock',
    lastUpdated: '2023-06-15'
  }, {
    id: 7,
    product: 'Rice Husk',
    category: 'By-products',
    quantity: '2,100',
    unitPrice: '15',
    status: 'In Stock',
    lastUpdated: '2023-06-15'
  }, {
    id: 8,
    product: '5kg Packaging Bags',
    category: 'Packaging',
    quantity: '8,500',
    unitPrice: '5',
    status: 'In Stock',
    lastUpdated: '2023-06-10'
  }, {
    id: 9,
    product: '10kg Packaging Bags',
    category: 'Packaging',
    quantity: '6,200',
    unitPrice: '8',
    status: 'In Stock',
    lastUpdated: '2023-06-10'
  }, {
    id: 10,
    product: '25kg Packaging Bags',
    category: 'Packaging',
    quantity: '4,500',
    unitPrice: '15',
    status: 'Low',
    lastUpdated: '2023-06-11'
  }]
};
// Loan Management data
export const mockLoanData = {
  summary: {
    totalLoans: '24',
    activeLoans: '18',
    overdueLoans: '3',
    totalAmount: '645,800' 
  },
  recentLoans: [{
    id: 'L1001',
    customer: 'Sharma Foods Ltd',
    riceType: 'Premium Basmati Rice',
    quantity: '500',
    amount: '42,500',
    issueDate: '2023-05-10',
    dueDate: '2023-07-10',
    status: 'Active'
  }, {
    id: 'L1002',
    customer: 'Kumar Restaurants',
    riceType: 'Brown Rice',
    quantity: '300',
    amount: '19,500',
    issueDate: '2023-05-15',
    dueDate: '2023-06-15',
    status: 'Overdue'
  }, {
    id: 'L1003',
    customer: 'Patel Grocery Chain',
    riceType: 'Jasmine Rice',
    quantity: '450',
    amount: '33,750',
    issueDate: '2023-05-20',
    dueDate: '2023-07-20',
    status: 'Partially Repaid'
  }],
  allLoans: [{
    id: 'L1001',
    customer: 'Sharma Foods Ltd',
    riceType: 'Premium Basmati Rice',
    quantity: '500',
    amount: '42,500',
    issueDate: '2023-05-10',
    dueDate: '2023-07-10',
    status: 'Active',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1002',
    customer: 'Kumar Restaurants',
    riceType: 'Brown Rice',
    quantity: '300',
    amount: '19,500',
    issueDate: '2023-05-15',
    dueDate: '2023-06-15',
    status: 'Overdue',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1003',
    customer: 'Patel Grocery Chain',
    riceType: 'Jasmine Rice',
    quantity: '450',
    amount: '33,750',
    issueDate: '2023-05-20',
    dueDate: '2023-07-20',
    status: 'Partially Repaid',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1004',
    customer: 'Singh Exports',
    riceType: 'Premium Basmati Rice',
    quantity: '800',
    amount: '68,000',
    issueDate: '2023-04-05',
    dueDate: '2023-06-05',
    status: 'Fully Repaid',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1005',
    customer: 'Gupta Wholesalers',
    riceType: 'Sona Masoori Rice',
    quantity: '600',
    amount: '42,000',
    issueDate: '2023-05-25',
    dueDate: '2023-07-25',
    status: 'Active',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1006',
    customer: 'Reddy Supermarkets',
    riceType: 'White Rice',
    quantity: '400',
    amount: '24,000',
    issueDate: '2023-05-28',
    dueDate: '2023-07-28',
    status: 'Active',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1007',
    customer: 'Joshi Brothers',
    riceType: 'Basmati Rice',
    quantity: '550',
    amount: '46,750',
    issueDate: '2023-04-15',
    dueDate: '2023-06-15',
    status: 'Overdue',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }, {
    id: 'L1008',
    customer: 'Verma Distributors',
    riceType: 'Premium Basmati Rice',
    quantity: '700',
    amount: '59,500',
    issueDate: '2023-05-01',
    dueDate: '2023-07-01',
    status: 'Active',
      remainingAmount: '42500', // Add this field
      collectedAmount: '0',
  }]
};
// Add to mockData.jsx

// Dashboard specific data
export const mockDashboardData = {
  // Today Summary KPIs
  todaySummary: {
    totalRiceStock: {
      bags: 325,
      kg: 16250,
      description: "All rice types total"
    },
    todayProduction: {
      kg: 3250,
      machines: 2,
      description: "2 machines running"
    },
    todaySales: {
      amount: 185000,
      orders: 12,
      description: "12 orders completed"
    },
    pendingCollections: {
      amount: 74500,
      customers: 9,
      description: "From 9 customers"
    },
    workers: {
      present: 18,
      total: 22,
      absent: 4,
      description: "4 absent"
    },
    vehicles: {
      active: 2,
      description: "2 trips running"
    }
  },

  // Rice Stock Overview
  riceStock: [
    {
      type: "Nadu",
      bags: 120,
      kg: 6000,
      status: "Enough",
      statusColor: "green"
    },
    {
      type: "Samba",
      bags: 80,
      kg: 4000,
      status: "Getting Low",
      statusColor: "yellow"
    },
    {
      type: "Raw",
      bags: 60,
      kg: 3000,
      status: "Enough",
      statusColor: "green"
    },
    {
      type: "Broken",
      bags: 65,
      kg: 3250,
      status: "Very Low",
      statusColor: "red"
    }
  ],

  stockLifespan: {
    days: 6,
    message: "Based on last week's sales"
  },

  // Today's Sales
  todaysSales: [
    {
      time: "3:45 PM",
      customer: "S. Rahman Traders",
      type: "Nadu",
      quantity: "50 Bags",
      amount: "40,000"
    },
    {
      time: "1:20 PM",
      customer: "New City Stores",
      type: "Samba",
      quantity: "30 Bags",
      amount: "28,000"
    },
    {
      time: "11:10 AM",
      customer: "Jaffna Traders",
      type: "Raw",
      quantity: "40 Bags",
      amount: "32,000"
    }
  ],

  // Loan Customers
  loanCustomers: [
    {
      customer: "Jaffna Traders",
      amountDue: "25,000",
      lastPaid: "12 Nov"
    },
    {
      customer: "City Super",
      amountDue: "18,000",
      lastPaid: "10 Nov"
    },
    {
      customer: "Rahman Stores",
      amountDue: "12,500",
      lastPaid: "8 Nov"
    }
  ],

  // Transport Today
  transportToday: [
    {
      id: "Lorry #01",
      status: "On the way to Jaffna",
      driver: "Kumar",
      lastUpdated: "5 mins ago",
      load: "80 Bags",
      statusType: "active"
    },
    {
      id: "Lorry #02",
      status: "Returned to Mill",
      driver: "Imran",
      lastUpdated: "2 hours ago",
      load: "Completed trip",
      statusType: "completed"
    }
  ],

  // Worker Status
  workerStatus: {
    present: [
      { name: "Rahim", time: "8:05 AM" },
      { name: "Kumar", time: "8:10 AM" },
      { name: "Jaffar", time: "8:15 AM" }
    ],
    absent: [
      { name: "Siva", reason: "Sick Leave" },
      { name: "Manoj", reason: "Personal" },
      { name: "Akram", reason: "Unknown" }
    ]
  },

  // Alerts & Warnings
  alerts: [
    {
      type: "critical",
      message: "Broken rice only 10 bags left",
      icon: "🔴"
    },
    {
      type: "critical",
      message: "Jaffna Traders pending payment for 15 days (LKR 25,000)",
      icon: "🔴"
    },
    {
      type: "warning",
      message: "Lorry #1 stopped in same place for 30 minutes",
      icon: "🟡"
    },
    {
      type: "warning",
      message: "Samba rice getting low",
      icon: "🟡"
    },
    {
      type: "good",
      message: "Today's sales are 20% higher than yesterday",
      icon: "🟢"
    },
    {
      type: "good",
      message: "Rice stock enough for next 7 days",
      icon: "🟢"
    }
  ],

  // Today's Activity Timeline
  activityTimeline: [
    {
      time: "3:45 PM",
      activity: "Sold 50 Bags Nadu – LKR 40,000",
      type: "sale"
    },
    {
      time: "2:30 PM",
      activity: "Lorry #02 returned from Mannar trip",
      type: "delivery"
    },
    {
      time: "1:20 PM",
      activity: "Sold 30 Bags Samba – LKR 28,000",
      type: "sale"
    },
    {
      time: "10:00 AM",
      activity: "Added 100 Bags Raw Rice to stock",
      type: "inventory"
    },
    {
      time: "8:15 AM",
      activity: "Worker attendance updated",
      type: "attendance"
    }
  ]
};
// Delivery Tracking data
export const mockDeliveryData = {
  summary: {
    active: '12',
    completedToday: '8',
    delayed: '2',
    availableDrivers: '5'
  },
  allDeliveries: [{
    id: 'D1001',
    orderId: '10248',
    customer: 'Sharma Foods Ltd',
    driver: 'Rajesh Kumar',
    vehicle: 'MH-01-AB-1234',
    departure: '2023-06-15 08:30 AM',
    eta: '2023-06-15 10:30 AM',
    status: 'Delivered'
  }, {
    id: 'D1002',
    orderId: '10249',
    customer: 'Patel Grocery Chain',
    driver: 'Suresh Patel',
    vehicle: 'MH-01-CD-5678',
    departure: '2023-06-16 09:15 AM',
    eta: '2023-06-16 11:45 AM',
    status: 'In Transit'
  }, {
    id: 'D1003',
    orderId: '10250',
    customer: 'Singh Exports',
    driver: 'Amit Singh',
    vehicle: 'MH-01-EF-9012',
    departure: '2023-06-16 10:00 AM',
    eta: '2023-06-16 01:30 PM',
    status: 'Loading'
  }, {
    id: 'D1004',
    orderId: '10251',
    customer: 'Kumar Restaurants',
    driver: 'Vijay Kumar',
    vehicle: 'MH-01-GH-3456',
    departure: '2023-06-17 08:00 AM',
    eta: '2023-06-17 09:30 AM',
    status: 'Delivered'
  }, {
    id: 'D1005',
    orderId: '10252',
    customer: 'Gupta Wholesalers',
    driver: 'Ramesh Gupta',
    vehicle: 'MH-01-IJ-7890',
    departure: '2023-06-17 11:30 AM',
    eta: '2023-06-17 02:30 PM',
    status: 'Delayed'
  }, {
    id: 'D1006',
    orderId: '10253',
    customer: 'Reddy Supermarkets',
    driver: 'Krishna Reddy',
    vehicle: 'MH-01-KL-1234',
    departure: '2023-06-18 09:45 AM',
    eta: '2023-06-18 12:15 PM',
    status: 'Delivered'
  }, {
    id: 'D1007',
    orderId: '10254',
    customer: 'Joshi Brothers',
    driver: 'Dinesh Joshi',
    vehicle: 'MH-01-MN-5678',
    departure: '2023-06-18 10:30 AM',
    eta: '2023-06-18 01:00 PM',
    status: 'In Transit'
  }, {
    id: 'D1008',
    orderId: '10255',
    customer: 'Verma Distributors',
    driver: 'Rakesh Verma',
    vehicle: 'MH-01-OP-9012',
    departure: '2023-06-19 08:15 AM',
    eta: '2023-06-19 11:45 AM',
    status: 'Delayed'
  }]
};
// Worker Management data
export const mockWorkerData = {
  summary: {
    total: '32',
    present: '28',
    absent: '4',
    presentPercentage: '87.5',
    absentPercentage: '12.5',
    monthlyPayroll: '245,600'
  },
  allWorkers: [{
    id: 'W001',
    name: 'Rajesh Kumar',
    role: 'Driver',
    contact: '9876543210',
    dailyWage: '800',
    joinDate: '2021-03-15',
    status: 'Present'
  }, {
    id: 'W002',
    name: 'Suresh Patel',
    role: 'Driver',
    contact: '9876543211',
    dailyWage: '800',
    joinDate: '2021-05-20',
    status: 'Present'
  }, {
    id: 'W003',
    name: 'Amit Singh',
    role: 'Loader',
    contact: '9876543212',
    dailyWage: '500',
    joinDate: '2022-01-10',
    status: 'Absent'
  }, {
    id: 'W004',
    name: 'Vijay Kumar',
    role: 'Machine Operator',
    contact: '9876543213',
    dailyWage: '700',
    joinDate: '2021-08-05',
    status: 'Present'
  }, {
    id: 'W005',
    name: 'Ramesh Gupta',
    role: 'Cleaner',
    contact: '9876543214',
    dailyWage: '450',
    joinDate: '2022-03-12',
    status: 'Present'
  }, {
    id: 'W006',
    name: 'Krishna Reddy',
    role: 'Supervisor',
    contact: '9876543215',
    dailyWage: '1000',
    joinDate: '2020-11-18',
    status: 'Present'
  }, {
    id: 'W007',
    name: 'Dinesh Joshi',
    role: 'Loader',
    contact: '9876543216',
    dailyWage: '500',
    joinDate: '2022-02-22',
    status: 'On Leave'
  }, {
    id: 'W008',
    name: 'Rakesh Verma',
    role: 'Machine Operator',
    contact: '9876543217',
    dailyWage: '700',
    joinDate: '2021-09-30',
    status: 'Present'
  }]
};
// AI Insights data
// AI Insights data - CORRECTED VERSION
export const mockAIData = {
  // These should be at the root level (not inside aiAnalysis)
  stockRecommendations: [
    {
      product: "Basmati Rice",
      recommendation: "Reduce stock by 15% - current levels too high",
      action: "Decrease",
      priority: "Medium"
    },
    {
      product: "Sona Masoori",
      recommendation: "Increase stock by 25% - high demand predicted",
      action: "Increase",
      priority: "High"
    },
    {
      product: "Brown Rice",
      recommendation: "Maintain current levels - stable demand",
      action: "Maintain",
      priority: "Low"
    },
    {
      product: "Jasmine Rice",
      recommendation: "Stock up for upcoming festival season",
      action: "Increase",
      priority: "High"
    },
    {
      product: "Red Rice",
      recommendation: "Reduce procurement due to low demand",
      action: "Decrease",
      priority: "Medium"
    }
  ],

  salesInsights: [
    {
      title: "Premium Rice Growth",
      insight: "Premium rice varieties showing 25% growth month-over-month",
      trend: "Up"
    },
    {
      title: "Bulk Order Decline",
      insight: "Large bulk orders decreased by 15% this quarter",
      trend: "Down"
    },
    {
      title: "New Customer Acquisition",
      insight: "15 new restaurants added as customers this month",
      trend: "Up"
    },
    {
      title: "Seasonal Demand Pattern",
      insight: "Festival season expected to boost sales by 30% next month",
      trend: "Up"
    },
    {
      title: "Payment Cycle Optimization",
      insight: "Average payment collection time reduced from 45 to 32 days",
      trend: "Up"
    }
  ],

  loanRisks: [
    {
      customer: "Kumar Restaurants",
      assessment: "Payment delayed by 15 days, showing cash flow issues",
      outstandingAmount: "19500",
      riskLevel: "High"
    },
    {
      customer: "Joshi Brothers",
      assessment: "Multiple payment reminders sent, high risk of default",
      outstandingAmount: "46750",
      riskLevel: "High"
    },
    {
      customer: "Gupta Wholesalers",
      assessment: "Payment pattern shows occasional delays",
      outstandingAmount: "42000",
      riskLevel: "Medium"
    },
    {
      customer: "Patel Grocery Chain",
      assessment: "Regular payments but slight delays in recent months",
      outstandingAmount: "23750",
      riskLevel: "Medium"
    }
  ],

  seasonalForecasts: [
    {
      season: "Festival Season (Oct-Dec)",
      forecast: "Expected 40% increase in demand for premium and aromatic rice varieties",
      topProducts: ["Premium Basmati Rice", "Jasmine Rice", "Saffron Rice"]
    },
    {
      season: "Wedding Season (Jan-Mar)",
      forecast: "High demand for bulk orders and premium packaging options",
      topProducts: ["Premium Basmati Rice", "Sona Masoori", "Special Gift Packs"]
    },
    {
      season: "Summer (Apr-Jun)",
      forecast: "Increased demand for lighter rice varieties and health-focused products",
      topProducts: ["Brown Rice", "Red Rice", "Quinoa Mix"]
    },
    {
      season: "Monsoon (Jul-Sep)",
      forecast: "Stable demand with focus on essential rice varieties",
      topProducts: ["Sona Masoori", "White Rice", "Regular Basmati"]
    }
  ],

  // Your existing AI data continues here...
  stockPredictions: [
    {
      product: "Basmati Rice",
      category: "Premium",
      currentStock: 1500,
      minStock: 500,
      maxStock: 2000,
      dailyUsage: 50,
      predictedChange: -15,
      confidence: 88,
      recommendation: "Reduce procurement by 20% for next month",
      history: [
        { date: "Jan", stock: 1800, minStock: 500 },
        { date: "Feb", stock: 1700, minStock: 500 },
        { date: "Mar", stock: 1600, minStock: 500 },
        { date: "Apr", stock: 1500, minStock: 500 }
      ]
    },
    {
      product: "Sona Masoori",
      category: "Regular",
      currentStock: 800,
      minStock: 400,
      maxStock: 1200,
      dailyUsage: 35,
      predictedChange: 25,
      confidence: 92,
      recommendation: "Increase stock by 30% to meet rising demand",
      history: [
        { date: "Jan", stock: 600, minStock: 400 },
        { date: "Feb", stock: 650, minStock: 400 },
        { date: "Mar", stock: 700, minStock: 400 },
        { date: "Apr", stock: 800, minStock: 400 }
      ]
    }
    // ... rest of your stockPredictions
  ],

  smartInsights: [
    {
      title: "Rice Quality Improvement",
      description: "Implement quality checks to reduce returns by 25%",
      type: "efficiency",
      impact: "high",
      confidence: 92,
      category: "operations",
      applied: false
    },
    {
      title: "Seasonal Demand Planning",
      description: "Prepare for 30% demand increase in premium rice varieties",
      type: "opportunity",
      impact: "medium",
      confidence: 85,
      category: "sales",
      applied: false
    }
  ],

  salesPredictions: [
    {
      period: "Next Month",
      type: "Monthly",
      predictedSales: 450000,
      actualSales: 420000,
      growthRate: 7.1,
      confidence: 85,
      products: 12,
      recommendation: "Focus on premium rice varieties for higher margins",
      factors: [
        "Seasonal demand increase",
        "New customer acquisition",
        "Competitor pricing changes"
      ],
      history: [
        { period: "Jan", actual: 380000 },
        { period: "Feb", actual: 395000 },
        { period: "Mar", actual: 420000 },
        { period: "Apr", predicted: 450000 }
      ]
    }
  ],

  riskAlerts: [
    {
      id: "1",
      title: "Low Stock Alert - Sona Masoori",
      description: "Stock levels below minimum threshold. Risk of stock-out in 7 days.",
      severity: "high",
      category: "inventory",
      probability: 85,
      impact: "operational",
      status: "new",
      timestamp: "2 hours ago",
      actions: [
        "Place immediate procurement order",
        "Check alternative suppliers",
        "Adjust production schedule"
      ],
      relatedData: "Current stock: 450 units, Min required: 800 units"
    }
  ],

  // Keep aiAnalysis separate for other components
  aiAnalysis: {
    businessHealth: { score: 85, trend: 12 },
    growthPotential: 23,
    riskLevel: 'medium',
    efficiencyScore: 78,
    keyInsights: [
      {
        title: "Inventory Optimization Opportunity",
        description: "Reduce Basmati rice stock by 15% to optimize storage costs",
        impact: "high",
        category: "inventory"
      }
    ],
    riskAnalysis: [
      {
        area: "Loan Default",
        description: "3 customers showing signs of payment delay",
        level: "high",
        probability: 65,
        impact: "financial"
      }
    ],
    recentOrders: [
      {
        id: '10248',
        customer: 'Sharma Foods Ltd',
        product: 'Premium Basmati Rice',
        quantity: '50 Bags',
        amount: '45,600',
        status: 'Completed',
        date: '2023-06-15'
      }
      // ... rest of recentOrders
    ],
    performanceMetrics: [
      { label: "Sales Growth", value: "+18%", change: 18 },
      { label: "Inventory Turnover", value: "4.2x", change: 5 },
      { label: "Customer Retention", value: "92%", change: 3 },
      { label: "Operational Cost", value: "-8%", change: -8 }
    ],
    recommendations: [
      {
        title: "Optimize Rice Stock Levels",
        description: "Adjust inventory based on predicted demand patterns",
        priority: "high",
        expectedImpact: "Reduce storage cost by 15%"
      }
    ]
  }
};
// Add these to your existing mockData.jsx file:

// KPI Data
export const mockKpiData = {
  totalStock: { 
    value: 12500, 
    raw: 7000, 
    polished: 4200, 
    broken: 1300 
  },
  todayPurchases: { 
    value: 245000, 
    count: 12 
  },
  pendingPayments: { 
    value: 89000, 
    count: 8 
  },
  todaySales: { 
    value: 152500, 
    count: 15 
  },
  activeVehicles: { 
    value: 6, 
    total: 10 
  },
  qualityAlerts: { 
    value: 3 
  },
  dispatchesToday: { 
    value: 8 
  }
};

// Stock Trend Data
export const mockStockTrendData = [
  { date: 'Jan', value: 12000 },
  { date: 'Feb', value: 11500 },
  { date: 'Mar', value: 12500 },
  { date: 'Apr', value: 12200 },
  { date: 'May', value: 12800 },
  { date: 'Jun', value: 12500 }
];

// Purchase Sales Data
export const mockPurchaseSalesData = {
  purchases: [120000, 90000, 150000, 130000, 180000, 140000, 100000],
  sales: [80000, 120000, 90000, 160000, 140000, 110000, 130000],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

// Recent Transactions
export const mockRecentTransactions = [
  {
    id: 'T001',
    time: '10:30 AM',
    type: 'Purchase',
    product: 'Raw Paddy',
    supplier: 'Kumar Farms',
    amount: '₹125,000',
    status: 'Completed',
  },
  {
    id: 'T002',
    time: '11:45 AM',
    type: 'Sale',
    product: 'Premium Basmati',
    supplier: 'Sharma Foods',
    amount: '₹85,000',
    status: 'Completed',
  },
  {
    id: 'T003',
    time: '2:15 PM',
    type: 'Purchase',
    product: 'Sona Masoori',
    supplier: 'Patel Mills',
    amount: '₹92,000',
    status: 'Pending',
  },
  {
    id: 'T004',
    time: '3:30 PM',
    type: 'Sale',
    product: 'Brown Rice',
    supplier: 'Green Grocers',
    amount: '₹45,000',
    status: 'Completed',
  },
  {
    id: 'T005',
    time: '4:45 PM',
    type: 'Purchase',
    product: 'Packaging Bags',
    supplier: 'Packaging Co.',
    amount: '₹18,500',
    status: 'Completed',
  },
];

// Quality Tests
export const mockQualityTests = [
  {
    id: 'QC001',
    lotId: 'LOT-2023-156',
    product: 'Premium Basmati',
    moisture: '13.2%',
    broken: '2.1%',
    status: 'pass',
    time: '10:30 AM',
  },
  {
    id: 'QC002',
    lotId: 'LOT-2023-157',
    product: 'Sona Masoori',
    moisture: '15.8%',
    broken: '1.8%',
    status: 'fail',
    time: '11:45 AM',
  },
  {
    id: 'QC003',
    lotId: 'LOT-2023-158',
    product: 'Brown Rice',
    moisture: '12.5%',
    broken: '3.2%',
    status: 'warning',
    time: '2:15 PM',
  },
  {
    id: 'QC004',
    lotId: 'LOT-2023-159',
    product: 'Jasmine Rice',
    moisture: '14.1%',
    broken: '1.5%',
    status: 'pass',
    time: '3:30 PM',
  },
];

// Vehicles
export const mockVehicles = [
  {
    id: 'V001',
    plate: 'MH-01-AB-1234',
    driver: 'Rajesh Kumar',
    status: 'active',
    location: 'Near Bandra',
    eta: '15 mins',
    load: '80 Bags',
    contact: '98765 43210',
  },
  {
    id: 'V002',
    plate: 'MH-01-CD-5678',
    driver: 'Suresh Patel',
    status: 'idle',
    location: 'At Mill',
    eta: '-',
    load: 'Empty',
    contact: '98765 43211',
  },
  {
    id: 'V003',
    plate: 'MH-01-EF-9012',
    driver: 'Amit Singh',
    status: 'active',
    location: 'Thane Highway',
    eta: '45 mins',
    load: '120 Bags',
    contact: '98765 43212',
  },
];

// Suppliers
export const mockSuppliers = [
  {
    id: 'S001',
    name: 'Kumar Farms',
    contact: '98765 43210',
    supplied: '125,000 kg',
    balance: '₹85,000',
    rating: '4.8',
    lastDelivery: 'Today',
  },
  {
    id: 'S002',
    name: 'Patel Mills',
    contact: '98765 43211',
    supplied: '98,500 kg',
    balance: '₹45,000',
    rating: '4.5',
    lastDelivery: 'Yesterday',
  },
  {
    id: 'S003',
    name: 'Green Fields',
    contact: '98765 43212',
    supplied: '156,000 kg',
    balance: '₹120,000',
    rating: '4.9',
    lastDelivery: '2 days ago',
  },
];

// Low Stock Products
export const mockLowStockProducts = [
  {
    id: 'P001',
    name: 'Premium Basmati',
    current: '450 kg',
    threshold: '500 kg',
    daysLeft: '3',
    supplier: 'Kumar Farms',
    urgency: 'high',
  },
  {
    id: 'P002',
    name: '25kg Bags',
    current: '800 bags',
    threshold: '1000 bags',
    daysLeft: '5',
    supplier: 'Packaging Co.',
    urgency: 'medium',
  },
  {
    id: 'P003',
    name: 'Brown Rice',
    current: '620 kg',
    threshold: '700 kg',
    daysLeft: '7',
    supplier: 'Patel Mills',
    urgency: 'medium',
  },
  {
    id: 'P004',
    name: 'Rice Bran',
    current: '250 kg',
    threshold: '300 kg',
    daysLeft: '2',
    supplier: 'Local Farms',
    urgency: 'high',
  },
];
// Proposal data
export const mockProposalData = {
  summary: {
    pending: '4',
    approved: '7',
    rejected: '2'
  },
  allProposals: [{
    id: 'P001',
    title: 'New Rice Milling Machine Purchase',
    category: 'Equipment',
    budget: '850,000',
    submittedDate: '2023-05-10',
    status: 'Approved'
  }, {
    id: 'P002',
    title: 'Expand Delivery Fleet - 2 New Trucks',
    category: 'Logistics',
    budget: '1,200,000',
    submittedDate: '2023-05-25',
    status: 'Pending'
  }, {
    id: 'P003',
    title: 'Solar Power Installation for Mill',
    category: 'Infrastructure',
    budget: '750,000',
    submittedDate: '2023-04-15',
    status: 'Approved'
  }, {
    id: 'P004',
    title: 'New Packaging Machinery',
    category: 'Equipment',
    budget: '450,000',
    submittedDate: '2023-06-01',
    status: 'Pending'
  }, {
    id: 'P005',
    title: 'Employee Training Program',
    category: 'Human Resources',
    budget: '120,000',
    submittedDate: '2023-05-18',
    status: 'Approved'
  }, {
    id: 'P006',
    title: 'Warehouse Expansion Project',
    category: 'Infrastructure',
    budget: '1,800,000',
    submittedDate: '2023-04-22',
    status: 'Rejected'
  }, {
    id: 'P007',
    title: 'Quality Testing Lab Setup',
    category: 'Quality Control',
    budget: '350,000',
    submittedDate: '2023-05-05',
    status: 'Approved'
  }, {
    id: 'P008',
    title: 'Marketing Campaign for Premium Rice',
    category: 'Marketing',
    budget: '250,000',
    submittedDate: '2023-06-05',
    status: 'Pending'
  }, {
    id: 'P009',
    title: 'New Rice Variety Processing Line',
    category: 'Production',
    budget: '950,000',
    submittedDate: '2023-03-15',
    status: 'Approved'
  }, {
    id: 'P010',
    title: 'Automated Inventory Management System',
    category: 'Technology',
    budget: '380,000',
    submittedDate: '2023-05-20',
    status: 'Pending'
  }, {
    id: 'P011',
    title: 'Staff Dormitory Construction',
    category: 'Infrastructure',
    budget: '650,000',
    submittedDate: '2023-04-10',
    status: 'Rejected'
  }, {
    id: 'P012',
    title: 'Rice By-product Processing Unit',
    category: 'Production',
    budget: '550,000',
    submittedDate: '2023-03-28',
    status: 'Approved'
  }, {
    id: 'P013',
    title: 'Water Recycling System',
    category: 'Sustainability',
    budget: '420,000',
    submittedDate: '2023-04-05',
    status: 'Approved'
  }]
};
// Notifications data
export const mockNotificationsData = [{
  id: 'n1',
  type: 'inventory',
  title: 'Low Stock Warning',
  message: 'Brown Rice stock is below threshold (2,300 kg remaining)',
  time: '10 minutes ago',
  read: false,
  link: '/inventory'
}, {
  id: 'n2',
  type: 'delivery',
  title: 'Delivery Delayed',
  message: 'Delivery to Gupta Wholesalers is running 45 minutes late',
  time: '1 hour ago',
  read: false,
  link: '/delivery-tracking'
}, {
  id: 'n3',
  type: 'loan',
  title: 'Loan Overdue',
  message: 'Kumar Restaurants loan payment of Rs. 19,500 is overdue by 3 days',
  time: '2 hours ago',
  read: false,
  link: '/loan-management'
}, {
  id: 'n4',
  type: 'ai',
  title: 'AI Recommendation',
  message: 'Increase Premium Basmati Rice stock by 20% for festival season',
  time: '3 hours ago',
  read: true,
  link: '/ai-insights'
}, {
  id: 'n5',
  type: 'inventory',
  title: 'Packaging Low',
  message: '25kg Packaging Bags are running low (4,500 remaining)',
  time: '5 hours ago',
  read: true,
  link: '/inventory'
}, {
  id: 'n6',
  type: 'delivery',
  title: 'Delivery Completed',
  message: 'Order #10248 successfully delivered to Sharma Foods Ltd',
  time: 'Yesterday',
  read: true,
  link: '/delivery-tracking'
}, {
  id: 'n7',
  type: 'loan',
  title: 'Loan Repayment',
  message: 'Singh Exports has fully repaid their loan of Rs. 68,000',
  time: 'Yesterday',
  read: true,
  link: '/loan-management'
}];

