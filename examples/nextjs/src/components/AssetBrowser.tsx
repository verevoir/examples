'use client';

import { useState, useEffect, useRef } from 'react';
import type { Asset, Hotspot } from '@verevoir/assets';
import { HotspotOverlay, buildImageUrl } from '@verevoir/media';
import {
  manager,
  uploadAsset,
  getBlobObjectUrl,
  imgproxyConfig,
} from '@/assets';
import { useUser } from '@/context/UserContext';

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-lg)',
};

const uploadRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'center',
  marginBottom: 'var(--space-md)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '2px solid var(--color-border)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '1px solid var(--color-border)',
};

const selectedRowStyle: React.CSSProperties = {
  ...tdStyle,
  background: 'var(--color-surface)',
};

const detailStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
};

const previewStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: 300,
  borderRadius: 'var(--radius)',
};

const urlBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  padding: 'var(--space-sm)',
  borderRadius: 'var(--radius)',
  fontSize: '0.75rem',
  wordBreak: 'break-all',
  fontFamily: 'monospace',
  marginTop: 'var(--space-sm)',
};

const dangerBtnStyle: React.CSSProperties = {
  background: 'var(--color-danger)',
  color: '#fff',
};

export function AssetBrowser() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { identity } = useUser();

  const refresh = async () => {
    const list = await manager.list({ orderBy: { createdAt: 'desc' } });
    setAssets(list);
  };

  useEffect(() => {
    manager.list({ orderBy: { createdAt: 'desc' } }).then(setAssets);
  }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const asset = await uploadAsset(file, identity.id);
    if (fileRef.current) fileRef.current.value = '';
    setUploading(false);
    await refresh();
    setSelected(asset);
  };

  const handleDelete = async (id: string) => {
    await manager.delete(id);
    if (selected?.id === id) setSelected(null);
    await refresh();
  };

  const handleHotspot = async (hotspot: Hotspot) => {
    if (!selected) return;
    const updated = await manager.updateMetadata(selected.id, { hotspot });
    setSelected(updated);
    await refresh();
  };

  const imgproxyUrl =
    selected && selected.type === 'image'
      ? buildImageUrl(
          {
            id: selected.id,
            url: getBlobObjectUrl(selected.blobKey),
            width: selected.width,
            height: selected.height,
            hotspot: selected.hotspot,
            contentType: selected.contentType,
            filename: selected.filename,
          },
          { width: 800, height: 600 },
          imgproxyConfig,
        )
      : null;

  return (
    <div>
      <h1>Assets</h1>

      <div style={sectionStyle}>
        <div style={uploadRowStyle}>
          <input ref={fileRef} type="file" accept="image/*,video/*" />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No assets yet. Upload one above.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Filename</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Dimensions</th>
              <th style={thStyle}>Hotspot</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr
                key={a.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(a)}
              >
                <td style={selected?.id === a.id ? selectedRowStyle : tdStyle}>
                  {a.filename}
                </td>
                <td style={selected?.id === a.id ? selectedRowStyle : tdStyle}>
                  {a.contentType}
                </td>
                <td style={selected?.id === a.id ? selectedRowStyle : tdStyle}>
                  {a.width != null && a.height != null
                    ? `${a.width}x${a.height}`
                    : '—'}
                </td>
                <td style={selected?.id === a.id ? selectedRowStyle : tdStyle}>
                  {a.hotspot
                    ? `${a.hotspot.x.toFixed(2)}, ${a.hotspot.y.toFixed(2)}`
                    : '—'}
                </td>
                <td style={selected?.id === a.id ? selectedRowStyle : tdStyle}>
                  <button
                    style={dangerBtnStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div style={{ ...detailStyle, marginTop: 'var(--space-lg)' }}>
          <h2>{selected.filename}</h2>
          <p>
            {selected.contentType} — {selected.size} bytes
            {selected.width != null &&
              ` — ${selected.width}x${selected.height}`}
          </p>

          {selected.type === 'image' && (
            <>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Click the image to set a focal point (hotspot):
              </p>
              <HotspotOverlay
                src={getBlobObjectUrl(selected.blobKey)}
                hotspot={selected.hotspot}
                onChange={handleHotspot}
              />
            </>
          )}

          {selected.type !== 'image' && (
            <video
              src={getBlobObjectUrl(selected.blobKey)}
              controls
              style={previewStyle}
            />
          )}

          {imgproxyUrl && (
            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginTop: 'var(--space-md)',
                }}
              >
                imgproxy URL (800x600):
              </p>
              <div style={urlBoxStyle}>{imgproxyUrl}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
