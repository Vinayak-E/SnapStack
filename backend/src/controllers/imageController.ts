import Image from '../models/Image';
import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImages = [
  upload.array('images'),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const userId = (req as any).user.id;
    
    let titleArray: string[] = [];
    try {
      titleArray = JSON.parse(req.body.titles);
    } catch (error) {
      console.error("Error parsing titles:", error);
      res.status(400).json({ message: "Invalid titles format" })
      return;
    }

    const uploadedImages = await Promise.all(
      files.map(async (file, index) => {
        const params = {
          Bucket: process.env.S3_BUCKET as string,
          Key: `${userId}/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const { Location } = await s3.upload(params).promise();
           new Image({ 
          userId, 
          title: titleArray[index] || file.originalname, 
          url: Location 
        }).save();
      })
    );
    res.json(uploadedImages);
  },
];

export const getImages = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const images = await Image.find({ userId }).sort('order');
  res.json(images);
};

export const rearrangeImages = async (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  await Promise.all(
    orderedIds.map((id: string, index: number) =>
      Image.findByIdAndUpdate(id, { order: index })
    )
  );
  res.json({ message: 'Images rearranged' });
};

export const editImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const image = await Image.findByIdAndUpdate(id, { title }, { new: true });
  res.json(image);
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Image.findByIdAndDelete(id);
  res.json({ message: 'Image deleted' });
};