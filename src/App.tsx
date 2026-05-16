import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus,
  Trash2,
  Download,
  Upload,
  User,
  Car,
  Calendar,
  Settings,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { InvoiceData } from './types';

const INITIAL_DATA: InvoiceData = {
  business: {
    name: 'LUXE DRIVE',
    address: 'Kawasan Bisnis Sudirman, Kav. 52-53, Jakarta Selatan',
    phone: '+62 21 555 0123',
    email: 'ops@luxedrive.id',
    logo: null
  },
  renter: {
    name: 'Adrian Wijaya',
    phone: '0812-9876-5432',
    identityId: '3174092810930005',
    address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta'
  },
  car: {
    model: 'Porsche Taycan 4S',
    plateNumber: 'B 1 LUX',
    color: 'Frozen Blue'
  },
  rental: {
    invoiceNumber: `INV-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    endTime: '09:00',
    durationDays: 2,
    pricePerDay: 5500000,
    totalAmount: 11000000,
    deposit: 5000000,
    amountPaid: 16000000,
    paymentMethod: 'Bank Transfer',
    notes: 'Premium insurance included. Vehicle must be returned with 80%+ SOC.'
  }
};

export default function App() {
  const [data, setData] = useState<InvoiceData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('business');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.rental.startDate || !data.rental.startTime || !data.rental.endDate || !data.rental.endTime) return;
    
    const start = new Date(`${data.rental.startDate}T${data.rental.startTime}`);
    const end = new Date(`${data.rental.endDate}T${data.rental.endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const total = diffDays * data.rental.pricePerDay;
    
    setData(prev => ({
      ...prev,
      rental: {
        ...prev.rental,
        durationDays: diffDays,
        totalAmount: total,
      }
    }));
  }, [data.rental.startDate, data.rental.startTime, data.rental.endDate, data.rental.endTime, data.rental.pricePerDay]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);
    
    try {
      // Small delay to ensure any layout shifts are settled
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2 is enough for clear A4, 3 might be too heavy for some browsers
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Additional safety: ensure any oklch colors are definitely gone in clone
          const container = clonedDoc.querySelector('.invoice-container');
          if (container) {
            (container as HTMLElement).style.backgroundColor = '#ffffff';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${data.rental.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please try again. Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const updateBusiness = (updates: Partial<typeof data.business>) => {
    setData(prev => ({ ...prev, business: { ...prev.business, ...updates } }));
  };

  const updateRenter = (updates: Partial<typeof data.renter>) => {
    setData(prev => ({ ...prev, renter: { ...prev.renter, ...updates } }));
  };

  const updateCar = (updates: Partial<typeof data.car>) => {
    setData(prev => ({ ...prev, car: { ...prev.car, ...updates } }));
  };

  const updateRental = (updates: Partial<typeof data.rental>) => {
    setData(prev => ({ ...prev, rental: { ...prev.rental, ...updates } }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
    <div className="border-b border-black/5 last:border-0">
      <button 
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between py-5 px-6 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
            <Icon size={16} />
          </div>
          <span className="font-semibold text-sm tracking-tight">{title}</span>
        </div>
        {expandedSection === id ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white">
      {/* Left Sidebar: Editor */}
      <aside className="no-print w-full lg:w-[400px] border-r border-black/5 flex flex-col h-full z-20 bg-white">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-sm rotate-45"></div>
            <span className="font-black text-lg tracking-tighter">LUXE.GEN</span>
          </div>
          <button 
            onClick={() => setData(INITIAL_DATA)}
            className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase hover:text-black transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Section id="business" title="Business Details" icon={Settings}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 bg-neutral-100 border border-dashed border-neutral-300 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors group relative overflow-hidden"
                >
                  {data.business.logo ? (
                    <img src={data.business.logo} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <ImageIcon size={20} className="text-neutral-400" />
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => updateBusiness({ logo: re.target?.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </button>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Business Name</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none placeholder:text-neutral-300"
                    value={data.business.name}
                    onChange={(e) => updateBusiness({ name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Official Address</p>
                <textarea 
                  className="w-full text-sm font-medium focus:outline-none resize-none h-20"
                  value={data.business.address}
                  onChange={(e) => updateBusiness({ address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Email</p>
                  <input 
                    type="email" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.business.email}
                    onChange={(e) => updateBusiness({ email: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Phone</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.business.phone}
                    onChange={(e) => updateBusiness({ phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section id="renter" title="Customer Identity" icon={User}>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Full Representative Name</p>
                <input 
                  type="text" 
                  className="w-full text-sm font-medium focus:outline-none"
                  value={data.renter.name}
                  onChange={(e) => updateRenter({ name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Identity (NIK/KTP)</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.renter.identityId}
                    onChange={(e) => updateRenter({ identityId: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Phone Number</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.renter.phone}
                    onChange={(e) => updateRenter({ phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Primary Address</p>
                <textarea 
                  className="w-full text-sm font-medium focus:outline-none resize-none h-16"
                  value={data.renter.address}
                  onChange={(e) => updateRenter({ address: e.target.value })}
                />
              </div>
            </div>
          </Section>

          <Section id="car" title="Vehicle Details" icon={Car}>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Make & Model</p>
                <input 
                  type="text" 
                  className="w-full text-sm font-medium focus:outline-none"
                  value={data.car.model}
                  onChange={(e) => updateCar({ model: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">License Plate</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.car.plateNumber}
                    onChange={(e) => updateCar({ plateNumber: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Exterior Finish</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.car.color}
                    onChange={(e) => updateCar({ color: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section id="rental" title="Contract & Payment" icon={CreditCard}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Pick-up Date</p>
                  <input 
                    type="date" 
                    className="w-full text-sm font-medium focus:outline-none bg-transparent"
                    value={data.rental.startDate}
                    onChange={(e) => updateRental({ startDate: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Return Date</p>
                  <input 
                    type="date" 
                    className="w-full text-sm font-medium focus:outline-none bg-transparent"
                    value={data.rental.endDate}
                    onChange={(e) => updateRental({ endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Price Per Day</p>
                  <input 
                    type="number" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.rental.pricePerDay}
                    onChange={(e) => updateRental({ pricePerDay: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Security Deposit</p>
                  <input 
                    type="number" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.rental.deposit}
                    onChange={(e) => updateRental({ deposit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Funds Received</p>
                  <input 
                    type="number" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.rental.amountPaid}
                    onChange={(e) => updateRental({ amountPaid: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Payment Method</p>
                  <input 
                    type="text" 
                    className="w-full text-sm font-medium focus:outline-none"
                    value={data.rental.paymentMethod}
                    onChange={(e) => updateRental({ paymentMethod: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Remarks & Exceptions</p>
                <textarea 
                  className="w-full text-sm font-medium focus:outline-none resize-none h-12"
                  value={data.rental.notes}
                  onChange={(e) => updateRental({ notes: e.target.value })}
                />
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Duration</span>
                  <span className="font-bold">{data.rental.durationDays} Days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Rental Total</span>
                  <span className="font-bold">{formatCurrency(data.rental.totalAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/5 text-sm">
                  <span className="font-bold">Grand Total</span>
                  <span className="font-black">{formatCurrency(data.rental.totalAmount + data.rental.deposit)}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="p-6 border-t border-black/5">
          <button 
            disabled={isGenerating}
            onClick={handleDownloadPDF}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
            Generate Official PDF
          </button>
        </div>
      </aside>

      {/* Main Content: Preview */}
      <main className="flex-1 bg-[#f0f0f0] overflow-y-auto no-scrollbar p-8 lg:p-12 relative">
        <div className="max-w-[794px] mx-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-8 no-print">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <Check size={10} /> Active Draft
              </span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                Last auto-saved 2m ago
              </span>
            </div>
            <div className="flex items-center gap-2">
               <FileText size={16} className="text-neutral-400" />
               <span className="text-xs font-bold font-mono">ID: {data.rental.invoiceNumber}</span>
            </div>
          </div>

          {/* DOCUMENT START */}
          <div 
            ref={invoiceRef}
            className="invoice-container bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] min-h-[1123px] flex flex-col p-[60px] relative overflow-hidden"
          >
            {/* Minimalist Watermark/Pattern */}
            <div className="absolute -top-20 -right-20 w-64 h-64 border-[40px] border-black/5 rounded-full"></div>

            {/* Header Section */}
            <div className="flex justify-between items-start mb-20 relative z-10">
              <div className="flex items-center gap-5">
                {data.business.logo ? (
                  <img src={data.business.logo} alt="Logo" className="w-14 h-14 object-contain grayscale" />
                ) : (
                  <div className="w-14 h-14 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white font-black text-2xl tracking-tighter">LX</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">{data.business.name}</h1>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">Premium Vehicle Rental</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[40px] font-black leading-none uppercase tracking-tighter mb-2">Notice</p>
                <p className="text-xs font-bold font-mono text-neutral-400">{data.rental.invoiceNumber}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-20 mb-20">
              <div className="space-y-12">
                {/* Vendor Info */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-4">Authorized Provider</p>
                  <div className="text-xs leading-relaxed font-medium text-neutral-600 max-w-[200px]">
                    <p className="text-black font-extrabold uppercase mb-2">{data.business.name}</p>
                    <p>{data.business.address}</p>
                    <p className="mt-4 tabular-nums">{data.business.phone}</p>
                    <p>{data.business.email}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-4">Rental Representative</p>
                  <div className="text-xs leading-relaxed font-medium text-neutral-600">
                    <p className="text-xl font-black text-black leading-none mb-3 italic">{data.renter.name}</p>
                    <p className="tabular-nums font-mono mb-1">{data.renter.identityId}</p>
                    <p className="max-w-[240px]">{data.renter.address}</p>
                    <p className="mt-4 tabular-nums">{data.renter.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {/* Date & Schedule */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-4">Service Schedule</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Pick-up</p>
                      <p className="text-sm font-black tabular-nums">{new Date(data.rental.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-mono text-neutral-400 uppercase">H+{data.rental.startTime}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Return</p>
                      <p className="text-sm font-black tabular-nums">{new Date(data.rental.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-mono text-neutral-400 uppercase">H+{data.rental.endTime}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-4">Assigned Asset</p>
                  <div>
                    <p className="text-2xl font-black uppercase tracking-tighter mb-1">{data.car.model}</p>
                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      <span>{data.car.plateNumber}</span>
                      <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                      <span>{data.car.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Table */}
            <div className="mb-20">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-black/5">
                    <th className="py-4 text-left text-[8px] font-black uppercase tracking-[0.3em]">Item Description</th>
                    <th className="py-4 text-right text-[8px] font-black uppercase tracking-[0.3em]">Contract Rate</th>
                    <th className="py-4 text-right text-[8px] font-black uppercase tracking-[0.3em]">Qty</th>
                    <th className="py-4 text-right text-[8px] font-black uppercase tracking-[0.3em]">Extension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr>
                    <td className="py-8">
                      <p className="text-sm font-bold uppercase mb-1">Rental Service Fee</p>
                      <p className="text-[10px] font-medium text-neutral-400 italic">Daily rental rate for {data.car.model}</p>
                    </td>
                    <td className="py-8 text-right font-mono text-xs text-neutral-600">{formatCurrency(data.rental.pricePerDay)}</td>
                    <td className="py-8 text-right font-black text-sm">{data.rental.durationDays}</td>
                    <td className="py-8 text-right font-black text-sm tabular-nums">{formatCurrency(data.rental.totalAmount)}</td>
                  </tr>
                  {data.rental.deposit > 0 && (
                    <tr>
                      <td className="py-6">
                        <p className="text-xs font-bold uppercase mb-0.5">Refundable Security Deposit</p>
                        <p className="text-[9px] text-neutral-400">Escrowed amount for potential damages/fines</p>
                      </td>
                      <td className="py-6 text-right font-mono text-xs opacity-30">---</td>
                      <td className="py-6 text-right font-black text-sm opacity-30">01</td>
                      <td className="py-6 text-right font-black text-sm tabular-nums text-neutral-600">{formatCurrency(data.rental.deposit)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Signatures */}
            <div className="mt-auto pt-20 border-t-2 border-black">
              <div className="flex justify-between">
                <div className="w-1/2 space-y-20">
                  {/* Notes */}
                  {data.rental.notes && (
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-2">Terms & Conditions</p>
                      <p className="text-[10px] leading-relaxed text-neutral-500 italic max-w-[280px]">
                        "{data.rental.notes}"
                      </p>
                    </div>
                  )}

                  {/* Signature Section */}
                  <div className="flex gap-20">
                    <div className="text-center">
                      <div className="mb-10 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-300">Renter</div>
                      <div className="w-32 border-b border-black/10 mx-auto"></div>
                      <div className="mt-2 text-[10px] font-black uppercase tracking-tight italic">{data.renter.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-10 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-300">Authorized Officer</div>
                      <div className="w-32 border-b border-black/10 mx-auto"></div>
                      <div className="mt-2 text-[10px] font-black uppercase tracking-tight italic">{data.business.name} Ops</div>
                    </div>
                  </div>
                </div>

                <div className="w-1/3">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      <span>Gross Contract Value</span>
                      <span className="tabular-nums">{formatCurrency(data.rental.totalAmount + data.rental.deposit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      <span>Total Funds Received</span>
                      <span className="tabular-nums">-{formatCurrency(data.rental.amountPaid)}</span>
                    </div>
                    <div className="h-0.5 bg-black/10"></div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-1">Invoiced Amount</p>
                        <p className="text-xs font-bold font-mono text-neutral-400 italic">{data.rental.paymentMethod}</p>
                      </div>
                      <p className="text-4xl font-black tracking-tighter leading-none tabular-nums italic">
                        {formatCurrency(Math.max(0, (data.rental.totalAmount + data.rental.deposit) - data.rental.amountPaid))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Subtle Footer Tech Text */}
                  <div className="mt-16 text-right">
                    <p className="text-[7px] font-mono font-bold text-neutral-300 uppercase tracking-[0.4em]">
                      LX.DRIVE // SYSTEM GENERATED // {new Date().toISOString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-400 no-print">
            Luxury Rental Management Suite v3.0
          </p>
        </div>
      </main>
    </div>
  );
}
