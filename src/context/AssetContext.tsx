import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AssetKind, StoredAsset, StoredAssetMeta } from '../types/assets';

const DB_NAME = 'asab-aerolab-assets';
const STORE_NAME = 'assets';
const ASSET_VERSION = 1;

interface AssetContextValue {
  assets: Partial<Record<AssetKind, StoredAssetMeta>>;
  urls: Partial<Record<AssetKind, string>>;
  ready: boolean;
  saveAsset: (kind: AssetKind, file: File) => Promise<void>;
  removeAsset: (kind: AssetKind) => Promise<void>;
  readTextAsset: (kind: AssetKind) => Promise<string | null>;
}

const AssetContext = createContext<AssetContextValue | null>(null);

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open asset storage'));
  });
}

async function getAllAssets(): Promise<StoredAsset[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as StoredAsset[]);
    request.onerror = () => reject(request.error);
  });
}

async function putAsset(asset: StoredAsset): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(asset);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteAsset(id: AssetKind): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<StoredAsset[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof indexedDB === 'undefined') { setReady(true); return; }
    try { setRecords(await getAllAssets()); } catch { setRecords([]); } finally { setReady(true); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const saveAsset = useCallback(async (kind: AssetKind, file: File) => {
    const asset: StoredAsset = {
      id: kind,
      kind,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      updatedAt: new Date().toISOString(),
      version: ASSET_VERSION,
      blob: file,
    };
    await putAsset(asset);
    await refresh();
  }, [refresh]);

  const removeAsset = useCallback(async (kind: AssetKind) => {
    await deleteAsset(kind);
    await refresh();
  }, [refresh]);

  const assets = useMemo(() => Object.fromEntries(records.map(({ blob: _blob, ...meta }) => [meta.kind, meta])) as Partial<Record<AssetKind, StoredAssetMeta>>, [records]);
  const urls = useMemo(() => Object.fromEntries(records.map((asset) => [asset.kind, URL.createObjectURL(asset.blob)])) as Partial<Record<AssetKind, string>>, [records]);

  useEffect(() => () => Object.values(urls).forEach((url) => url && URL.revokeObjectURL(url)), [urls]);

  const readTextAsset = useCallback(async (kind: AssetKind) => {
    const asset = records.find((record) => record.kind === kind);
    return asset ? asset.blob.text() : null;
  }, [records]);

  return <AssetContext.Provider value={{ assets, urls, ready, saveAsset, removeAsset, readTextAsset }}>{children}</AssetContext.Provider>;
};

export function useAssets(): AssetContextValue {
  const value = useContext(AssetContext);
  if (!value) throw new Error('useAssets must be used inside AssetProvider');
  return value;
}
