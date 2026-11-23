/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, GitBranch, X } from 'lucide-react';
import { Restaurant } from '../types';
import { OwnedMenuSummary } from '../utils/storage';
import { DASH_EASE, dashModalMotion } from '../utils/dashboardMotion';

interface BranchSwitcherModalProps {
  isOpen: boolean;
  isStartupPrompt?: boolean;
  mainRid: string;
  activeRid: string;
  mainRest: Restaurant;
  branchesList: Restaurant[];
  ownedMenus?: OwnedMenuSummary[];
  isStore: boolean;
  onSelectBranch: (targetRid: string) => void;
  onSelectMenu?: (targetRid: string, targetSlug?: string) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({
  isOpen,
  mainRest,
  activeRid,
  branchesList,
  onSelectBranch,
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const allBranches: Array<{ rest: Restaurant; isMain: boolean }> = [
    { rest: mainRest, isMain: true },
    ...branchesList.map((b) => ({ rest: b, isMain: false })),
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mp-modal-backdrop"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mp-branch-modal-title"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: DASH_EASE }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(2, 6, 23, 0.68)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            {...dashModalMotion(prefersReducedMotion)}
            style={{
              width: 'min(420px, 100%)',
              maxHeight: '84dvh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '22px',
              background: 'var(--surface, #0f172a)',
              border: '1px solid color-mix(in srgb, var(--line) 85%, transparent)',
              boxShadow: '0 28px 64px rgba(0, 0, 0, 0.48)',
              overflow: 'hidden',
              color: 'var(--ink)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 18px',
                borderBottom: '1px solid var(--line)',
                background: 'color-mix(in srgb, var(--panel, var(--surface)) 72%, transparent)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    background: 'color-mix(in srgb, var(--brand) 16%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--brand) 32%, transparent)',
                    color: 'var(--brand-ink, var(--brand))',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GitBranch size={18} />
                </div>
                <h3
                  id="mp-branch-modal-title"
                  style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--ink)' }}
                >
                  اختر الفرع
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'color-mix(in srgb, var(--surface) 75%, transparent)',
                  color: 'var(--muted)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Branch Names Only */}
            <div
              style={{
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {allBranches.map(({ rest: b, isMain }) => {
                const isActive = b.id === activeRid;
                const branchLabel = isMain
                  ? mainRest.branchName?.trim() || mainRest.n
                  : b.branchName?.trim() || b.n;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBranch(b.id)}
                    style={{
                      width: '100%',
                      padding: '15px 18px',
                      borderRadius: '15px',
                      border: isActive
                        ? '1.5px solid var(--brand)'
                        : '1px solid color-mix(in srgb, var(--line) 85%, transparent)',
                      background: isActive
                        ? 'color-mix(in srgb, var(--brand) 10%, var(--surface))'
                        : 'color-mix(in srgb, var(--panel, var(--surface)) 78%, transparent)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      textAlign: 'start',
                      transition: 'border-color 0.16s ease, background 0.16s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {branchLabel}
                    </span>

                    <ChevronLeft
                      size={17}
                      style={{ color: isActive ? 'var(--brand)' : 'var(--muted)', flexShrink: 0 }}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
