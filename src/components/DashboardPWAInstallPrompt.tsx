/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Download, MoreVertical, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import type { PushPermissionState } from '../utils/pwaPush';

interface DashboardPWAInstallProps {
  restaurantName: string;
  branchName?: string;
  storageKeyId?: string;
  showToast: (msg: string) => void;
}

const DISMISS_KEY = 'mp_dash_pwa_banner_dismissed';

export const DashboardPWAInstallBanner: React.FC<DashboardPWAInstallProps> = ({
  restaurantName,
  branchName,
  storageKeyId,
  showToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const resolvedDismissKey = storageKeyId ? `${DISMISS_KEY}_${storageKeyId}` : DISMISS_KEY;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(resolvedDismissKey) === '1';
    } catch {
      return false;
    }
  });
  const [guideOpen, setGuideOpen] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const targetTitle = branchName ? `${restaurantName} (${branchName})` : restaurantName;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        showToast('تم تثبيت لوحة التحكم كتطبيق بنجاح ✓');
      }
      return;
    }
    setGuideOpen(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(resolvedDismissKey, '1');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <>
      <div className="mp-pwa-banner" dir="rtl">
        <div className="mp-pwa-banner-info">
          <div className="mp-pwa-banner-ico" aria-hidden="true">
            <Smartphone size={19} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="mp-pwa-banner-title">ثبّت لوحة التحكم كتطبيق</div>
            <div className="mp-pwa-banner-sub">
              افتح لوحة {targetTitle} مباشرة من الشاشة الرئيسية بدون متصفح
            </div>
          </div>
        </div>

        <div className="mp-pwa-banner-actions">
          <button
            type="button"
            className="mp-pwa-install-btn"
            onClick={() => void handleInstallClick()}
          >
            <Download size={15} />
            <span>تثبيت التطبيق</span>
          </button>

          <button
            type="button"
            className="mp-pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="إخفاء إشعار التثبيت"
            title="إخفاء"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {guideOpen && (
        <InstallGuideModal
          isIOS={isIOS}
          restaurantName={targetTitle}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </>
  );
};

export const DashboardPushPermissionBanner: React.FC<{
  permission: PushPermissionState;
  onEnable: () => void;
}> = ({ permission, onEnable }) => {
  const [dismissed, setDismissed] = useState(false);

  if (permission !== 'default' || dismissed) {
    return null;
  }

  return (
    <div className="mp-pwa-banner" dir="rtl" style={{ marginBottom: '12px' }}>
      <div className="mp-pwa-banner-info">
        <div className="mp-pwa-banner-ico" aria-hidden="true">
          <Bell size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mp-pwa-banner-title">تفعيل إشعارات الطلبات الفورية</div>
          <div className="mp-pwa-banner-sub">
            اسمح بالتنبيهات ليصلك إشعار فوري عند كل طلب جديد حتى لو كان التطبيق مغلقاً
          </div>
        </div>
      </div>

      <div className="mp-pwa-banner-actions">
        <button
          type="button"
          className="mp-pwa-install-btn"
          onClick={onEnable}
        >
          <Bell size={15} />
          <span>تفعيل الإشعارات</span>
        </button>

        <button
          type="button"
          className="mp-pwa-dismiss-btn"
          onClick={() => setDismissed(true)}
          aria-label="إغلاق"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export const DashboardSidebarInstallButton: React.FC<
  DashboardPWAInstallProps & { onAction?: () => void }
> = ({ restaurantName, branchName, showToast, onAction }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [guideOpen, setGuideOpen] = useState(false);

  if (isInstalled) {
    return null;
  }

  const targetTitle = branchName ? `${restaurantName} (${branchName})` : restaurantName;

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        showToast('تم تثبيت لوحة التحكم كتطبيق بنجاح ✓');
        onAction?.();
      }
      return;
    }
    setGuideOpen(true);
  };

  const handleCloseGuide = () => {
    setGuideOpen(false);
    onAction?.();
  };

  return (
    <>
      <button
        type="button"
        className="sb-footer-item mp-sb-pwa-btn"
        onClick={() => void handleClick()}
      >
        <Download size={17} style={{ color: 'var(--brand-ink, #10b981)', flexShrink: 0 }} />
        <span>ثبّت لوحة التحكم كتطبيق</span>
      </button>

      {guideOpen && (
        <InstallGuideModal
          isIOS={isIOS}
          restaurantName={targetTitle}
          onClose={handleCloseGuide}
        />
      )}
    </>
  );
};

const InstallGuideModal: React.FC<{
  isIOS: boolean;
  restaurantName: string;
  onClose: () => void;
}> = ({ isIOS, restaurantName, onClose }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="mp-modal-backdrop"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(2, 6, 23, 0.68)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          borderRadius: '20px',
          padding: '20px',
          background: 'var(--surface, #0f172a)',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'color-mix(in srgb, var(--brand) 16%, transparent)',
                color: 'var(--brand-ink, var(--brand))',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Smartphone size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>
                تثبيت لوحة التحكم كتطبيق
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                {restaurantName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--muted)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {isIOS ? (
          <ol
            style={{
              margin: '12px 0 16px',
              paddingInlineStart: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'var(--ink)',
            }}
          >
            <li>
              اضغط على زر <b>المشاركة</b>{' '}
              <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--brand-ink, var(--brand))' }} />{' '}
              في شريط متصفح Safari.
            </li>
            <li>
              مرر للأسفل واختر <b>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</b>.
            </li>
            <li>
              اضغط <b>إضافة</b> — عند فتح التطبيق مستقبلاً سيدخلك مباشرة إلى لوحة التحكم والفرع الذي كنت تعمل عليه.
            </li>
          </ol>
        ) : (
          <ol
            style={{
              margin: '12px 0 16px',
              paddingInlineStart: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'var(--ink)',
            }}
          >
            <li>
              افتح قائمة المتصفح{' '}
              <MoreVertical size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              من الزاوية العلوية.
            </li>
            <li>
              اختر <b>تثبيت التطبيق (Install App)</b> أو <b>الإضافة إلى الشاشة الرئيسية</b>.
            </li>
            <li>
              بعد التثبيت، فتح التطبيق سيدخلك تلقائياً إلى لوحة التحكم الخاصة بك.
            </li>
          </ol>
        )}

        <button
          type="button"
          className="btn p"
          onClick={onClose}
          style={{ width: '100%', height: '42px', borderRadius: '12px', fontWeight: 800 }}
        >
          فهمت، حسناً
        </button>
      </div>
    </div>,
    document.body
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div
      dir="rtl"
      role="status"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '12px',
        background: '#d97706',
        color: '#ffffff',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 800,
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
      }}
    >
      <WifiOff size={14} />
      <span>وضع عدم الاتصال — يتم استخدام البيانات المحفوظة</span>
    </div>
  );
};
