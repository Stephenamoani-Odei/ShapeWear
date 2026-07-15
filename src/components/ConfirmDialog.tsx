import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// A styled stand-in for window.confirm(), consistent with the rest of the admin UI
// and usable anywhere a destructive action needs a confirmation step.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div
            style={{
              flexShrink: 0,
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '9999px',
              backgroundColor: danger ? '#fee2e2' : '#fef3c7',
              color: danger ? '#dc2626' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1.5rem' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white',
              backgroundColor: danger ? '#dc2626' : '#111827',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
