import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  DollarSignIcon,
  XIcon,
  UsersIcon,
  PackageIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
} from "lucide-react";
import { mockLoanData } from "../data/loanMockData";

/* -------------------------
   Date helpers (robust)
   ------------------------- */
const normalizeDateString = (d) => {
  if (!d) return "";
  // if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  // if ISO with time
  if (d.includes("T")) return d.split("T")[0];
  // fallback: try Date parse
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// create local midnight Date for YYYY-MM-DD (avoids timezone shift)
const parseLocalDate = (dateStr) => {
  const norm = normalizeDateString(dateStr);
  if (!norm) return null;
  const [y, m, day] = norm.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
};

const formatDate = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d || isNaN(d)) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/* -------------------------
   Component
   ------------------------- */
export function LoanManagement() {
  // normalize incoming mock data so dates are consistent
  const initialLoans = (mockLoanData?.allLoans || []).map((l) => ({
    ...l,
    issueDate: normalizeDateString(l.issueDate),
    dueDate: normalizeDateString(l.dueDate),
    amount: l.amount + "", // keep as string but parse when needed
  }));

  const [loans, setLoans] = useState(initialLoans);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // default new loan: issueDate defaults to today
  const freshId = () => `LN-${Date.now().toString(36)}`;
  const todayStr = new Date().toISOString().split("T")[0];

  const [newLoan, setNewLoan] = useState({
    id: freshId(),
    customer: "",
    riceType: "",
    quantity: "",
    amount: "",
    issueDate: todayStr,
    dueDate: "",
    status: "Active",
  });

  // computed helpers
  const isLoanOverdue = (loan) => {
    if (!loan) return false;
    if (loan.status === "Fully Repaid") return false;
    const due = parseLocalDate(loan.dueDate);
    if (!due) return false;
    // end of due day
    const dueEnd = new Date(due.getTime());
    dueEnd.setHours(23, 59, 59, 999);
    return dueEnd < new Date();
  };

  const computedStatus = (loan) => (isLoanOverdue(loan) ? "Overdue" : loan.status);

  // filtered list (uses computedStatus to ensure Overdue shows up)
  const filteredLoans = loans.filter((loan) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q || loan.customer.toLowerCase().includes(q) || loan.id.toLowerCase().includes(q);
    const matchesFilter = filterStatus === "All" || computedStatus(loan) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Add loan with validation
  const handleAddLoan = () => {
    // normalize
    const issue = normalizeDateString(newLoan.issueDate || todayStr);
    const due = normalizeDateString(newLoan.dueDate);

    if (!newLoan.customer || !newLoan.riceType || !newLoan.quantity || !newLoan.amount || !due) {
      alert("Please fill all fields and set a Due Date.");
      return;
    }

    const issueDateObj = parseLocalDate(issue);
    const dueDateObj = parseLocalDate(due);
    if (!issueDateObj || !dueDateObj) {
      alert("Invalid date format.");
      return;
    }

    if (dueDateObj < issueDateObj) {
      alert("Due Date cannot be earlier than Issue Date.");
      return;
    }

    const loanToAdd = {
      ...newLoan,
      id: freshId(),
      issueDate: issue,
      dueDate: due,
      amount: newLoan.amount + "",
    };

    setLoans((s) => [...s, loanToAdd]);
    // reset form
    setNewLoan({
      id: freshId(),
      customer: "",
      riceType: "",
      quantity: "",
      amount: "",
      issueDate: todayStr,
      dueDate: "",
      status: "Active",
    });
    setIsAddOpen(false);
  };

  // Repay (mark Fully Repaid)
  const handleRepay = (id) => {
    setLoans((s) => s.map((l) => (l.id === id ? { ...l, status: "Fully Repaid" } : l)));
  };

  // StatusBadge component (keeps vertical alignment)
  const StatusBadge = ({ status, loan }) => {
    const final = status === "Overdue" || (loan && isLoanOverdue(loan)) ? "Overdue" : status;
    switch (final) {
      case "Fully Repaid":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4" /> <span>{final}</span>
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            <ClockIcon className="h-4 w-4" /> <span>{final}</span>
          </span>
        );
      case "Partially Repaid":
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            <DollarSignIcon className="h-4 w-4" /> <span>{final}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <AlertTriangleIcon className="h-4 w-4" /> <span>{final}</span>
          </span>
        );
    }
  };

  // summary based on computed status
  const totalLoans = loans.length;
  const activeLoansCount = loans.filter((l) => computedStatus(l) === "Active").length;
  const overdueLoansCount = loans.filter((l) => computedStatus(l) === "Overdue").length;
  const totalAmount = loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DollarSignIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            New Loan
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <UsersIcon className="h-6 w-6 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Total Loans</p>
            <p className="text-xl font-semibold text-gray-900">{totalLoans}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Active Loans</p>
            <p className="text-xl font-semibold text-blue-600">{activeLoansCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <AlertTriangleIcon className="h-6 w-6 text-red-600" />
          <div>
            <p className="text-sm text-gray-500">Overdue Loans</p>
            <p className="text-xl font-semibold text-red-600">{overdueLoansCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <DollarSignIcon className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-semibold text-gray-900">Rs. {totalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-1/2">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search loans by customer or ID..."
              className="block w-full pl-11 pr-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="block pl-3 pr-10 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Partially Repaid</option>
                <option>Fully Repaid</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Loan ID",
                  "Customer",
                  "Rice Type",
                  "Quantity",
                  "Amount",
                  "Issue Date",
                  "Due Date",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-middle"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 align-middle">
                  <td className="px-4 py-3 align-middle text-sm font-medium text-gray-900">{loan.id}</td>

                  <td className="px-4 py-3 align-middle text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <span>{loan.customer}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-gray-500" />
                      <span>{loan.riceType}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle text-sm text-gray-700">{loan.quantity} kg</td>

                  <td className="px-4 py-3 align-middle text-sm text-gray-700">Rs. {parseFloat(loan.amount || 0).toLocaleString("en-IN")}</td>

                <td className="px-4 py-3 align-middle text-sm text-gray-700"><CalendarIcon className="h-4 w-4 text-gray-400" />{loan.issueDate}</td>
                  

                  <td className="px-4 py-3 align-middle text-sm text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(loan.dueDate)}</span>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <StatusBadge status={loan.status} loan={loan} />
                  </td>

                  <td className="px-4 py-3 align-middle text-right text-sm">
                    <button
                      onClick={() => handleRepay(loan.id)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <DollarSignIcon className="h-4 w-4" /> Repay
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setIsViewOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Loan Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">➕ New Loan</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <XIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Customer"
                className="w-full border p-2 rounded"
                value={newLoan.customer}
                onChange={(e) => setNewLoan({ ...newLoan, customer: e.target.value })}
              />
              <input
                type="text"
                placeholder="Rice Type"
                className="w-full border p-2 rounded"
                value={newLoan.riceType}
                onChange={(e) => setNewLoan({ ...newLoan, riceType: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantity (kg)"
                className="w-full border p-2 rounded"
                value={newLoan.quantity}
                onChange={(e) => setNewLoan({ ...newLoan, quantity: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount (Rs)"
                className="w-full border p-2 rounded"
                value={newLoan.amount}
                onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
              />
              <label className="block text-sm text-gray-600">Due Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={newLoan.dueDate}
                onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
              />
              {/* inline validation preview */}
              {newLoan.dueDate && parseLocalDate(newLoan.dueDate) && parseLocalDate(newLoan.issueDate) && parseLocalDate(newLoan.dueDate) < parseLocalDate(newLoan.issueDate) && (
                <p className="text-sm text-red-600">Due Date cannot be earlier than Issue Date.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded border">
                Cancel
              </button>
              <button onClick={handleAddLoan} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                Add Loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Loan Modal */}
      {isViewOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">📄 Loan Details</h3>
              <button onClick={() => setIsViewOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <XIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-2 text-sm">
              <p><strong>Customer:</strong> {selectedLoan.customer}</p>
              <p><strong>Rice Type:</strong> {selectedLoan.riceType}</p>
              <p><strong>Quantity:</strong> {selectedLoan.quantity} kg</p>
              <p><strong>Amount:</strong> Rs. {parseFloat(selectedLoan.amount || 0).toLocaleString("en-IN")}</p>
              <p><strong>Issue Date:</strong> {formatDate(selectedLoan.issueDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(selectedLoan.dueDate)}</p>
              <p><strong>Status:</strong> <span className="ml-2"><StatusBadge status={selectedLoan.status} loan={selectedLoan} /></span></p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 rounded border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanManagement;