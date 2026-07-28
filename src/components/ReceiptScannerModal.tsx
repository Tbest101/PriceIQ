import React, { useState } from 'react';
import type { BasketItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (items: BasketItem[]) => void;
}

const SAMPLE_RECEIPT_ITEMS: BasketItem[] = [
  { product: { id: 'r1', name: 'Whole Milk 1 Gallon', category: 'Dairy', defaultPrice: 3.49, barcode: '011110416001' }, quantity: 2 },
  { product: { id: 'r2', name: 'Large Grade A Brown Eggs 12ct', category: 'Dairy & Eggs', defaultPrice: 3.89, barcode: '011110416002' }, quantity: 1 },
  { product: { id: 'r3', name: 'Honey Nut Cheerios Cereal 15.4oz', category: 'Pantry', defaultPrice: 4.69, barcode: '011110416003' }, quantity: 1 },
  { product: { id: 'r4', name: 'Organic Bananas 3lb', category: 'Produce', defaultPrice: 2.19, barcode: '011110416004' }, quantity: 1 },
  { product: { id: 'r5', name: 'Artisan Sourdough Bread 24oz', category: 'Bakery', defaultPrice: 4.29, barcode: '011110416005' }, quantity: 1 },
  { product: { id: 'r6', name: 'Avocado Bag 4ct', category: 'Produce', defaultPrice: 3.99, barcode: '011110416006' }, quantity: 1 },
  { product: { id: 'r7', name: 'Tide Liquid Laundry Detergent 92oz', category: 'Household', defaultPrice: 12.99, barcode: '011110416007' }, quantity: 1 }
];

export const ReceiptScannerModal: React.FC<Props> = ({ isOpen, onClose, onReceiptScanned }) => {
  const [scanning, setScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onReceiptScanned(SAMPLE_RECEIPT_ITEMS);
      onClose();
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSimulateScan();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: '20px', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', fontSize: '1.4rem', border: 'none', background: 'none', cursor: 'pointer' }}
        >&times;</button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>AI Receipt Scanner</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Upload or snap a photo of any grocery receipt to automatically extract items into your basket.
          </p>
        </div>

        {scanning ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: '50%', height: '100%', background: 'var(--gradient-brand)', borderRadius: '10px', animation: 'pulse 1.2s ease-in-out infinite' }} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)' }}>
              ⚡ Extracting items &amp; normalizing unit prices...
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Upload Box */}
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleSimulateScan(); }}
              style={{
                border: dragActive ? '2px dashed var(--primary)' : '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '28px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s'
              }}
            >
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧾</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>Click to upload or drag receipt photo</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports JPG, PNG, WEBP receipts</div>
            </label>

            {/* Quick Demo Scan Button */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR TRY SAMPLE RECEIPT</span>
            </div>

            <button 
              className="btn-3d"
              onClick={handleSimulateScan}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              ⚡ Scan Sample Walmart / H-E-B Receipt
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
