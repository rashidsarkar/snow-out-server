/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

export const uploadFile = () => {
  /**
   * =============================
   * STORAGE CONFIG
   * =============================
   */
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = 'uploads';

      switch (file.fieldname) {
        case 'profile_image':
          uploadPath = 'uploads/images/profile';
          break;

        case 'supporting_Documents':
          uploadPath = 'uploads/images/supporting_Documents';
          break;

        case 'report_Document':
          uploadPath = 'uploads/images/report_Document';
          break;

        case 'medical_family_image':
          uploadPath = 'uploads/images/medical_family_image';
          break;

        case 'insurance_Photo':
          uploadPath = 'uploads/images/insurance_Photo';
          break;

        case 'article_image':
          uploadPath = 'uploads/images/article_image';
          break;

        case 'category_image':
          uploadPath = 'uploads/images/category_images';
          break;

        case 'video':
          uploadPath = 'uploads/video';
          break;

        default:
          uploadPath = 'uploads';
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueName}${ext}`);
    },
  });

  /**
   * =============================
   * FILE FILTER
   * =============================
   */
  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedFieldnames = [
      'image',
      'profile_image',
      'supporting_Documents',
      'appointment_images',
      'category_image',
      'report_Document',
      'medical_family_image',
      'insurance_Photo',
      'article_image',
      'video',
    ];

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/pdf',
      'video/mp4',
    ];

    if (!allowedFieldnames.includes(file.fieldname)) {
      return cb(new Error('Invalid fieldname'));
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    cb(null, true);
  };

  /**
   * =============================
   * MULTER INSTANCE
   * =============================
   */
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
    },
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'supporting_Documents', maxCount: 4 },
    { name: 'appointment_images', maxCount: 3 },
    { name: 'category_image', maxCount: 1 },
    { name: 'report_Document', maxCount: 4 },
    { name: 'medical_family_image', maxCount: 4 },
    { name: 'insurance_Photo', maxCount: 4 },
    { name: 'article_image', maxCount: 2 },
    { name: 'video', maxCount: 1 },
  ]);

  return upload;
};
