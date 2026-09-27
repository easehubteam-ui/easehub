import React, { useState } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface VendorItem {
  id: string;
  businessName: string;
  ownerName: string;
  category: 'PG / Hostel' | 'Mess / Tiffin' | 'Laundry' | 'Maintenance';
  email: string;
  phone: string;
  location: string;
  status: 'approved' | 'pending' | 'rejected';
  rating: number;
}

export const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      id: 'VND-101',
      businessName: 'Royal Luxury Boys PG',
      ownerName: 'Rajesh Kumar',
      category: 'PG / Hostel',
      email: 'rajesh@royalboyspg.com',
      phone: '+91 98271 99999',
      location: 'Sector 6, Bhilai',
      status: 'approved',
      rating: 4.8,
    },
    {
      id: 'VND-102',
      businessName: 'Annapurna Daily Mess & Tiffin',
      ownerName: 'Suresh Sharma',
      category: 'Mess / Tiffin',
      email: 'suresh@annapurna.in',
      phone: '+91 98271 88811',
      location: 'Near BIT College, Durg',
      status: 'approved',
      rating: 4.6,
    },
    {
      id: 'VND-103',
      businessName: 'Campus Express Laundry Hub',
      ownerName: 'Mahesh Patel',
      category: 'Laundry',
      email: 'mahesh@expresslaundry.com',
      phone: '+91 98271 77722',
      location: 'Rungta Campus Gate 2',
      status: 'pending',
      rating: 0.0,
    },
    {
      id: 'VND-104',
      businessName: 'Sunshine Girls Residency',
      ownerName: 'Anita Gupta',
      category: 'PG / Hostel',
      email: 'anita@sunshinegirls.com',
      phone: '+91 98271 66633',
      location: 'Civic Center, Bhilai',
      status: 'approved',
      rating: 4.9,
    },
    {
      id: 'VND-105',
      businessName: 'QuickFix AC & Appliance Repair',
      ownerName: 'Dinesh Verma',
      category: 'Maintenance',
      email: 'dinesh@quickfix.in',
      phone: '+91 98271 55544',
      location: 'Nehru Nagar, Bhilai',
      status: 'rejected',
      rating: 2.1,
    },
  ]);

  const updateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  const columns: Column<VendorItem>[] = [
    {
      key: 'id',
      header: 'Vendor ID',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    {
      key: 'businessName',
      header: 'Business & Owner',
      render: (item) => (
        <div>
          <div className="font-bold text-[#171A18]">{item.businessName}</div>
          <div className="text-[10px] text-[#6B6B63]">Owner: {item.ownerName} • {item.email}</div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'location', header: 'Location' },
    { key: 'phone', header: 'Contact Phone' },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => (
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <span className="material-symbols-outlined text-[14px]">star</span>
          <span>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Approval Actions',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.status === 'pending' ? (
            <>
              <button
                onClick={() => updateStatus(item.id, 'approved')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(item.id, 'rejected')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition-colors shadow-xs"
              >
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={() => updateStatus(item.id, item.status === 'approved' ? 'rejected' : 'approved')}
              className="text-[10px] text-[#6B6B63] hover:underline font-bold"
            >
              Toggle Status
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Vendor Partner Directory & Approvals"
        subtitle="Review, approve, and manage registered hostel landlords, tiffin centers, and service vendors"
        columns={columns}
        data={vendors}
        searchPlaceholder="Search vendor business name or owner..."
      />
    </div>
  );
};

export default Vendors;
