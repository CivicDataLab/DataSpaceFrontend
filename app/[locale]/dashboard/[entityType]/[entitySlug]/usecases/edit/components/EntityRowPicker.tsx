'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Button, Icon, Spinner, Text } from 'opub-ui';
import { createPortal } from 'react-dom';

import { Icons } from '@/components/icons';
import styles from './entity-row-picker.module.scss';

export interface EntityRow {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  badge?: string;
  role?: string;
  kind?: EntityRowVariant;
  imageUrl?: string | null;
  href?: string;
}

export type EntityRowPickerHandle = {
  focus: () => void;
};

export type EntityRowVariant = 'dataset' | 'person' | 'org';

interface EntityRowPickerProps {
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription?: string;
  options: EntityRow[];
  selected: EntityRow[];
  variant?: EntityRowVariant;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onSearch?: (value: string) => void;
  onLoadMore?: () => void;
  onAdd: (item: EntityRow) => void;
  onRemove: (id: string) => void;
  roleOptionsFor?: (
    item: EntityRow
  ) => Array<{ label: string; value: string }>;
  onRoleChange?: (item: EntityRow, role: string) => void;
}

function EntityAvatar({
  variant,
  imageUrl,
  size = 40,
}: {
  variant: EntityRowVariant;
  imageUrl?: string | null;
  size?: number;
}) {
  const square = variant === 'dataset' || variant === 'org';

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={square ? styles.avatarImageSquare : styles.avatarImage}
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  const icon =
    variant === 'dataset'
      ? Icons.dataset
      : variant === 'org'
        ? Icons.userGroup
        : Icons.user;

  return (
    <span
      className={square ? styles.avatarSquare : styles.avatar}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon source={icon} size={size > 32 ? 18 : 16} />
    </span>
  );
}

function previewSummary(value?: string) {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function EntityCopy({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className={styles.copy}>
      <p className={styles.title}>{title}</p>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}

function ResultSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <span className={styles.skeletonAvatar} />
          <span className={styles.skeletonCopy}>
            <span
              className={`${styles.skeletonLine} ${styles.skeletonTitle}`}
            />
            <span
              className={`${styles.skeletonLine} ${styles.skeletonSubtitle}`}
            />
          </span>
        </div>
      ))}
    </>
  );
}

function LoadMoreSentinel({
  root,
  enabled,
  onLoadMore,
}: {
  root: HTMLElement | null;
  enabled: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !root || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { root, rootMargin: '80px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [enabled, root, onLoadMore]);

  return <div ref={sentinelRef} className={styles.sentinel} aria-hidden />;
}

export const EntityRowPicker = forwardRef<
  EntityRowPickerHandle,
  EntityRowPickerProps
>(function EntityRowPicker(
  {
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    options,
    selected,
    variant = 'person',
    hasMore = false,
    isLoading = false,
    isLoadingMore = false,
    onSearch,
    onLoadMore,
    onAdd,
    onRemove,
    roleOptionsFor,
    onRoleChange,
  },
  ref
) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [listEl, setListEl] = useState<HTMLDivElement | null>(null);
  const [awaitingResults, setAwaitingResults] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<EntityRow[]>([]);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [openSummaryIds, setOpenSummaryIds] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sawLoadingRef = useRef(false);
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const serverPaged = Boolean(onLoadMore);

  useImperativeHandle(ref, () => ({
    focus: () => {
      setOpen(true);
      inputRef.current?.focus();
    },
  }));

  useEffect(() => {
    onSearch?.(query);
  }, [query, onSearch]);

  useEffect(() => {
    if (isLoading) {
      sawLoadingRef.current = true;
      return;
    }
    if (sawLoadingRef.current) {
      sawLoadingRef.current = false;
      setAwaitingResults(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!awaitingResults) return;
    const timer = window.setTimeout(() => {
      if (!isLoadingRef.current) setAwaitingResults(false);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [awaitingResults, query]);

  useEffect(() => {
    if (!open) {
      setMenuRect(null);
      setListEl(null);
      return;
    }

    const updatePosition = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectedIds = new Set(selected.map((item) => item.id));
  const visible = options.filter((item) => {
    if (selectedIds.has(item.id)) return false;
    if (pendingAdds.some((pending) => pending.id === item.id)) return false;
    if (serverPaged) return true;
    return `${item.title} ${item.subtitle ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  useEffect(() => {
    const ids = new Set(selected.map((item) => item.id));
    setPendingAdds((prev) => prev.filter((item) => !ids.has(item.id)));
    setRemovingIds((prev) => prev.filter((id) => ids.has(id)));
  }, [selected]);

  useEffect(() => {
    if (pendingAdds.length === 0 && removingIds.length === 0) return;
    const timer = window.setTimeout(() => {
      const ids = new Set(selected.map((item) => item.id));
      setPendingAdds((prev) => prev.filter((item) => ids.has(item.id)));
      setRemovingIds((prev) => prev.filter((id) => ids.has(id)));
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [pendingAdds, removingIds, selected]);

  useEffect(() => {
    if (visible.length > 0) setAwaitingResults(false);
  }, [visible.length]);

  const searchField = (
    <div className={styles.trigger}>
      <span className={styles.searchIcon}>
        <Icon source={Icons.search} size={16} />
      </span>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        value={query}
        placeholder={searchPlaceholder}
        className={styles.searchInput}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setOpen(true);
          if (onSearch) setAwaitingResults(value.trim().length > 0);
        }}
        onFocus={() => setOpen(true)}
      />
    </div>
  );

  const emptyMessage = query.trim()
    ? 'No matches found.'
    : serverPaged
      ? 'No published datasets found.'
      : 'Start typing to search.';
  const showLoading =
    query.trim().length > 0 &&
    visible.length === 0 &&
    (isLoading || awaitingResults);
  const shownSelected = [
    ...selected,
    ...pendingAdds.filter((item) => !selectedIds.has(item.id)),
  ];

  const menu =
    open && menuRect
      ? createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            style={{
              position: 'fixed',
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              zIndex: 2000,
            }}
          >
            <div ref={setListEl} className={styles.menuList}>
              {showLoading ? (
                <ResultSkeleton />
              ) : visible.length > 0 ? (
                <>
                  {visible.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.menuItem}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onAdd(item);
                        setPendingAdds((prev) =>
                          prev.some((pending) => pending.id === item.id)
                            ? prev
                            : [...prev, item]
                        );
                        setQuery('');
                        setOpen(false);
                      }}
                    >
                      <EntityAvatar
                        variant={item.kind ?? variant}
                        imageUrl={item.imageUrl}
                      />
                      <EntityCopy title={item.title} subtitle={item.subtitle} />
                    </button>
                  ))}
                  {onLoadMore ? (
                    <LoadMoreSentinel
                      root={listEl}
                      enabled={hasMore && !isLoadingMore}
                      onLoadMore={onLoadMore}
                    />
                  ) : null}
                  {isLoadingMore ? (
                    <div className={styles.footer}>
                      <Spinner />
                    </div>
                  ) : null}
                </>
              ) : (
                <div className={styles.empty}>
                  <Text variant="bodySm" color="subdued">
                    {emptyMessage}
                  </Text>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div ref={wrapRef}>{searchField}</div>
      {menu}

      {shownSelected.length === 0 ? (
        <div className={styles.placeholder}>
          <Text color="subdued">{emptyTitle}</Text>
          {emptyDescription ? (
            <div className="mt-1">
              <Text variant="bodySm" color="subdued">
                {emptyDescription}
              </Text>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.selectedCards}>
          {shownSelected.map((item) => {
            const isPending = pendingAdds.some(
              (pending) => pending.id === item.id && !selectedIds.has(item.id)
            );
            const isRemoving = removingIds.includes(item.id);
            const isBusy = isPending || isRemoving;

            const summary = previewSummary(item.summary);
            const summaryOpen = openSummaryIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`${styles.card} ${isBusy ? styles.selectedRowBusy : ''}`}
              >
                <div className={styles.selectedHeader}>
                  <div className="flex min-w-0 items-center gap-3">
                    <EntityAvatar
                      variant={item.kind ?? variant}
                      imageUrl={item.imageUrl}
                      size={(item.kind ?? variant) === 'person' ? 32 : 36}
                    />
                    <div className={styles.copy}>
                      <p
                        className={`${styles.title} ${variant === 'dataset' ? '' : styles.titlePerson}`}
                      >
                        {item.title}
                      </p>
                      {variant === 'dataset' ? (
                        <div className={styles.meta}>
                          {item.badge ? (
                            <span className={styles.badge}>{item.badge}</span>
                          ) : null}
                          {item.subtitle ? (
                            <span className={styles.subtitle}>{item.subtitle}</span>
                          ) : null}
                        </div>
                      ) : variant === 'person' ? null : item.subtitle ? (
                        <p className={styles.subtitle}>{item.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isBusy ? (
                      <span
                        className={styles.selectedSpinner}
                        aria-label="Saving"
                      >
                        <Spinner />
                      </span>
                    ) : (
                      <>
                        {variant === 'dataset' ? (
                          <Button
                            kind="tertiary"
                            onClick={() =>
                              setOpenSummaryIds((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              )
                            }
                          >
                            {summaryOpen ? 'Hide' : 'View'}
                          </Button>
                        ) : item.href ? (
                          <Button kind="tertiary" url={item.href}>
                            View
                          </Button>
                        ) : null}
                        {roleOptionsFor ? (
                          <select
                            className={styles.roleSelect}
                            value={item.role ?? ''}
                            aria-label={`Relationship for ${item.title}`}
                            onChange={(event) =>
                              onRoleChange?.(item, event.target.value)
                            }
                          >
                            {roleOptionsFor(item).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : variant === 'person' ? (
                          <input
                            type="text"
                            className={styles.roleInput}
                            value={item.role ?? ''}
                            placeholder="Role"
                            aria-label={`Role for ${item.title}`}
                            disabled
                          />
                        ) : null}
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => {
                            setRemovingIds((prev) =>
                              prev.includes(item.id) ? prev : [...prev, item.id]
                            );
                            onRemove(item.id);
                          }}
                          aria-label={`Remove ${item.title}`}
                        >
                          <Icon source={Icons.delete} size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {variant === 'dataset' && summaryOpen && summary ? (
                  <div className={styles.summary}>
                    <p className={styles.summaryText}>{summary}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
