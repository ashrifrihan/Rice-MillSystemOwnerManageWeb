import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  TruckIcon,
  MapPinIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  RouteIcon,
  NavigationIcon,
  CameraIcon,
  FileTextIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  ArrowUpDownIcon,
  MapIcon
} from 'lucide-react';
import { mockDeliveryData } from '../data/mockData';
import toast from 'react-hot-toast';

export function DeliveryTracking() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDriver, setFilterDriver] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for deliveries and pagination
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveriesPerPage, setDeliveriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State for modals and panels
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // KPI counts
  const [kpiCounts, setKpiCounts] = useState({
    active: 0,
    completedToday: 0,
    delayed: 0,
    availableDrivers: 0
  });

  // Filter and sort deliveries
  useEffect(() => {
    let filtered = mockDeliveryData.allDeliveries.filter((delivery) => {
      const matchesSearch =
        searchTerm === '' ||
        delivery.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.orderId.toString().includes(searchTerm) ||
        delivery.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || delivery.status === filterStatus;
      const matchesDriver = filterDriver === 'All' || delivery.driver === filterDriver;
      return matchesSearch && matchesStatus && matchesDriver;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1);

    // Update KPI counts
    setKpiCounts(mockDeliveryData.summary);
  }, [searchTerm, filterStatus, filterDriver, sortConfig]);

  // Search results for dropdown
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = mockDeliveryData.allDeliveries.filter(
        delivery =>
          delivery.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.orderId.toString().includes(searchTerm) ||
          delivery.customer.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Get current deliveries for pagination
  const indexOfLastDelivery = currentPage * deliveriesPerPage;
  const indexOfFirstDelivery = indexOfLastDelivery - deliveriesPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstDelivery, indexOfLastDelivery);
  const totalPages = Math.ceil(filteredDeliveries.length / deliveriesPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Open delivery detail panel
  const openDetailPanel = (delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailPanelOpen(true);
  };

  // Open map modal
  const openMapModal = (delivery, e) => {
    e.stopPropagation();
    setSelectedDelivery(delivery);
    setIsMapModalOpen(true);
  };

  // Open proof modal
  const openProofModal = (delivery, e) => {
    e.stopPropagation();
    setSelectedDelivery(delivery);
    setIsProofModalOpen(true);
  };

  // Handle status filter from KPI cards
  const handleKpiFilter = (status) => {
    setFilterStatus(status);
  };

  // Handle export data
  const handleExport = (format) => {
    toast.success(`Delivery data exported as ${format.toUpperCase()}`);
  };

  // Handle assign delivery
  const handleAssignDelivery = () => {
    toast.success(`Delivery assigned successfully`);
    setIsAssignModalOpen(false);
  };

  // Handle update status
  const handleUpdateStatus = (status) => {
    toast.success(`Delivery status updated to ${status}`);
    setIsDetailPanelOpen(false);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon;
    switch (status) {
      case 'Delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      case 'In Transit':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <TruckIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      case 'Loading':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <ClockIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      case 'Delayed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = null;
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Mock map component for demonstration
  const MapView = ({ delivery }) => {
    return (
      <div className="h-96 bg-gray-200 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-50"></div>
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
          <h3 className="font-semibold">Live Tracking: {delivery.driver}</h3>
          <p className="text-sm text-gray-600">Vehicle: {delivery.vehicle}</p>
          <p className="text-sm text-gray-600">ETA: {delivery.eta}</p>
        </div>
        
        {/* Mock vehicle marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 bg-white px-2 py-1 rounded text-xs font-medium">
            {delivery.driver}
          </div>
        </div>
        
        {/* Mock route line */}
        <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-blue-500 transform -translate-y-1/2"></div>
        
        {/* Mock destination marker */}
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <MapPinIcon className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2 bg-white px-2 py-1 rounded text-xs font-medium">
            Destination
          </div>
        </div>
      </div>
    );
  };

  // Available drivers for assignment
  const availableDrivers = [
    { id: 'D1', name: 'Rajesh Kumar', status: 'Available', vehicle: 'MH-01-AB-1234', rating: 4.8 },
    { id: 'D2', name: 'Suresh Patel', status: 'Available', vehicle: 'MH-01-CD-5678', rating: 4.5 },
    { id: 'D3', name: 'Amit Singh', status: 'Busy', vehicle: 'MH-01-EF-9012', rating: 4.7 },
    { id: 'D4', name: 'Vijay Kumar', status: 'Available', vehicle: 'MH-01-GH-3456', rating: 4.9 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all deliveries in real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <TruckIcon className="h-4 w-4 mr-2" />
            Assign Delivery
          </button>
          <div className="relative">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => handleExport('excel')}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search deliveries by driver, order ID, or customer..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-sm border border-gray-200">
                {searchResults.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSearchTerm('')
                      openDetailPanel(delivery)
                    }}
                  >
                    <div>
                      <span className="font-medium">#{delivery.orderId}</span>
                      <span className="text-gray-600 ml-2">- {delivery.driver}</span>
                    </div>
                    <StatusBadge status={delivery.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Loading</option>
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Delayed</option>
              </select>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm"
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
              >
                <option>All Drivers</option>
                {Array.from(new Set(mockDeliveryData.allDeliveries.map(d => d.driver))).map(driver => (
                  <option key={driver} value={driver}>{driver}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('In Transit')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Deliveries</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.active}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <span>In Progress</span>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('Delivered')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.completedToday}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>On Time</span>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('Delayed')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <AlertTriangleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Delayed</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.delayed}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-red-600">
            <span>Attention Needed</span>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
              <UserIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Available Drivers</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.availableDrivers}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'orderId', label: 'Order ID' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'driver', label: 'Driver' },
                  { key: 'vehicle', label: 'Vehicle' },
                  { key: 'departure', label: 'Departure' },
                  { key: 'eta', label: 'ETA' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ].map((column) => (
                  <th 
                    key={column.key} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => column.key !== 'actions' && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.key !== 'actions' && (
                        <ArrowUpDownIcon className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDeliveries.length > 0 ? (
                currentDeliveries.map((delivery) => (
                  <tr 
                    key={delivery.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetailPanel(delivery)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileTextIcon className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">#{delivery.orderId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                      <div className="text-xs text-gray-500">Regular Customer</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                          {delivery.driver.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{delivery.driver}</div>
                          <div className="text-xs text-gray-500">4.8 ★</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{delivery.vehicle}</div>
                      <div className="text-xs text-gray-500">Truck</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.departure}</div>
                      <div className="text-xs text-gray-500">On time</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.eta}</div>
                      <div className="text-xs text-gray-500">30 min remaining</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={delivery.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetailPanel(delivery)
                          }}
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={(e) => openMapModal(delivery, e)}
                          title="Track on map"
                        >
                          <MapPinIcon className="h-4 w-4" />
                        </button>
                        {delivery.status === 'Delivered' && (
                          <button 
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            onClick={(e) => openProofModal(delivery, e)}
                            title="View proof"
                          >
                            <CameraIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <TruckIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No deliveries found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredDeliveries.length > 0 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstDelivery + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastDelivery, filteredDeliveries.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredDeliveries.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  value={deliveriesPerPage}
                  onChange={(e) => setDeliveriesPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = index + 1
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index
                    } else {
                      pageNumber = currentPage - 2 + index
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Detail Side Panel */}
      {isDetailPanelOpen && selectedDelivery && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailPanelOpen(false)}></div>
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  {/* Header */}
                  <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Delivery Details</h2>
                      <button
                        type="button"
                        className="text-white hover:text-blue-200 transition-colors"
                        onClick={() => setIsDetailPanelOpen(false)}
                      >
                        <XIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm">Order #{selectedDelivery.orderId}</span>
                      <div className="ml-3">
                        <StatusBadge status={selectedDelivery.status} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto py-6 px-6">
                    {/* Delivery Status */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['Loading', 'In Transit', 'Delivered', 'Delayed'].map((status) => (
                          <button
                            key={status}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              selectedDelivery.status === status
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => handleUpdateStatus(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Driver Info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Driver Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-gray-900">{selectedDelivery.driver}</p>
                        <div className="flex items-center mt-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-500">+91 98765 43210</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-500">driver@example.com</p>
                        </div>
                        <div className="flex items-center mt-3">
                          <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-500">{selectedDelivery.vehicle}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delivery Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <RouteIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Delivery Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Customer:</span>
                          <span className="text-sm font-medium">{selectedDelivery.customer}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Departure:</span>
                          <span className="text-sm font-medium">{selectedDelivery.departure}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">ETA:</span>
                          <span className="text-sm font-medium">{selectedDelivery.eta}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Distance:</span>
                          <span className="text-sm font-medium">15.2 km</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Route History */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Route History</h3>
                      <div className="space-y-4">
                        {[
                          { time: '14:30', location: 'Warehouse Departure', status: 'Departure' },
                          { time: '14:45', location: 'Main Highway', status: 'On Route' },
                          { time: '15:10', location: 'Customer Area', status: 'Approaching' },
                        ].map((history, index) => (
                          <div key={index} className="flex items-start">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                              history.status === 'Departure' ? 'bg-blue-100 text-blue-600' : 
                              history.status === 'On Route' ? 'bg-green-100 text-green-600' : 
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              <MapPinIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {history.location}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {history.time} - {history.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={() => setIsDetailPanelOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={(e) => openMapModal(selectedDelivery, e)}
                    >
                      <MapIcon className="h-4 w-4 mr-2 inline" />
                      View Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {isMapModalOpen && selectedDelivery && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Live Tracking</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Order #{selectedDelivery.orderId} - {selectedDelivery.driver}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setIsMapModalOpen(false)}
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4">
                  <MapView delivery={selectedDelivery} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Current Speed</p>
                    <p className="text-lg font-semibold">45 km/h</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Distance Remaining</p>
                    <p className="text-lg font-semibold">7.2 km</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Estimated Arrival</p>
                    <p className="text-lg font-semibold">15:40</p>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Vehicle is on route. No deviations detected.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsMapModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {isProofModalOpen && selectedDelivery && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-1 ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Proof of Delivery</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Order #{selectedDelivery.orderId} - {selectedDelivery.customer}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Delivery confirmation photo</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Delivery Details</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Delivered By:</p>
                        <p className="text-sm">{selectedDelivery.driver}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivered At:</p>
                        <p className="text-sm">15:30, 12 Nov 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Recipient:</p>
                        <p className="text-sm">John Doe (Customer)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Signature:</p>
                        <p className="text-sm">On file</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsProofModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {isAssignModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-1 ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Assign Delivery</h3>
                    <p className="text-sm text-gray-500 mt-1">Assign a delivery to an available driver</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                    <select
                      id="order"
                      name="order"
                      className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                    >
                      <option value="">Select an order</option>
                      <option value="1001">#1001 - Sharma Foods Ltd</option>
                      <option value="1002">#1002 - Patel Grocery Chain</option>
                      <option value="1003">#1003 - Singh Exports</option>
                      <option value="1004">#1004 - Kumar Restaurants</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
                    <div className="space-y-2">
                      {availableDrivers.map((driver) => (
                        <div 
                          key={driver.id}
                          className={`p-3 border rounded-xl cursor-pointer transition-all ${
                            driver.status === 'Available' 
                              ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' 
                              : 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                {driver.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                                <p className="text-xs text-gray-500">{driver.vehicle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                driver.status === 'Available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {driver.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{driver.rating} ★</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Add any special instructions for the driver..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={handleAssignDelivery}
                >
                  Assign Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}