import express from 'express';
import {client} from '../db.js';
import {s3} from '../aws.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import {ObjectId} from 'mongodb';
dotenv.config();

const apiRouter = express.Router();

const uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      callback(null, `${Date.now()}_${file.originalname}}`);
    },
  }),
});

apiRouter.post('/uploadImage', uploadImage.single('image'), async (req, res) => {
  res.json(req.file.location);
});

apiRouter.post('/uploadNews', async (req, res) => {
  const {title, outline, category, thumbnail, content} = req.body;
  const date = new Date();

  const db = client.db('BP');
  const getNewsCount = await db.collection('counter').findOne({name: 'news'});
  const newsId = parseInt(getNewsCount.total);

  await db
    .collection('news')
    .insertOne({
      id: newsId + 1,
      title: title,
      outline: outline,
      category: category,
      thumbnail: thumbnail,
      content: content,
      date: date.toLocaleDateString(),
    })
    .catch(err => console.err(err));

  db.collection('counter').updateOne({name: 'news'}, {$inc: {total: 1}});
});

apiRouter.get('/getNews', async (req, res) => {
  const db = client.db('BP');
  const allNews = await db.collection('news').find().sort({id: -1}).limit(5).toArray();
  res.json(allNews);
});

apiRouter.get('/getLatestNews', async (req, res) => {
  const db = client.db('BP');
  const news = await db.collection('news').find().sort({id: -1}).limit(3).toArray();
  res.json(news);
});

apiRouter.post('/postLastNewsIndex', async (req, res) => {
  const db = client.db('BP');
  let {index} = req.body;
  const moreNews = await db
    .collection('news')
    .find({id: {$lt: index}})
    .sort({id: -1})
    .limit(5)
    .toArray();
  res.json(moreNews);
});

apiRouter.post('/updateNews', async (req, res) => {
  const {title, outline, category, thumbnail, content, id} = req.body;
  const date = new Date();

  const db = client.db('BP');

  await db
    .collection('news')
    .updateOne(
      {
        id: parseInt(id),
      },
      {
        $set: {
          title: title,
          outline: outline,
          category: category,
          thumbnail: thumbnail,
          content: content,
          date: date.toLocaleDateString(),
        },
      },
    )
    .catch(err => console.err(err));
});

apiRouter.post('/deleteNews', async (req, res) => {
  const {id} = req.body;
  const date = new Date();

  const db = client.db('BP');

  await db
    .collection('news')
    .deleteOne({
      id: parseInt(id),
    })
    .catch(err => console.err(err));
});

apiRouter.post('/uploadGuide', async (req, res) => {
  const {category, title, content} = req.body;
  const db = client.db('BP');
  await db
    .collection('guide')
    .insertOne({
      category: category,
      title: title,
      content: content,
    })
    .catch(err => console.log(err));
});

apiRouter.get('/getGuideData', async (req, res) => {
  const {title} = req.query;
  const db = client.db('BP');
  const getData = await db.collection('guide').findOne({title: title});
  res.send(getData);
});

apiRouter.get(`/getGuideList`, async (req, res) => {
  const db = client.db('BP');
  const getData = await db
    .collection('guide')
    .find()
    .project({_id: 0, category: 1, title: 1})
    .sort({title: 1})
    .toArray();
  res.send(getData);
});

apiRouter.post('/deleteGuideData', async (req, res) => {
  const {title} = req.body;
  const db = client.db('BP');
  await db
    .collection('guide')
    .deleteOne({title: title})
    .catch(err => console.error(err));
});

apiRouter.post('/updateGuideData', async (req, res) => {
  const {category, title, content, _id} = req.body;

  const db = client.db('BP');

  await db
    .collection('guide')
    .updateOne(
      {
        _id: new ObjectId(_id),
      },
      {
        $set: {
          category: category,
          title: title,
          content: content,
        },
      },
    )
    .catch(err => console.err(err));
});

apiRouter.post('/uploadDatabase', async (req, res) => {
  const {category, title, content} = req.body;

  const db = client.db('BP');

  await db
    .collection('database')
    .insertOne({
      category,
      title,
      content,
    })
    .catch(err => {
      console.error(err);
    });
});

apiRouter.get('/getDatabase', async (req, res) => {
  const db = client.db('BP');
  const getData = await db.collection('database').find().toArray();
  res.send(getData);
});

apiRouter.get('/getDatabaseList', async (req, res) => {
  const db = client.db('BP');
  const getData = await db
    .collection('database')
    .find()
    .project({_id: 0, title: 1, category: 1})
    .sort({title: 1})
    .toArray();
  res.send(getData);
});

apiRouter.get('/getDatabaseContents', async (req, res) => {
  const db = client.db('BP');
  const params = req.query.title;
  const getData = await db.collection('database').findOne({title: params});
  if (params === undefined) {
    const undefinedData = await db
      .collection('database')
      .find({category: '클래스'})
      .sort({title: 1})
      .limit(1)
      .toArray();
    res.send(undefinedData[0]);
  } else res.send(getData);
});

apiRouter.post('/deleteDatabase', async (req, res) => {
  const db = client.db('BP');
  const {title} = req.body;
  await db
    .collection('database')
    .deleteOne({
      title,
    })
    .catch(err => console.err(err));
});

apiRouter.post('/updateDatabase', async (req, res) => {
  const db = client.db('BP');
  const {category, title, content, _id} = req.body;

  await db
    .collection('database')
    .updateOne(
      {
        _id: new ObjectId(_id),
      },
      {
        $set: {
          category: category,
          title: title,
          content: content,
        },
      },
    )
    .catch(err => console.error(err));
});

apiRouter.post('/titleChecker', async (req, res) => {
  const db = client.db('BP');
  const {title, collection} = req.body;
  const isTitleExist = await db
    .collection(collection)
    .findOne({title: title})
    .catch(err => console.error(err));

  if (!isTitleExist) {
    res.send(true);
  } else {
    res.send(false);
  }
});

export default apiRouter;
