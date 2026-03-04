import { AssetManager, MemoryBlobStore } from '@verevoir/assets';
import type { Asset } from '@verevoir/assets';
import { createAssetSource } from '@verevoir/media';
import type { ImgproxyConfig } from '@verevoir/media';
import { storage } from './storage';

const blobStore = new MemoryBlobStore();

export const manager = new AssetManager({ storage, blobStore });

/** Maps blobKey → browser-displayable object URL */
const objectUrls = new Map<string, string>();

export function getBlobObjectUrl(blobKey: string): string {
  return objectUrls.get(blobKey) ?? '';
}

/** Upload a File and track its object URL for browser preview. */
export async function uploadAsset(
  file: File,
  createdBy: string,
): Promise<Asset> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const asset = await manager.upload({
    data: buffer,
    filename: file.name,
    contentType: file.type,
    createdBy,
  });
  const blob = new Blob([buffer], { type: file.type });
  objectUrls.set(asset.blobKey, URL.createObjectURL(blob));
  return asset;
}

export const source = createAssetSource({
  manager,
  blobUrl: (blobKey) => getBlobObjectUrl(blobKey),
});

export const imgproxyConfig: ImgproxyConfig = {
  baseUrl: 'https://imgproxy.example.com',
};
