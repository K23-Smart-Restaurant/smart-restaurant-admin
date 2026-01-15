import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { waiterService } from '../services/waiterService';

interface BillData {
  orderId: string;
  orderNumber: number;
  tableNumber: number;
  tableLocation: string;
  guestName: string;
  guestContact: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    specialInstructions: string | null;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
  status: string;
  generatedAt: string;
  billNumber: string;
}

/**
 * BillPrintPage - Printable bill view for restaurant
 */
const BillPrintPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch bill data - you'll need to add this to waiterService if not exists
        const data = await waiterService.getBillByOrderId(orderId);
        console.log(data);
        setBillData(data);
      } catch (err) {
        console.error('Failed to fetch bill:', err);
        setError('Failed to load bill data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-naples/30 border-t-naples rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (error || !billData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Bill not found'}</p>
          <button
            onClick={() => navigate('/waiter')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          /* Hide everything except the bill content */
          body * {
            visibility: hidden;
          }

          #printable-bill, #printable-bill * {
            visibility: visible;
          }

          #printable-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Remove shadows and backgrounds for print */
          #printable-bill {
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
          }

          /* Ensure proper page breaks */
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

      {/* Print/Download Toolbar - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/waiter')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all font-semibold"
            >
              <Printer className="w-5 h-5" />
              Print Bill
            </button>
          </div>
        </div>
      </div>

      {/* Printable Bill */}
      <div className="min-h-screen bg-gray-50 print:bg-white p-8 print:p-0">
        <div
          id="printable-bill"
          className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-12 print:p-8"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-charcoal mb-2">Smart Restaurant</h1>
            <p className="text-gray-600">123 Main Street, City, State 12345</p>
            <p className="text-gray-600">Phone: (555) 123-4567</p>
          </div>

          {/* Bill Info */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="font-semibold text-charcoal">Bill Number:</p>
              <p className="text-gray-700">{billData.billNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-charcoal">Date:</p>
              <p className="text-gray-700">{formatDateTime(billData.createdAt)}</p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">Table:</p>
              <p className="text-gray-700">
                Table {billData.tableNumber}
                {billData.tableLocation && ` - ${billData.tableLocation}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-charcoal">Guest:</p>
              <p className="text-gray-700">{billData.guestName || 'Walk-in Customer'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-charcoal">Item</th>
                  <th className="text-center py-3 px-2 font-semibold text-charcoal w-20">Qty</th>
                  <th className="text-right py-3 px-2 font-semibold text-charcoal w-24">Price</th>
                  <th className="text-right py-3 px-2 font-semibold text-charcoal w-28">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {billData.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2 text-gray-800">{item.name}</td>
                      <td className="py-3 px-2 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-3 px-2 text-right text-gray-800">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-800 font-medium">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                    {item.specialInstructions && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={4} className="py-1 px-2 pl-6 text-sm text-gray-600 italic">
                          Note: {item.specialInstructions}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end mb-2">
              <div className="w-80">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(billData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Tax ({billData.taxRate}%):</span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(billData.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">
                    Service Charge ({billData.serviceChargeRate}%):
                  </span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(billData.serviceCharge)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-400 mt-2">
                  <span className="text-xl font-bold text-charcoal">Total:</span>
                  <span className="text-2xl font-bold text-charcoal">
                    {formatCurrency(billData.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-2">Thank you for dining with us!</p>
            <p className="text-gray-500 text-xs">
              This is a computer-generated bill. No signature required.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillPrintPage;
