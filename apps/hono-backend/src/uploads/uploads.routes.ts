import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { db } from '../prisma/prisma.service'; // Shared global prisma client

const uploadsApp = new Hono();

// POST /image (Replaces UploadsController.uploadImage)
uploadsApp.post('/image', async (c) => {
  // 1. Check if upload location is configured in your environments
  const uploadLocation = process.env['UPLOAD_LOCATION'];
  if (!uploadLocation) {
    throw new Error('UPLOAD_LOCATION is not defined in environment variables');
  }

  // 2. Parse the multipart form data body
  const body = await c.req.parseBody();
  const file = body['file']; // Expects 'file' key in Form Data

  // Check if file exists and is indeed a File blob object
  if (!file || !(file instanceof File)) {
    throw new HTTPException(400, { message: 'File is required' });
  }

  // 🛡️ FILE FILTER: Replicate your image-only mime type filter
  if (!file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
    throw new HTTPException(400, { message: 'Only image files are allowed!' });
  }

  // 3. Generate a completely unique file name (timestamp + random suffix + original extension)
  const originalExt = path.extname(file.name);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const finalFilename = `${uniqueSuffix}${originalExt}`;

  // Build the complete path where the file will land on disk
  const destinationPath = path.join(uploadLocation, finalFilename);

  try {
    // 4. Ensure the directory exists (equivalent to automated diskStorage creation paths)
    await fs.mkdir(uploadLocation, { recursive: true });

    // 5. Convert file content to array buffer and write natively to your system storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    // 6. Save data to database via Prisma (Mirrors your legacy UploadsService logic)
    const publicUrl = `/assets/${finalFilename}`;
    const imageRecord = await db.imageRecord.create({
      data: {
        url: publicUrl,
        filename: finalFilename,
      },
    });

    return c.json(imageRecord, 201);
  } catch (error) {
    throw new HTTPException(500, {
      message: 'Failed to complete image streaming update to disk or database',
      cause: error,
    });
  }
});

export default uploadsApp;
