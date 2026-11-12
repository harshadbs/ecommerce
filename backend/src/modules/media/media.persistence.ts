import { prisma } from '../../config/database.js';
import { Media } from '@prisma/client';

export class MediaPersistence {
  async findById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({ where: { id } });
  }

  async create(data: { mimeType: string; data: Buffer }): Promise<Pick<Media, 'id'>> {
    return prisma.media.create({
      data: { mimeType: data.mimeType, size: data.data.length, data: data.data },
      select: { id: true },
    });
  }

  /** Ids that are already gone are skipped. */
  async deleteByIds(ids: string[]): Promise<void> {
    await prisma.media.deleteMany({ where: { id: { in: ids } } });
  }
}

export const mediaPersistence = new MediaPersistence();
