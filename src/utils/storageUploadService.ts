import { storage } from '../lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

export const uploadFileToStorage = async (
  file: File,
  userId: string,
  folder: string = 'uploads'
): Promise<string> => {
  if (!file) throw new Error('No file provided');
  
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `users/${userId}/${folder}/${fileName}`;
  
  const fileRef = ref(storage, storagePath);
  
  await uploadBytes(fileRef, file, {
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  });
  
  return storagePath;
};

export const uploadFilesToStorage = async (
  files: File[],
  userId: string,
  folder: string = 'uploads'
): Promise<string[]> => {
  if (!files.length) return [];
  const uploadPromises = files.map(file => uploadFileToStorage(file, userId, folder));
  return Promise.all(uploadPromises);
};