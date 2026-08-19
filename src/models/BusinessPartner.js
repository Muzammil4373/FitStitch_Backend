import mongoose from 'mongoose';

const businessPartnerSchema = new mongoose.Schema(
  {
    dealerName: { type: String, required: true },
    businessName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    businessType: { type: String, required: true },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('BusinessPartner', businessPartnerSchema);
