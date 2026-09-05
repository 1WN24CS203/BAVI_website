'use client';

import { useState, useEffect } from 'react';
import { PackageCheck, Plus, Truck, DollarSign, Box, AlertCircle } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, Toast, Tabs, EmptyState, Table, SearchInput } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function MaterialsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [materials, setMaterials] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'cement', quantity: '', unit: 'bags', unit_price: '', supplier: '', status: 'required', delivery_date: '', notes: '' });

  useEffect(() => { try { const s = localStorage.getItem('bavi_materials'); if (s) setMaterials(JSON.parse(s)); } catch {} }, []);
  const save = (d) => { localStorage.setItem('bavi_materials', JSON.stringify(d)); setMaterials(d); };

  const handleAdd = (e) => {
    e.preventDefault();
    const item = { ...form, id: `mat-${Date.now()}`, total_cost: (parseFloat(form.quantity) || 0) * (parseFloat(form.unit_price) || 0), created_at: new Date().toISOString() };
    save([item, ...materials]);
    setShowAdd(false);
    setForm({ name: '', category: 'cement', quantity: '', unit: 'bags', unit_price: '', supplier: '', status: 'required', delivery_date: '', notes: '' });
    setToastMsg('Material added!'); setToastVisible(true);
    logActivity('added_material', 'material', item.name, { category: item.category });
  };

  const updateStatus = (id, status) => { save(materials.map(m => m.id === id ? { ...m, status } : m)); };

  const statusColors = { required: 'danger', ordered: 'warning', delivered: 'info', in_use: 'gold', consumed: 'success' };
  const categoryTabs = [
    { value: 'all', label: 'All', count: materials.length },
    { value: 'cement', label: 'Cement', count: materials.filter(m => m.category === 'cement').length },
    { value: 'steel', label: 'Steel', count: materials.filter(m => m.category === 'steel').length },
    { value: 'timber', label: 'Timber', count: materials.filter(m => m.category === 'timber').length },
    { value: 'electrical', label: 'Electrical', count: materials.filter(m => m.category === 'electrical').length },
    { value: 'plumbing', label: 'Plumbing', count: materials.filter(m => m.category === 'plumbing').length },
  ];

  const filtered = materials.filter(m => {
    const matchTab = activeTab === 'all' || m.category === activeTab;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.supplier?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalCost = materials.reduce((s, m) => s + (m.total_cost || 0), 0);

  const columns = [
    { header: 'Material', key: 'name', render: (r) => <span style={{ fontWeight: 600, color: '#f8f8f8' }}>{r.name}</span> },
    { header: 'Category', key: 'category', render: (r) => <Badge variant="neutral" size="sm">{r.category}</Badge> },
    { header: 'Qty', key: 'quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { header: 'Unit Price', key: 'unit_price', render: (r) => `₹${Number(r.unit_price || 0).toLocaleString('en-IN')}` },
    { header: 'Total', key: 'total_cost', render: (r) => <span style={{ fontWeight: 700, color: '#c9a84c' }}>₹{Number(r.total_cost || 0).toLocaleString('en-IN')}</span> },
    { header: 'Supplier', key: 'supplier' },
    { header: 'Status', key: 'status', render: (r) => <Badge variant={statusColors[r.status]} size="sm" dot>{r.status}</Badge> },
    { header: '', key: 'actions', render: (r) => (
      <Select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} options={[
        { value: 'required', label: 'Required' }, { value: 'ordered', label: 'Ordered' },
        { value: 'delivered', label: 'Delivered' }, { value: 'in_use', label: 'In Use' }, { value: 'consumed', label: 'Consumed' }
      ]} />
    )},
  ];

  return (
    <>
      <DesignerHeader title="Material & Procurement Tracker" subtitle="Track construction materials, suppliers, costs, and delivery status" />
      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Total Items</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8f8f8', fontFamily: "'Playfair Display', serif" }}>{materials.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Total Cost</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', serif" }}>₹{totalCost.toLocaleString('en-IN')}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Pending Delivery</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', fontFamily: "'Playfair Display', serif" }}>{materials.filter(m => m.status === 'ordered').length}</div>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..." onClear={() => setSearch('')} />
            <Button icon={Plus} onClick={() => setShowAdd(true)} size="sm">Add Material</Button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <Table columns={columns} data={filtered} striped />
        ) : (
          <EmptyState icon={PackageCheck} title="No Materials Tracked" description="Start tracking construction materials by adding them to the procurement list." action={<Button icon={Plus} onClick={() => setShowAdd(true)}>Add First Material</Button>} />
        )}

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Material" size="md">
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextInput label="Material Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. OPC 53 Grade Cement" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[
                { value: 'cement', label: 'Cement' }, { value: 'steel', label: 'Steel' }, { value: 'timber', label: 'Timber' },
                { value: 'electrical', label: 'Electrical' }, { value: 'plumbing', label: 'Plumbing' }, { value: 'paint', label: 'Paint' },
                { value: 'tiles', label: 'Tiles' }, { value: 'fittings', label: 'Fittings' },
              ]} />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
                { value: 'required', label: 'Required' }, { value: 'ordered', label: 'Ordered' }, { value: 'delivered', label: 'Delivered' },
              ]} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <TextInput label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[
                { value: 'bags', label: 'Bags' }, { value: 'tons', label: 'Tons' }, { value: 'sqft', label: 'Sq.Ft' },
                { value: 'meters', label: 'Meters' }, { value: 'units', label: 'Units' }, { value: 'liters', label: 'Liters' },
              ]} />
              <TextInput label="Unit Price (₹)" type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            </div>
            <TextInput label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            <TextInput label="Delivery Date" type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
            <Button type="submit" fullWidth icon={PackageCheck}>Add Material</Button>
          </form>
        </Modal>
        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
