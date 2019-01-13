const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');



const storeSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: "Enter the coordinates"
    }],
    address: {
      type: String,
      required: "Enter the address"
    }
  },
  photo: String,

});

// storeSchema.statics.getTagsList = function () {
//   return this.aggregate([
//     {$unwind: {path: "$tags"}}
//   // includeArrayIndex: "arrayIndex"
//     // {cursor: {}}
//   ]);
// }

storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storeWithSlug = await this.constructor.find({
    slug: slugRegExp
  });
  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function () {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};



module.exports = mongoose.model('Store', storeSchema);