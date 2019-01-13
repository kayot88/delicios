const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: 'File is incorrect'
      }, false);
    }
  }
}

exports.addStore = (req, res) => {
  res.render('editStore')
}

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {
    title: 'stores',
    stores
  })
}



exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, file, next) => {
  if (!req.file) {
    next();
    return;
  }
  const extention = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extention}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
}



exports.createStore = async (req, res) => {
  const store = await (new Store(req.body).save());
  req.flash('success', `stop ${store.name}`)
  res.redirect(`/store/${store.slug}`);
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id
  })
  // res.send(store)
  res.render('editStore', {
    title: `edit ${store.name}`,
    store
  })
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash('success', `secceccfully updated <strong>${store.name}</strong>. 
  <a href="/stores/${store.slug}">View store ➡️</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res) => {
  const store = await Store.findOne({
    name: req.params.slug
  })
  res.render(`store`, {
    store,
    title: store.name
  })
}

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag
  const tagQuery = tag || {$exists : true}
  const tragsPromise = Store.getTagsList();
  const storesPromise = Store.find({
    tags: tagQuery
  });
  // const result = await Promise.all([tragsPromise, storesPromise])
  const [trags, stores] = await Promise.all([tragsPromise, storesPromise])
  res.render('tag', {
    trags,
    title: 'tagsList',
    tag,
    stores
  })
  // res.json(result)
}