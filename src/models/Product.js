import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      default: ['S', 'M', 'L', 'XL'],
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ title: 'text', description: 'text' });

productSchema.virtual('discountedPrice').get(function getDiscountedPrice() {
  return Math.round(this.price - (this.price * this.discount) / 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
