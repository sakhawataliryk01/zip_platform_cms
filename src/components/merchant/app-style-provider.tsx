"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  APP_PHONE_STYLES,
  APP_STYLE_STORAGE_KEY,
  DEFAULT_APP_STYLE,
  isAppStylePresetKey,
  type AppPhoneStyle,
  type AppStylePresetKey,
} from "@/lib/app-style-presets";
import {
  APP_PREVIEW_STORAGE_KEY,
  DEFAULT_PREVIEW_CONFIG,
  applyPresetToPreview,
  parsePreviewConfig,
  withHomeSectionChange,
  type AppPreviewConfig,
  type HomeSectionId,
  type PreviewBlockId,
} from "@/lib/app-preview-config";
import { describeDesignChanges } from "@/lib/design-change-hints";

type AppStyleContextValue = {
  presetKey: AppStylePresetKey;
  style: AppPhoneStyle;
  preview: AppPreviewConfig;
  setPresetKey: (key: AppStylePresetKey) => void;
  updatePreview: (patch: Partial<AppPreviewConfig>) => void;
  toggleBlock: (id: PreviewBlockId) => void;
  moveBlock: (id: PreviewBlockId, direction: "up" | "down") => void;
  toggleHomeSection: (id: HomeSectionId) => void;
  moveHomeSection: (id: HomeSectionId, direction: "up" | "down") => void;
  ready: boolean;
};

const AppStyleContext = createContext<AppStyleContextValue | null>(null);

export function AppStyleProvider({ children }: { children: React.ReactNode }) {
  const [presetKey, setPresetKeyState] =
    useState<AppStylePresetKey>(DEFAULT_APP_STYLE);
  const [preview, setPreview] = useState<AppPreviewConfig>(DEFAULT_PREVIEW_CONFIG);
  const [ready, setReady] = useState(false);
  const presetKeyRef = useRef<AppStylePresetKey>(DEFAULT_APP_STYLE);
  const previewRef = useRef<AppPreviewConfig>(DEFAULT_PREVIEW_CONFIG);
  const lastSnapshotRef = useRef<{
    presetKey: AppStylePresetKey;
    preview: AppPreviewConfig;
  } | null>(null);
  const notifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNotify = useRef(true);

  useEffect(() => {
    try {
      const savedPreset = window.localStorage.getItem(APP_STYLE_STORAGE_KEY);
      if (isAppStylePresetKey(savedPreset)) {
        setPresetKeyState(savedPreset);
        presetKeyRef.current = savedPreset;
      }
      const savedPreview = parsePreviewConfig(
        window.localStorage.getItem(APP_PREVIEW_STORAGE_KEY)
      );
      if (savedPreview) {
        setPreview(savedPreview);
        previewRef.current = savedPreview;
      }
      lastSnapshotRef.current = {
        presetKey: presetKeyRef.current,
        preview: previewRef.current,
      };
    } catch {
      // ignore
    }
    setReady(true);
    const unlock = window.setTimeout(() => {
      skipNotify.current = false;
    }, 1200);
    return () => window.clearTimeout(unlock);
  }, []);

  const notifyAdminOfDesign = useCallback(
    (key: AppStylePresetKey, next: AppPreviewConfig) => {
      if (skipNotify.current) return;
      if (notifyTimer.current) clearTimeout(notifyTimer.current);
      notifyTimer.current = setTimeout(() => {
        const changes = describeDesignChanges(lastSnapshotRef.current, {
          presetKey: key,
          preview: next,
        });
        fetch("/api/merchant/app-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetKey: key,
            preview: next,
            changeHints: changes,
          }),
        })
          .then(() => {
            lastSnapshotRef.current = { presetKey: key, preview: next };
          })
          .catch(() => {
            // ignore network errors — local preview still works
          });
      }, 1800);
    },
    []
  );

  const persistLocal = useCallback(
    (key: AppStylePresetKey, next: AppPreviewConfig) => {
      try {
        window.localStorage.setItem(APP_STYLE_STORAGE_KEY, key);
        window.localStorage.setItem(APP_PREVIEW_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(
          new CustomEvent("merchant-app-style-change", { detail: key })
        );
        window.dispatchEvent(
          new CustomEvent("merchant-app-preview-change", { detail: next })
        );
      } catch {
        // ignore
      }
    },
    []
  );

  const setPresetKey = useCallback(
    (key: AppStylePresetKey) => {
      setPresetKeyState(key);
      presetKeyRef.current = key;
      setPreview((current) => {
        const next = applyPresetToPreview(key, current);
        previewRef.current = next;
        persistLocal(key, next);
        notifyAdminOfDesign(key, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  const updatePreview = useCallback(
    (patch: Partial<AppPreviewConfig>) => {
      setPreview((current) => {
        const next = { ...current, ...patch };
        previewRef.current = next;
        persistLocal(presetKeyRef.current, next);
        notifyAdminOfDesign(presetKeyRef.current, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  const toggleBlock = useCallback(
    (id: PreviewBlockId) => {
      setPreview((current) => {
        const hidden = current.hiddenBlocks.includes(id)
          ? current.hiddenBlocks.filter((b) => b !== id)
          : [...current.hiddenBlocks, id];
        const next = { ...current, hiddenBlocks: hidden };
        previewRef.current = next;
        persistLocal(presetKeyRef.current, next);
        notifyAdminOfDesign(presetKeyRef.current, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  const moveBlock = useCallback(
    (id: PreviewBlockId, direction: "up" | "down") => {
      setPreview((current) => {
        const order = [...current.blockOrder];
        const index = order.indexOf(id);
        if (index < 0) return current;
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= order.length) return current;
        [order[index], order[target]] = [order[target], order[index]];
        const next = { ...current, blockOrder: order };
        previewRef.current = next;
        persistLocal(presetKeyRef.current, next);
        notifyAdminOfDesign(presetKeyRef.current, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  const toggleHomeSection = useCallback(
    (id: HomeSectionId) => {
      setPreview((current) => {
        const hidden = current.hiddenHomeSections.includes(id)
          ? current.hiddenHomeSections.filter((b) => b !== id)
          : [...current.hiddenHomeSections, id];
        const next = withHomeSectionChange(current, {
          hiddenHomeSections: hidden,
        });
        previewRef.current = next;
        persistLocal(presetKeyRef.current, next);
        notifyAdminOfDesign(presetKeyRef.current, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  const moveHomeSection = useCallback(
    (id: HomeSectionId, direction: "up" | "down") => {
      setPreview((current) => {
        const order = [...current.homeSections];
        const index = order.indexOf(id);
        if (index < 0) return current;
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= order.length) return current;
        [order[index], order[target]] = [order[target], order[index]];
        const next = withHomeSectionChange(current, { homeSections: order });
        previewRef.current = next;
        persistLocal(presetKeyRef.current, next);
        notifyAdminOfDesign(presetKeyRef.current, next);
        return next;
      });
    },
    [persistLocal, notifyAdminOfDesign]
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === APP_STYLE_STORAGE_KEY && isAppStylePresetKey(e.newValue)) {
        setPresetKeyState(e.newValue);
        presetKeyRef.current = e.newValue;
      }
      if (e.key === APP_PREVIEW_STORAGE_KEY) {
        const parsed = parsePreviewConfig(e.newValue);
        if (parsed) {
          setPreview(parsed);
          previewRef.current = parsed;
        }
      }
    };
    const onStyle = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (isAppStylePresetKey(detail)) {
        setPresetKeyState(detail);
        presetKeyRef.current = detail;
      }
    };
    const onPreview = (e: Event) => {
      const detail = (e as CustomEvent<AppPreviewConfig>).detail;
      if (detail) {
        setPreview(detail);
        previewRef.current = detail;
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("merchant-app-style-change", onStyle);
    window.addEventListener("merchant-app-preview-change", onPreview);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("merchant-app-style-change", onStyle);
      window.removeEventListener("merchant-app-preview-change", onPreview);
    };
  }, []);

  const value = useMemo(
    () => ({
      presetKey,
      style: APP_PHONE_STYLES[presetKey],
      preview,
      setPresetKey,
      updatePreview,
      toggleBlock,
      moveBlock,
      toggleHomeSection,
      moveHomeSection,
      ready,
    }),
    [
      presetKey,
      preview,
      setPresetKey,
      updatePreview,
      toggleBlock,
      moveBlock,
      toggleHomeSection,
      moveHomeSection,
      ready,
    ]
  );

  return (
    <AppStyleContext.Provider value={value}>{children}</AppStyleContext.Provider>
  );
}

export function useAppStyle() {
  const ctx = useContext(AppStyleContext);
  if (!ctx) {
    return {
      presetKey: DEFAULT_APP_STYLE,
      style: APP_PHONE_STYLES[DEFAULT_APP_STYLE],
      preview: DEFAULT_PREVIEW_CONFIG,
      setPresetKey: (_key: AppStylePresetKey) => undefined,
      updatePreview: (_patch: Partial<AppPreviewConfig>) => undefined,
      toggleBlock: (_id: PreviewBlockId) => undefined,
      moveBlock: (_id: PreviewBlockId, _direction: "up" | "down") => undefined,
      toggleHomeSection: (_id: HomeSectionId) => undefined,
      moveHomeSection: (_id: HomeSectionId, _direction: "up" | "down") =>
        undefined,
      ready: false,
    };
  }
  return ctx;
}
