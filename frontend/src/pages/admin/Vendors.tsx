import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { insforge } from '../../services/insforge';

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
  dbId?: string;
  isActive?: boolean;
}

export const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('users')
        .select('*')
        .eq('role', 'vendor');

      if (!error && Array.isArray(data)) {
        const mapped: VendorItem[] = data.map((u: any) => ({
          id: u.id ? `VND-${u.id.slice(0, 6)}` : 'VND-UNKNOWN',
          businessName: u.name || 'Vendor Business',
          ownerName: u.name || 'Owner',
          category: 'PG / Hostel',
          email: u.email || '—',
          phone: u.phone || '—',
          location: u.city || u.address || 'Location not specified',
          status: u.is_active ? 'approved' : 'pending',
          rating: 0,
          dbId: u.id,
          isActive: u.is_active ?? true
        }));
        setVendors(mapped);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateStatus = async (item: VendorItem & { dbId?: string; isActive?: boolean }, newStatus: 'approved' | 'rejected') => {
    if (item.dbId) {
      try {
        await insforge.database
          .from('users')
          .update({ is_active: newStatus === 'approved' })
          .eq('id', item.dbId);
      } catch (err) {
        console.error('Failed to update vendor status:', err);
      }
    }
    setVendors((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, status: newStatus } : v))
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
                onClick={() => updateStatus(item, 'approved')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(item, 'rejected')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition-colors shadow-xs"
              >
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={() => updateStatus(item, item.status === 'approved' ? 'rejected' : 'approved')}
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
