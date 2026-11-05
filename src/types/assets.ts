export type AssetKind = 'aircraft' | 'map3d' | 'routes' | 'mass' | 'mechanics';

export interface StoredAssetMeta {
  id: AssetKind;
  kind: AssetKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
  version: number;
}

export interface StoredAsset extends StoredAssetMeta {
  blob: Blob;
}
