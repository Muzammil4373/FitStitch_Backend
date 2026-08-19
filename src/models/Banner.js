import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    description: { type: String },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop' },
    image: { type: String, required: true },
    imagePublicId: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
