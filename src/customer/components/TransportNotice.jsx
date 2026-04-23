// src/customer/components/TransportNotice.jsx
import { Truck } from 'lucide-react';

export default function TransportNotice() {
  return (
    <div className="transport-notice">
      <div className="transport-notice-title">
        <Truck size={14} /> Transport Charges — परिवहन शुल्क
      </div>
      <div className="transport-notice-text">
        Transport charges are based on distance and will be paid <strong>separately at delivery</strong>.
        This is mandatory. ट्रांसपोर्ट चार्ज डिलीवरी पर अलग से देय है।
      </div>
    </div>
  );
}
