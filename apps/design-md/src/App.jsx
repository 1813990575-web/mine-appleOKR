import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { brands, themeOrder, themes } from './data';
import { getBrandWebsite } from './brandWebsites';
import { getBrandPreviewFallbackLabel, getBrandPreviewSrc } from './brandPreviews';
import { getBrandProfile } from './brandProfiles';

const modeCopy = {
  compare: {
    title: '对比视图',
    body: '按主题查看不同品牌的规范表达。',
  },
  single: {
    title: '单品牌视图',
    body: '聚焦一个品牌并按主题逐项审阅。',
  },
};

const COLOR_FILTER_OPTIONS = [
  { id: 'all', label: '全部' },
  { id: 'black', label: '黑色' },
  { id: 'gray', label: '灰色' },
  { id: 'white', label: '白色' },
  { id: 'red', label: '红色' },
  { id: 'orange', label: '橙色' },
  { id: 'yellow', label: '黄色' },
  { id: 'green', label: '绿色' },
  { id: 'cyan', label: '青色' },
  { id: 'blue', label: '蓝色' },
  { id: 'purple', label: '紫色' },
  { id: 'magenta', label: '品红' },
];

let cssColorProbe = null;
const neutralColorCache = new Map();
const colorProfileCache = new Map();
const COLOR_CLASSIFICATION_RULES = {
  neutralChromaBase: 0.014,
  neutralChromaLift: 0.012,
  blackMaxL: 0.24,
  whiteMinL: 0.92,
  neutralBands: [
    { id: 'deep-black', label: '深黑', maxL: 0.16 },
    { id: 'near-black', label: '近黑', maxL: 0.24 },
    { id: 'dark-gray', label: '深灰', maxL: 0.42 },
    { id: 'mid-gray', label: '中灰', maxL: 0.62 },
    { id: 'light-gray', label: '浅灰', maxL: 0.82 },
    { id: 'off-white', label: '近白', maxL: 0.92 },
    { id: 'pure-white', label: '纯白', maxL: 1 },
  ],
  chromaticBands: [
    { id: 'deep-color', label: '深色', maxL: 0.35 },
    { id: 'mid-color', label: '中色', maxL: 0.62 },
    { id: 'light-color', label: '浅色', maxL: 0.84 },
    { id: 'pastel-color', label: '粉彩', maxL: 1 },
  ],
};

const SECONDARY_FILTER_MAP = {
  black: ['deep-black', 'near-black'],
  gray: ['dark-gray', 'mid-gray', 'light-gray'],
  white: ['off-white', 'pure-white'],
  red: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  orange: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  yellow: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  green: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  cyan: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  blue: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  purple: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
  magenta: ['deep-color', 'mid-color', 'light-color', 'pastel-color'],
};

function ensureCssColorProbe() {
  if (typeof document === 'undefined') return null;
  if (cssColorProbe) return cssColorProbe;

  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'absolute';
  probe.style.width = '0';
  probe.style.height = '0';
  probe.style.opacity = '0';
  probe.style.pointerEvents = 'none';
  probe.style.left = '-9999px';
  probe.style.top = '-9999px';

  const mountTarget = document.body || document.documentElement;
  mountTarget.appendChild(probe);
  cssColorProbe = probe;
  return cssColorProbe;
}

function parseComputedRgb(rawValue) {
  const normalized = rawValue.replace(/\//g, ',');
  const match = normalized.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;

  const parts = match[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) return null;

  const r = Number.parseFloat(parts[0]);
  const g = Number.parseFloat(parts[1]);
  const b = Number.parseFloat(parts[2]);
  const alpha = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;

  if ([r, g, b, alpha].some((value) => Number.isNaN(value))) return null;

  return { r, g, b, alpha };
}

function parseColorToRgba(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const probe = ensureCssColorProbe();
  if (!probe) return null;

  probe.style.color = '';
  probe.style.color = value.trim();
  if (!probe.style.color) return null;

  const computedValue = window.getComputedStyle(probe).color;
  return parseComputedRgb(computedValue);
}

function srgbToLinear(channel) {
  const normalized = channel / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab({ r, g, b }) {
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  const l = 0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB;
  const m = 0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB;
  const s = 0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

function classifyNeutralColor(colorValue) {
  const cacheKey = `${colorValue}`.trim().toLowerCase();
  if (neutralColorCache.has(cacheKey)) {
    return neutralColorCache.get(cacheKey);
  }

  const profile = getColorProfile(colorValue);
  if (!profile) {
    neutralColorCache.set(cacheKey, null);
    return null;
  }

  if (profile.family !== 'neutral') {
    neutralColorCache.set(cacheKey, null);
    return null;
  }

  const tone =
    profile.l <= COLOR_CLASSIFICATION_RULES.blackMaxL
      ? 'black'
      : profile.l >= COLOR_CLASSIFICATION_RULES.whiteMinL
        ? 'white'
        : 'gray';

  neutralColorCache.set(cacheKey, tone);
  return tone;
}

function matchesColorFilter(colorValue, filterId, subFilterId = 'all') {
  const matchesSubFilter = (profile) => {
    if (subFilterId === 'all') return true;
    if (!profile) return false;

    const neutralMatch = profile.family === 'neutral' && profile.neutralBandId === subFilterId;
    const chromaticMatch = profile.family === 'chromatic' && profile.chromaticBandId === subFilterId;
    return neutralMatch || chromaticMatch;
  };

  if (filterId === 'all') return true;
  if (filterId === 'black' || filterId === 'gray' || filterId === 'white') {
    const tone = classifyNeutralColor(colorValue);
    if (tone !== filterId) return false;
    return matchesSubFilter(getColorProfile(colorValue));
  }

  const profile = getColorProfile(colorValue);
  if (!profile || profile.family !== 'chromatic') return false;
  if (profile.hueId !== filterId) return false;
  return matchesSubFilter(profile);
}

function getNeutralBand(l) {
  return (
    COLOR_CLASSIFICATION_RULES.neutralBands.find((band) => l <= band.maxL) ||
    COLOR_CLASSIFICATION_RULES.neutralBands[COLOR_CLASSIFICATION_RULES.neutralBands.length - 1]
  );
}

function getChromaticBand(l) {
  return (
    COLOR_CLASSIFICATION_RULES.chromaticBands.find((band) => l <= band.maxL) ||
    COLOR_CLASSIFICATION_RULES.chromaticBands[COLOR_CLASSIFICATION_RULES.chromaticBands.length - 1]
  );
}

function getSecondaryFilterOptions(mainFilterId) {
  const subFilterIds = SECONDARY_FILTER_MAP[mainFilterId];
  if (!subFilterIds?.length) return [];

  const neutralLookup = Object.fromEntries(
    COLOR_CLASSIFICATION_RULES.neutralBands.map((band) => [band.id, band.label]),
  );
  const chromaticLookup = Object.fromEntries(
    COLOR_CLASSIFICATION_RULES.chromaticBands.map((band) => [band.id, band.label]),
  );

  return subFilterIds.map((id) => ({
    id,
    label: neutralLookup[id] || chromaticLookup[id] || id,
  }));
}

function getHueProfile(a, b) {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  const normalizedHue = (hue + 360) % 360;

  if (normalizedHue < 20 || normalizedHue >= 345) return { id: 'red', label: '红色' };
  if (normalizedHue < 45) return { id: 'orange', label: '橙色' };
  if (normalizedHue < 75) return { id: 'yellow', label: '黄色' };
  if (normalizedHue < 165) return { id: 'green', label: '绿色' };
  if (normalizedHue < 205) return { id: 'cyan', label: '青色' };
  if (normalizedHue < 255) return { id: 'blue', label: '蓝色' };
  if (normalizedHue < 300) return { id: 'purple', label: '紫色' };
  return { id: 'magenta', label: '品红' };
}

function getColorProfile(colorValue) {
  const cacheKey = `${colorValue}`.trim().toLowerCase();
  if (colorProfileCache.has(cacheKey)) {
    return colorProfileCache.get(cacheKey);
  }

  const rgba = parseColorToRgba(colorValue);
  if (!rgba) {
    colorProfileCache.set(cacheKey, null);
    return null;
  }

  const lab = rgbToOklab(rgba);
  const chroma = Math.hypot(lab.a, lab.b);
  const neutralThreshold =
    COLOR_CLASSIFICATION_RULES.neutralChromaBase +
    Math.abs(lab.l - 0.5) * COLOR_CLASSIFICATION_RULES.neutralChromaLift;
  const isNeutral = chroma <= neutralThreshold;
  const neutralBand = getNeutralBand(lab.l);
  const chromaticBand = getChromaticBand(lab.l);
  const hueProfile = isNeutral ? null : getHueProfile(lab.a, lab.b);

  const profile = {
    family: isNeutral ? 'neutral' : 'chromatic',
    l: lab.l,
    a: lab.a,
    b: lab.b,
    chroma,
    alpha: rgba.alpha,
    hueId: hueProfile?.id || null,
    hueLabel: hueProfile?.label || null,
    neutralBandId: neutralBand.id,
    neutralBandLabel: neutralBand.label,
    chromaticBandId: chromaticBand.id,
    chromaticBandLabel: chromaticBand.label,
  };

  colorProfileCache.set(cacheKey, profile);
  return profile;
}

function buildColorCartKey({ brandId, brandName, group, name, value }) {
  return `${brandId || brandName}-${group}-${name}-${value}`.trim().toLowerCase();
}

function readInitialViewState() {
  const fallback = {
    mode: 'compare',
    theme: 'colors',
    brandId: brands[0]?.id || '',
  };

  if (typeof window === 'undefined') return fallback;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const theme = params.get('theme');
  const brandId = params.get('brand');

  const nextMode = mode === 'single' || mode === 'compare' ? mode : fallback.mode;
  const nextTheme = themeOrder.includes(theme) ? theme : fallback.theme;
  const nextBrandId = brands.some((brand) => brand.id === brandId) ? brandId : fallback.brandId;

  return {
    mode: nextMode,
    theme: nextTheme,
    brandId: nextBrandId,
  };
}

function App() {
  const initialViewState = useMemo(() => readInitialViewState(), []);
  const [mode, setMode] = useState(initialViewState.mode);
  const [activeTheme, setActiveTheme] = useState(initialViewState.theme);
  const [colorFilter, setColorFilter] = useState('all');
  const [colorSubFilter, setColorSubFilter] = useState('all');
  const [colorCartDraft, setColorCartDraft] = useState([]);
  const [draftEditingGroup, setDraftEditingGroup] = useState(null);
  const [savedColorGroups, setSavedColorGroups] = useState([]);
  const [cartIsActive, setCartIsActive] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [isColorVaultOpen, setIsColorVaultOpen] = useState(false);
  const [isColorSpaceOpen, setIsColorSpaceOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState(brands.map((brand) => brand.id));
  const [singleBrandId, setSingleBrandId] = useState(initialViewState.brandId);
  const [pinnedBrandIds, setPinnedBrandIds] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, brandId: null });
  const [colorCardContextMenu, setColorCardContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    sourceRect: null,
  });
  const [copiedValue, setCopiedValue] = useState('');
  const [dotToast, setDotToast] = useState(null);
  const contextMenuRef = useRef(null);
  const colorCardContextMenuRef = useRef(null);
  const cartButtonRef = useRef(null);
  const nextColorGroupIndexRef = useRef(1);
  const dotToastTimerRef = useRef(null);
  const contextBrand = useMemo(
    () => brands.find((brand) => brand.id === contextMenu.brandId) || null,
    [contextMenu.brandId],
  );
  const contextBrandWebsite = useMemo(() => getBrandWebsite(contextBrand), [contextBrand]);
  const colorCartCount = colorCartDraft.length;

  const orderedBrands = useMemo(() => {
    const pinned = pinnedBrandIds
      .map((id) => brands.find((brand) => brand.id === id))
      .filter(Boolean);
    const pinnedSet = new Set(pinned.map((brand) => brand.id));
    const rest = brands.filter((brand) => !pinnedSet.has(brand.id));
    return [...pinned, ...rest];
  }, [pinnedBrandIds]);

  const visibleBrands = useMemo(
    () => orderedBrands.filter((brand) => brandFilter.includes(brand.id)),
    [brandFilter, orderedBrands],
  );
  const secondaryFilterOptions = useMemo(
    () => getSecondaryFilterOptions(colorFilter),
    [colorFilter],
  );
  const globalColorCounts = useMemo(() => {
    const counts = Object.fromEntries(COLOR_FILTER_OPTIONS.map((option) => [option.id, 0]));

    visibleBrands.forEach((brand) => {
      brand.colors.forEach((group) => {
        group.items.forEach((item) => {
          counts.all += 1;
          COLOR_FILTER_OPTIONS.forEach((option) => {
            if (option.id === 'all') return;
            if (matchesColorFilter(item.value, option.id)) {
              counts[option.id] += 1;
            }
          });
        });
      });
    });

    return counts;
  }, [visibleBrands]);
  const globalSecondaryCounts = useMemo(() => {
    if (!secondaryFilterOptions.length) return {};

    const counts = Object.fromEntries(secondaryFilterOptions.map((option) => [option.id, 0]));
    visibleBrands.forEach((brand) => {
      brand.colors.forEach((group) => {
        group.items.forEach((item) => {
          secondaryFilterOptions.forEach((option) => {
            if (matchesColorFilter(item.value, colorFilter, option.id)) {
              counts[option.id] += 1;
            }
          });
        });
      });
    });

    return counts;
  }, [colorFilter, secondaryFilterOptions, visibleBrands]);
  const globalFilteredColors = useMemo(() => {
    if (colorFilter === 'all') return [];

    return visibleBrands.flatMap((brand) =>
      brand.colors.flatMap((group) =>
        group.items
          .filter((item) => matchesColorFilter(item.value, colorFilter, colorSubFilter))
          .map((item) => ({
            ...item,
            brandId: brand.id,
            brandName: brand.name,
            group: group.group,
            key: `${brand.id}-${group.group}-${item.name}-${item.value}`,
          })),
      ),
    );
  }, [colorFilter, colorSubFilter, visibleBrands]);
  const isGlobalColorView = mode === 'compare' && activeTheme === 'colors' && colorFilter !== 'all';
  const singleBrand = useMemo(() => brands.find((brand) => brand.id === singleBrandId) || null, [singleBrandId]);

  useEffect(() => {
    if (singleBrand) return;
    if (!brands.length) return;
    setSingleBrandId(brands[0].id);
  }, [singleBrand]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('mode', mode);
    params.set('theme', activeTheme);
    if (singleBrandId) {
      params.set('brand', singleBrandId);
    } else {
      params.delete('brand');
    }
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
  }, [mode, activeTheme, singleBrandId]);

  useEffect(() => {
    setColorSubFilter('all');
  }, [colorFilter]);

  function toggleBrand(id) {
    setBrandFilter((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function jumpToBrand(id) {
    const targetId = `${id}-${activeTheme}`;

    if (!brandFilter.includes(id)) {
      setBrandFilter((current) => (current.includes(id) ? current : [...current, id]));
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeBrandContextMenu() {
    setContextMenu((current) =>
      current.visible ? { visible: false, x: 0, y: 0, brandId: null } : current,
    );
  }

  function closeColorCardContextMenu() {
    setColorCardContextMenu((current) =>
      current.visible
        ? { visible: false, x: 0, y: 0, item: null, sourceRect: null }
        : current,
    );
  }

  const animateColorFlyToCart = useCallback((colorValue, sourceRect) => {
    if (!sourceRect || !cartButtonRef.current || typeof document === 'undefined') return;

    const cartRect = cartButtonRef.current.getBoundingClientRect();
    const token = document.createElement('div');
    token.className = 'color-cart-fly-token';
    token.style.background = colorValue;
    token.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
    token.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
    document.body.appendChild(token);

    const targetX = cartRect.left + cartRect.width / 2;
    const targetY = cartRect.top + cartRect.height / 2;

    window.requestAnimationFrame(() => {
      token.style.left = `${targetX}px`;
      token.style.top = `${targetY}px`;
      token.style.transform = 'translate(-50%, -50%) scale(0.2)';
      token.style.opacity = '0.08';
    });

    window.setTimeout(() => {
      token.remove();
    }, 520);
  }, []);

  function triggerCartPulse() {
    setCartIsActive(false);
    window.requestAnimationFrame(() => {
      setCartIsActive(true);
    });
    window.setTimeout(() => {
      setCartIsActive(false);
    }, 420);
  }

  function openBrandContextMenu(event, brandId) {
    event.preventDefault();
    event.stopPropagation();
    const brand = brands.find((item) => item.id === brandId) || null;
    const hasWebsite = Boolean(getBrandWebsite(brand));
    const menuWidth = 172;
    const menuHeight = hasWebsite ? 92 : 52;
    const safeX = Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8));
    const safeY = Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8));
    closeColorCardContextMenu();
    setContextMenu({ visible: true, x: safeX, y: safeY, brandId });
  }

  function openColorCardContextMenu(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 188;
    const menuHeight = 50;
    const safeX = Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8));
    const safeY = Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8));
    const sourceRect = event.currentTarget.getBoundingClientRect();

    closeBrandContextMenu();
    setColorCardContextMenu({
      visible: true,
      x: safeX,
      y: safeY,
      item,
      sourceRect,
    });
  }

  function togglePinBrand(id) {
    setPinnedBrandIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [id, ...current];
    });
  }

  function pinFromContextMenu() {
    if (!contextMenu.brandId) return;
    togglePinBrand(contextMenu.brandId);
    closeBrandContextMenu();
  }

  function openWebsiteFromContextMenu() {
    if (!contextBrandWebsite) return;
    window.open(contextBrandWebsite, '_blank', 'noopener,noreferrer');
    closeBrandContextMenu();
  }

  function addColorCardToCart() {
    if (!colorCardContextMenu.item) return;

    setColorCartDraft((current) => {
      if (current.some((entry) => entry.key === colorCardContextMenu.item.key)) {
        return current;
      }
      return [colorCardContextMenu.item, ...current];
    });

    setIsCartExpanded(true);
    triggerCartPulse();
    animateColorFlyToCart(colorCardContextMenu.item.value, colorCardContextMenu.sourceRect);
    closeColorCardContextMenu();
  }

  function saveDraftColorGroup() {
    if (!colorCartDraft.length) return;

    if (draftEditingGroup) {
      setSavedColorGroups((current) => [
        {
          id: draftEditingGroup.id,
          name: draftEditingGroup.name || '未命名分组',
          colors: colorCartDraft,
          createdAt: Date.now(),
        },
        ...current,
      ]);
      setDraftEditingGroup(null);
    } else {
      setSavedColorGroups((current) => [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          name: `第 ${nextColorGroupIndexRef.current} 组`,
          colors: colorCartDraft,
          createdAt: Date.now(),
        },
        ...current,
      ]);
      nextColorGroupIndexRef.current += 1;
    }

    setColorCartDraft([]);
    triggerCartPulse();
  }

  function showDotToast(message, clientX, clientY) {
    if (typeof window === 'undefined') return;
    if (dotToastTimerRef.current) {
      window.clearTimeout(dotToastTimerRef.current);
      dotToastTimerRef.current = null;
    }

    const x = Math.max(14, Math.min(clientX - 34, window.innerWidth - 110));
    const y = Math.max(14, clientY - 42);
    setDotToast({ message, x, y });

    dotToastTimerRef.current = window.setTimeout(() => {
      setDotToast(null);
      dotToastTimerRef.current = null;
    }, 1200);
  }

  async function copyPlainText(value, options = {}) {
    const { event, message = '已复制' } = options;
    try {
      await navigator.clipboard.writeText(value);
      if (event) {
        showDotToast(message, event.clientX, event.clientY);
      }
      return true;
    } catch {
      return false;
    }
  }

  async function handleColorDotCopy(event, value) {
    event.stopPropagation();
    await copyPlainText(value, { event, message: '已复制' });
  }

  async function copyColorGroup(group, event) {
    const content = group.colors.map((item) => item.value).join(', ');
    await copyPlainText(content, { event, message: '已复制整组' });
  }

  function removeDraftColor(colorKey) {
    setColorCartDraft((current) => current.filter((item) => item.key !== colorKey));
  }

  function removeColorFromSavedGroup(groupId, colorKey) {
    setSavedColorGroups((current) =>
      current.flatMap((group) => {
        if (group.id !== groupId) return [group];
        const nextColors = group.colors.filter((item) => item.key !== colorKey);
        if (!nextColors.length) return [];
        return [{ ...group, colors: nextColors }];
      }),
    );
  }

  function startEditingColorGroup(groupId) {
    const target = savedColorGroups.find((group) => group.id === groupId);
    if (!target) return;

    if (colorCartDraft.length) {
      const shouldReplaceDraft = window.confirm('当前上方草稿区有内容，是否替换为这组颜色进行编辑？');
      if (!shouldReplaceDraft) return;
    }

    setDraftEditingGroup({
      id: target.id,
      name: target.name,
      createdAt: target.createdAt || Date.now(),
      originalGroup: target,
    });
    setColorCartDraft(target.colors);
    setSavedColorGroups((current) => current.filter((group) => group.id !== groupId));
    setIsColorVaultOpen(false);
    setIsColorSpaceOpen(false);
    setIsCartExpanded(true);
    triggerCartPulse();
  }

  function cancelEditingColorGroup() {
    if (!draftEditingGroup) return;

    setSavedColorGroups((current) => [draftEditingGroup.originalGroup, ...current]);
    setColorCartDraft([]);
    setDraftEditingGroup(null);
  }

  function renameColorGroup(groupId) {
    const target = savedColorGroups.find((group) => group.id === groupId);
    if (!target) return;

    const nextName = window.prompt('重命名颜色组', target.name || '未命名分组');
    if (nextName === null) return;
    const normalized = nextName.trim();
    if (!normalized) return;

    setSavedColorGroups((current) =>
      current.map((group) => (group.id === groupId ? { ...group, name: normalized } : group)),
    );
  }

  function openColorSpacePage() {
    setIsColorVaultOpen(false);
    setIsColorSpaceOpen(true);
  }

  function openDesignWorkspace() {
    setIsColorSpaceOpen(false);
  }

  function openColorWorkspace() {
    setIsColorVaultOpen(false);
    setIsColorSpaceOpen(true);
  }

  useEffect(() => {
    if (!contextMenu.visible && !colorCardContextMenu.visible) return undefined;

    function handlePointerDown(event) {
      if (contextMenuRef.current?.contains(event.target)) return;
      if (colorCardContextMenuRef.current?.contains(event.target)) return;
      closeBrandContextMenu();
      closeColorCardContextMenu();
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      closeBrandContextMenu();
      closeColorCardContextMenu();
    }

    function handleViewportChange() {
      closeBrandContextMenu();
      closeColorCardContextMenu();
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [contextMenu.visible, colorCardContextMenu.visible]);

  useEffect(
    () => () => {
      if (dotToastTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(dotToastTimerRef.current);
      }
    },
    [],
  );

  async function handleCopy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => setCopiedValue(''), 1500);
    } catch {
      setCopiedValue('');
    }
  }

  function renderCartDot(item, options = {}) {
    const { compact = false, dotKey, onRemove } = options;
    const dotClassName = compact ? 'color-cart-dot compact' : 'color-cart-dot';
    const wrapClassName = compact ? 'color-cart-dot-wrap compact' : 'color-cart-dot-wrap';

    return (
      <div className={wrapClassName} key={dotKey}>
        <button
          className={dotClassName}
          onClick={(event) => handleColorDotCopy(event, item.value)}
          style={{ background: item.value }}
          title={`${item.brandName} · ${item.name} · ${item.value}`}
          type="button"
        />
        <button
          aria-label="删除这个颜色"
          className="color-cart-dot-remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          title="删除这个颜色"
          type="button"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav aria-label="全局内容标签" className="global-site-nav">
        <a className="global-site-tag" href="../../">
          总站首页
        </a>
        <a className="global-site-tag" href="../apple-spec/">
          苹果规范
        </a>
        <span className="global-site-tag is-active">设计体系总览</span>
        <span className="global-site-tag">平台规范库</span>
        <span className="global-site-tag">组件资产库</span>
        <span className="global-site-tag">待扩展主题</span>
      </nav>

      <nav aria-label="工作区" className="workspace-nav">
        <button className={!isColorSpaceOpen ? 'active' : ''} onClick={openDesignWorkspace} type="button">
          设计MD
        </button>
        <button className={isColorSpaceOpen ? 'active' : ''} onClick={openColorWorkspace} type="button">
          色彩
        </button>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">DESIGN MD / 第一版</div>
          <h1>设计文档对比</h1>
          <p>按主题整理多家品牌的 design MD 规范内容。</p>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-label">当前模式</div>
          <h2>{modeCopy[mode].title}</h2>
          <p>{modeCopy[mode].body}</p>
          <div className="hero-stats">
            <div>
              <strong>{brands.length}</strong>
              <span>品牌</span>
            </div>
            <div>
              <strong>10</strong>
              <span>主题</span>
            </div>
            <div>
              <strong>V1</strong>
              <span>比较优先</span>
            </div>
          </div>
        </div>
      </header>

      <section className="toolbar">
        <div className="mode-switch">
          {['compare', 'single'].map((item) => (
            <button
              key={item}
              className={mode === item ? 'active' : ''}
              onClick={() => setMode(item)}
              type="button"
            >
              {item === 'compare' ? '对比' : '单品牌'}
            </button>
          ))}
        </div>

        <div className="theme-tabs">
          {themeOrder.map((key) => (
            <button
              key={key}
              className={activeTheme === key ? 'active' : ''}
              onClick={() => setActiveTheme(key)}
              type="button"
            >
              <span>{themes[key].label}</span>
            </button>
          ))}
        </div>
        {mode === 'compare' && activeTheme === 'colors' ? (
          <ColorFilterBar
            colorCounts={globalColorCounts}
            colorFilter={colorFilter}
            colorSubCounts={globalSecondaryCounts}
            colorSubFilter={colorSubFilter}
            onColorFilterChange={setColorFilter}
            onColorSubFilterChange={setColorSubFilter}
            secondaryOptions={secondaryFilterOptions}
          />
        ) : null}
        {mode === 'single' ? (
          <div className="single-brand-picker">
            <label htmlFor="single-brand-select">当前品牌</label>
            <select
              id="single-brand-select"
              onChange={(event) => setSingleBrandId(event.target.value)}
              value={singleBrandId}
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </section>

      <main className="workspace">
        {mode === 'compare' ? (
          <>
            <aside
              className="brand-rail"
              onContextMenuCapture={(event) => {
                event.preventDefault();
              }}
            >
              <div className="rail-label">品牌</div>
              {orderedBrands.map((brand) => (
                <div
                  className={`brand-rail-item ${pinnedBrandIds.includes(brand.id) ? 'is-pinned' : ''}`}
                  key={brand.id}
                  onContextMenu={(event) => openBrandContextMenu(event, brand.id)}
                >
                  <div className="brand-rail-row">
                    <input
                      className="brand-checkbox"
                      checked={brandFilter.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      type="checkbox"
                    />
                    <button
                      className="brand-jump"
                      onClick={() => jumpToBrand(brand.id)}
                      type="button"
                    >
                      <span className="brand-jump-topline">
                        <span>{brand.name}</span>
                        {pinnedBrandIds.includes(brand.id) ? <em className="brand-pin-chip">置顶</em> : null}
                      </span>
                      <small>{brand.kicker}</small>
                    </button>
                  </div>
                </div>
              ))}
            </aside>

            <section className="content-column">
              {isGlobalColorView ? (
                <GlobalColorResults
                  colorFilter={colorFilter}
                  colorSubFilter={colorSubFilter}
                  secondaryOptions={secondaryFilterOptions}
                  copiedValue={copiedValue}
                  onCopy={handleCopy}
                  onOpenColorCardContextMenu={openColorCardContextMenu}
                  results={globalFilteredColors}
                  visibleBrandCount={visibleBrands.length}
                />
              ) : (
                visibleBrands.map((brand) => (
                  <BrandThemeArticle
                    activeTheme={activeTheme}
                    brand={brand}
                    copiedValue={copiedValue}
                    key={brand.id}
                    onCopy={handleCopy}
                    onOpenColorCardContextMenu={openColorCardContextMenu}
                  />
                ))
              )}
            </section>
          </>
        ) : (
          <section className="content-column">
            {singleBrand ? (
              <BrandThemeArticle
                activeTheme={activeTheme}
                brand={singleBrand}
                copiedValue={copiedValue}
                onCopy={handleCopy}
                onOpenColorCardContextMenu={openColorCardContextMenu}
              />
            ) : (
              <section className="single-mode-card">
                <div className="eyebrow">单品牌阅读</div>
                <h2>未找到可展示品牌</h2>
                <p>请在顶部选择一个品牌后继续查看。</p>
              </section>
            )}
          </section>
        )}
      </main>

      {contextMenu.visible ? (
        <div
          className="brand-context-menu"
          ref={contextMenuRef}
          role="menu"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button className="brand-context-action" onClick={pinFromContextMenu} type="button">
            {pinnedBrandIds.includes(contextMenu.brandId) ? '取消置顶' : '置顶到顶部'}
          </button>
          {contextBrandWebsite ? (
            <button className="brand-context-action" onClick={openWebsiteFromContextMenu} type="button">
              查看官网
            </button>
          ) : null}
        </div>
      ) : null}

      {colorCardContextMenu.visible ? (
        <div
          className="brand-context-menu color-card-context-menu"
          ref={colorCardContextMenuRef}
          role="menu"
          style={{ left: `${colorCardContextMenu.x}px`, top: `${colorCardContextMenu.y}px` }}
        >
          <button className="brand-context-action" onClick={addColorCardToCart} type="button">
            加入色卡篮
          </button>
        </div>
      ) : null}

      <div className="color-cart-shell">
        {isCartExpanded ? (
          <aside className="color-cart-panel">
            <div className="color-cart-panel-head">
              <button className="color-cart-vault-link" onClick={() => setIsColorVaultOpen(true)} type="button">
                打开色卡空间
              </button>
              <button className="color-cart-collapse" onClick={() => setIsCartExpanded(false)} type="button">
                收起
              </button>
            </div>

            <div className="color-cart-draft">
              {colorCartDraft.length ? (
                colorCartDraft.map((item) => (
                  renderCartDot(item, {
                    dotKey: item.key,
                    onRemove: () => removeDraftColor(item.key),
                  })
                ))
              ) : (
                <p>右键色卡并加入色卡篮</p>
              )}
            </div>

            {draftEditingGroup ? (
              <div className="color-cart-editing">
                <span>{`正在编辑：${draftEditingGroup.name || '未命名分组'}`}</span>
                <button onClick={cancelEditingColorGroup} type="button">
                  取消编辑
                </button>
              </div>
            ) : null}

            <button
              className="color-cart-save"
              disabled={!colorCartDraft.length}
              onClick={saveDraftColorGroup}
              type="button"
            >
              {draftEditingGroup ? '✓ 更新这一组颜色' : '✓ 存储这一组颜色'}
            </button>

            <div className="color-cart-saved">
              {savedColorGroups.map((group, index) => (
                <div className="color-cart-saved-group" key={group.id}>
                  <div className="color-cart-saved-head">
                    <strong>{group.name || `第 ${savedColorGroups.length - index} 组`}</strong>
                    <div className="color-cart-saved-actions">
                      <button onClick={() => startEditingColorGroup(group.id)} type="button">
                        编辑
                      </button>
                      <button onClick={() => renameColorGroup(group.id)} title="重命名" type="button">
                        ✎
                      </button>
                      <button onClick={(event) => copyColorGroup(group, event)} type="button">
                        复制
                      </button>
                    </div>
                  </div>
                  <div className="color-cart-saved-row" key={group.id}>
                    {group.colors.map((item) =>
                      renderCartDot(item, {
                        compact: true,
                        dotKey: `${group.id}-${item.key}`,
                        onRemove: () => removeColorFromSavedGroup(group.id, item.key),
                      }),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        <button
          className={`color-cart-fab ${cartIsActive ? 'is-active' : ''}`}
          onClick={() => setIsCartExpanded((current) => !current)}
          ref={cartButtonRef}
          type="button"
        >
          <span className="color-cart-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 4h2.2l1.2 9.1c.1.7.7 1.2 1.4 1.2h8.5c.7 0 1.3-.5 1.4-1.2l1-6.5H7.2" />
              <circle cx="10" cy="19.2" r="1.5" />
              <circle cx="16.8" cy="19.2" r="1.5" />
            </svg>
          </span>
          <span>色卡篮</span>
          <em>{colorCartCount}</em>
        </button>
      </div>

      {isColorVaultOpen ? (
        <div className="color-vault-overlay" onClick={() => setIsColorVaultOpen(false)} role="presentation">
          <section className="color-vault-panel" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>色卡空间</h3>
              <div className="color-vault-head-actions">
                <button onClick={openColorSpacePage} type="button">
                  前往色彩空间
                </button>
                <button onClick={() => setIsColorVaultOpen(false)} type="button">
                  关闭
                </button>
              </div>
            </header>
            <div className="color-vault-body">
              {savedColorGroups.length ? (
                savedColorGroups.map((group, index) => (
                  <div className="color-vault-group" key={group.id}>
                    <div className="color-cart-saved-head">
                      <strong>{group.name || `第 ${savedColorGroups.length - index} 组`}</strong>
                      <div className="color-cart-saved-actions">
                        <button onClick={() => startEditingColorGroup(group.id)} type="button">
                          编辑
                        </button>
                        <button onClick={() => renameColorGroup(group.id)} title="重命名" type="button">
                          ✎
                        </button>
                        <button onClick={(event) => copyColorGroup(group, event)} type="button">
                          复制
                        </button>
                      </div>
                    </div>
                    <div className="color-vault-row">
                      {group.colors.map((item) =>
                        renderCartDot(item, {
                          compact: true,
                          dotKey: `${group.id}-vault-${item.key}`,
                          onRemove: () => removeColorFromSavedGroup(group.id, item.key),
                        }),
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="color-vault-empty">尚未存储任何颜色组。</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {isColorSpaceOpen ? (
        <div className="color-space-page" onClick={() => setIsColorSpaceOpen(false)} role="presentation">
          <section className="color-space-page-panel" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>色彩空间</h2>
              <button onClick={openDesignWorkspace} type="button">
                返回设计MD
              </button>
            </header>
            <div className="color-space-page-body">
              {savedColorGroups.length ? (
                savedColorGroups.map((group, index) => (
                  <article className="color-space-page-group" key={`page-${group.id}`}>
                    <div className="color-cart-saved-head">
                      <strong>{group.name || `第 ${savedColorGroups.length - index} 组`}</strong>
                      <div className="color-cart-saved-actions">
                        <button onClick={() => startEditingColorGroup(group.id)} type="button">
                          编辑
                        </button>
                        <button onClick={() => renameColorGroup(group.id)} title="重命名" type="button">
                          ✎
                        </button>
                        <button onClick={(event) => copyColorGroup(group, event)} type="button">
                          复制
                        </button>
                      </div>
                    </div>
                    <div className="color-vault-row">
                      {group.colors.map((item) =>
                        renderCartDot(item, {
                          dotKey: `page-${group.id}-${item.key}`,
                          onRemove: () => removeColorFromSavedGroup(group.id, item.key),
                        }),
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className="color-vault-empty">尚未存储任何颜色组。</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {dotToast ? (
        <div className="color-dot-toast" style={{ left: `${dotToast.x}px`, top: `${dotToast.y}px` }}>
          {dotToast.message}
        </div>
      ) : null}
    </div>
  );
}

function ColorCard({ item, brand, copiedValue, onCopy, onOpenColorCardContextMenu, showGroup = false }) {
  const cartItem = {
    key: buildColorCartKey({
      brandId: brand.id,
      brandName: brand.name,
      group: item.group,
      name: item.name,
      value: item.value,
    }),
    brandId: brand.id,
    brandName: brand.name,
    group: item.group,
    name: item.name,
    value: item.value,
    usage: item.usage,
    textColor: item.textColor || '#111111',
  };

  return (
    <button
      className="color-card"
      onClick={() => onCopy(item.value)}
      onContextMenu={(event) => onOpenColorCardContextMenu(event, cartItem)}
      type="button"
    >
      <div className="color-preview" style={{ background: item.value, color: item.textColor || '#111111' }}>
        <span className="color-brand-chip">{brand.name}</span>
        <span className="color-name">{item.name}</span>
        {copiedValue === item.value ? <em className="color-toast">已复制</em> : null}
      </div>
      <div className="color-meta">
        <code>{item.value}</code>
        <small>{item.usage}</small>
        {showGroup ? <em>{item.group}</em> : null}
      </div>
    </button>
  );
}

function ColorsSection({ brand, copiedValue, onCopy, onOpenColorCardContextMenu }) {
  return (
    <div className="stack">
      {brand.colors.map((group) => (
        <section className="color-group" key={group.group}>
          <div className="group-title">{group.group}</div>
          <div className="color-grid">
            {group.items.map((item) => (
              <ColorCard
                brand={brand}
                copiedValue={copiedValue}
                item={{ ...item, group: group.group }}
                key={`${group.group}-${item.name}-${item.value}`}
                onCopy={onCopy}
                onOpenColorCardContextMenu={onOpenColorCardContextMenu}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ColorFilterBar({
  colorFilter,
  colorSubCounts,
  colorSubFilter,
  onColorFilterChange,
  onColorSubFilterChange,
  colorCounts,
  secondaryOptions,
}) {
  return (
    <div className="global-color-filter">
      <div className="color-filter-row" role="tablist" aria-label="全局按颜色筛选">
        {COLOR_FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`color-filter-tag ${colorFilter === option.id ? 'active' : ''}`}
            onClick={() => onColorFilterChange(option.id)}
            type="button"
          >
            <span>{option.label}</span>
            <small>{colorCounts[option.id]}</small>
          </button>
        ))}
      </div>
      {secondaryOptions.length ? (
        <div className="color-filter-row color-filter-row-secondary" role="tablist" aria-label="二级颜色细分筛选">
          <button
            className={`color-filter-tag color-filter-tag-sub ${colorSubFilter === 'all' ? 'active' : ''}`}
            onClick={() => onColorSubFilterChange('all')}
            type="button"
          >
            <span>全部细分</span>
          </button>
          {secondaryOptions.map((option) => (
            <button
              key={option.id}
              className={`color-filter-tag color-filter-tag-sub ${colorSubFilter === option.id ? 'active' : ''}`}
              onClick={() => onColorSubFilterChange(option.id)}
              type="button"
            >
              <span>{option.label}</span>
              <small>{colorSubCounts[option.id] || 0}</small>
            </button>
          ))}
        </div>
      ) : null}
      <div className="global-filter-note">
        {colorFilter === 'all' ? '全部：按品牌查看' : '颜色标签：切换到全局聚合网格；可用二级细分精确收敛'}
      </div>
    </div>
  );
}

function GlobalColorResults({
  colorFilter,
  colorSubFilter,
  secondaryOptions,
  copiedValue,
  onCopy,
  onOpenColorCardContextMenu,
  results,
  visibleBrandCount,
}) {
  const filterLabel = COLOR_FILTER_OPTIONS.find((option) => option.id === colorFilter)?.label || '颜色';
  const subFilterLabel = secondaryOptions.find((option) => option.id === colorSubFilter)?.label || '';

  return (
    <article className="brand-section global-color-sheet">
      <div className="brand-section-header global-color-sheet-header">
        <h3>{`全局${filterLabel}聚合${subFilterLabel ? ` · ${subFilterLabel}` : ''}`}</h3>
        <p>{`${results.length} 个色卡 · ${visibleBrandCount} 个品牌`}</p>
      </div>

      {results.length ? (
        <div className="color-grid global-color-grid">
          {results.map((item) => (
            <ColorCard
              brand={{ id: item.brandId, name: item.brandName }}
              copiedValue={copiedValue}
              item={item}
              key={item.key}
              onCopy={onCopy}
              onOpenColorCardContextMenu={onOpenColorCardContextMenu}
              showGroup
            />
          ))}
        </div>
      ) : (
        <div className="color-empty-state">当前筛选下暂无颜色结果。</div>
      )}
    </article>
  );
}

function BrandThemeArticle({ brand, activeTheme, copiedValue, onCopy, onOpenColorCardContextMenu }) {
  const brandWebsite = getBrandWebsite(brand);

  return (
    <article className="brand-section" id={`${brand.id}-${activeTheme}`}>
      <div className="brand-section-header">
        <BrandTitleWithPreview brand={brand} website={brandWebsite} />
      </div>

      {activeTheme === 'colors' && (
        <ColorsSection
          brand={brand}
          copiedValue={copiedValue}
          onCopy={onCopy}
          onOpenColorCardContextMenu={onOpenColorCardContextMenu}
        />
      )}
      {activeTheme === 'typography' && <TypographySection brand={brand} />}
      {activeTheme === 'buttons' && <ComponentsSection brand={brand} activeTheme="buttons" />}
      {activeTheme === 'cards' && <ComponentsSection brand={brand} activeTheme="cards" />}
      {activeTheme === 'grid' && <GridSection brand={brand} />}
      {activeTheme === 'spacing' && <SpacingSection brand={brand} />}
      {activeTheme === 'radius' && <RadiusSection brand={brand} />}
      {activeTheme === 'elevation' && <ElevationSection brand={brand} />}
      {activeTheme === 'forms' && <FormsSection brand={brand} />}
      {activeTheme === 'guidance' && <GuidanceSection brand={brand} />}
    </article>
  );
}

function buildTypographyPreview(style = {}) {
  const next = { ...style };
  const rawSize = Number(style?.fontSize || 16);
  let previewSize = rawSize;

  if (rawSize > 56 && rawSize <= 120) {
    previewSize = 56 + (rawSize - 56) * 0.35;
  } else if (rawSize > 120) {
    previewSize = 78 + Math.log2(rawSize / 120) * 8;
  }

  previewSize = Math.max(12, Math.min(88, previewSize));
  next.fontSize = `${Math.round(previewSize)}px`;
  next.overflowWrap = 'anywhere';
  next.wordBreak = 'break-word';

  return { style: next, scaled: rawSize > previewSize + 1 };
}

function TypographySection({ brand }) {
  return (
    <div className="type-system">
      {brand.typography.map((item) => {
        const preview = buildTypographyPreview(item.style);

        return (
          <div className="type-card" key={item.label}>
            <div className="type-label-row">
              <div className="type-label">{item.label}</div>
              {preview.scaled ? <em className="type-scale-badge">预览缩放</em> : null}
            </div>
            <div className="type-sample" style={preview.style}>
              {item.sample}
            </div>
            <div className="type-meta">{item.meta}</div>
          </div>
        );
      })}
    </div>
  );
}

function ComponentsSection({ brand, activeTheme }) {
  const filteredComponents = brand.components.filter((component) => {
    if (activeTheme === 'buttons') {
      return component.variant.includes('buttons');
    }

    if (activeTheme === 'cards') {
      return component.variant.includes('card') || component.variant.includes('hero');
    }

    return true;
  });

  return (
    <div className="component-stack">
      {filteredComponents.map((component) => (
        <div className={`component-card ${activeTheme === 'buttons' ? 'component-card-plain' : ''}`} key={component.title}>
          {activeTheme !== 'buttons' ? (
            <div className="component-header">
              <h4>{component.title}</h4>
              <p>{component.note}</p>
            </div>
          ) : null}
          <ComponentPreview brand={brand} variant={component.variant} />
        </div>
      ))}
    </div>
  );
}

const GENERATED_FEATURE_LABELS = {
  fullBleed: '全屏 section',
  centeredContainer: '居中内容区',
  heroSingle: 'hero 单列',
  alternatingSections: '区块交错',
  cardGrid: '卡片网格',
  sidebarRail: '侧栏轨道',
  marqueeStrip: '横向滚动',
  dashboardShell: '面板壳层',
  responsiveStack: '断点堆叠',
};

function getGeneratedLayoutSourceText(brand) {
  const rowsText = (brand.layoutSpec?.rows || []).map((row) => row.value).join(' ');
  const evidenceText = (brand.layoutSpec?.generatedBlueprint?.evidence || []).join(' ');
  const summaryText = brand.layoutSpec?.summary || '';
  return [rowsText, evidenceText, summaryText].join(' ');
}

function inferGeneratedContainerWidthHint(text) {
  const normalized = `${text || ''}`;
  const directMatch = normalized.match(
    /(?:max(?:imum)?\s+content\s+width|content\s+width|container|居中内容区|主体容器)[^0-9]{0,24}(\d{3,4})\s*px/i,
  );
  if (directMatch) {
    const value = Number(directMatch[1]);
    if (value >= 720 && value <= 1600) return value;
  }

  const allPixelValues = [...normalized.matchAll(/(\d{3,4})\s*px/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 720 && value <= 1600);

  if (!allPixelValues.length) return null;
  return allPixelValues.sort((a, b) => a - b)[0];
}

function inferGeneratedGridColumns(text, features = {}) {
  const normalized = `${text || ''}`.toLowerCase();
  const nearColumnNumbers = [];
  for (const match of normalized.matchAll(/([2-6])(?:\s*(?:-|–|~|to)+\s*([2-6]))?\s*(?:column|columns|col|cols|列)/g)) {
    nearColumnNumbers.push(Number(match[1]));
    if (match[2]) nearColumnNumbers.push(Number(match[2]));
  }

  if (nearColumnNumbers.length) {
    return Math.max(2, Math.min(4, Math.max(...nearColumnNumbers)));
  }

  if (features.cardGrid) return 3;
  return 2;
}

function shouldRenderGeneratedLayoutBlueprint(blueprint) {
  if (!blueprint || !blueprint.features) return false;
  const activeFeatures = Object.values(blueprint.features).filter(Boolean).length;
  const confidence = blueprint.confidence || 'low';
  const score = Number(blueprint.score || 0);

  if (confidence === 'high') {
    return score >= 5 && activeFeatures >= 3;
  }

  return false;
}

function buildGeneratedFeatureChips({ features, widthHint, columns }) {
  const chips = [];
  const orderedKeys = [
    'fullBleed',
    'centeredContainer',
    'heroSingle',
    'alternatingSections',
    'cardGrid',
    'sidebarRail',
    'marqueeStrip',
    'dashboardShell',
    'responsiveStack',
  ];

  for (const key of orderedKeys) {
    if (!features?.[key]) continue;
    if (key === 'centeredContainer' && widthHint) {
      chips.push(`${widthHint}px 居中内容区`);
      continue;
    }
    if (key === 'cardGrid') {
      chips.push(`卡片区 ${columns} 列`);
      continue;
    }
    chips.push(GENERATED_FEATURE_LABELS[key] || key);
  }

  return chips.slice(0, 7);
}

function GeneratedLayoutBlueprint({ brand }) {
  const blueprint = brand.layoutSpec?.generatedBlueprint;
  const features = blueprint?.features || {};
  const sourceText = getGeneratedLayoutSourceText(brand);
  const widthHint = inferGeneratedContainerWidthHint(sourceText);
  const columns = inferGeneratedGridColumns(sourceText, features);
  const shouldRenderBlueprint = shouldRenderGeneratedLayoutBlueprint(blueprint);
  const chips = buildGeneratedFeatureChips({ features, widthHint, columns });

  if (!shouldRenderBlueprint) {
    return (
      <>
        <div className="bp-generated-note">文档结构证据不足，保持保守展示</div>
        <div className="bp-generated-rules">
          {brand.layoutSpec.rows.map((row) => (
            <div className="bp-generated-rule" key={`${brand.id}-${row.label}`}>
              <strong>{row.label}</strong>
              <p>{row.value}</p>
            </div>
          ))}
        </div>
        <div className="bp-generated-notes">
          {(brand.layoutSpec.notes || []).map((note) => (
            <span key={`${brand.id}-${note}`}>{note}</span>
          ))}
        </div>
      </>
    );
  }

  const gridItems = Array.from({ length: columns * 2 }).map((_, index) => (
    <div key={`${brand.id}-grid-${index}`} className="bp-gen-tile" />
  ));
  const heroWidth = widthHint ? `${Math.min(100, Math.round((widthHint / 1440) * 100))}%` : '82%';
  const containerInlineStyle = widthHint
    ? {
        maxWidth: `${widthHint}px`,
      }
    : undefined;

  return (
    <>
      <div className="bp-generated-chip-row">
        {chips.map((chip) => (
          <span key={`${brand.id}-${chip}`} className="bp-generated-chip">
            {chip}
          </span>
        ))}
      </div>

      <div className="bp-generated-canvas">
        <section className={`bp-gen-section ${features.fullBleed ? 'is-fullbleed' : ''}`}>
          <div className="bp-gen-nav">Layout shell</div>
          <div
            className={`bp-gen-container ${features.centeredContainer ? 'is-centered' : ''}`}
            style={containerInlineStyle}
          >
            {features.heroSingle ? (
              <div className="bp-gen-hero-single" style={{ width: heroWidth }}>
                <span />
                <span />
                <span />
              </div>
            ) : (
              <div className="bp-gen-hero-split">
                <span />
                <span />
              </div>
            )}

            {features.cardGrid ? (
              <div className={`bp-gen-card-grid cols-${columns}`}>{gridItems}</div>
            ) : (
              <div className="bp-gen-panel-grid">
                <div />
                <div />
                <div />
              </div>
            )}
          </div>
        </section>

        {features.alternatingSections && (
          <section className="bp-gen-alternating">
            <div className="bp-gen-alt-row light">
              <div />
              <div />
            </div>
            <div className="bp-gen-alt-row dark">
              <div />
              <div />
            </div>
          </section>
        )}

        {features.sidebarRail && (
          <section className="bp-gen-sidebar-shell">
            <aside />
            <div className="bp-gen-sidebar-content">
              <div />
              <div />
              <div />
            </div>
          </section>
        )}

        {features.marqueeStrip && (
          <section className="bp-gen-marquee">
            <span />
            <span />
            <span />
            <span />
            <span />
          </section>
        )}

        {features.dashboardShell && (
          <section className="bp-gen-dashboard">
            <div className="bp-gen-kpis">
              <div />
              <div />
              <div />
            </div>
            <div className="bp-gen-main-panels">
              <div />
              <div />
            </div>
          </section>
        )}

        {features.responsiveStack && (
          <section className="bp-gen-breakpoints">
            <span>Mobile</span>
            <span>Tablet</span>
            <span>Desktop</span>
          </section>
        )}
      </div>
    </>
  );
}

function GridSection({ brand }) {
  const isGenerated = brand.layoutSpec.model === 'generated';

  return (
    <div className="card-spec-wrap grid-spec-wrap">
      <div className="card-spec-meta">
        <p>{brand.layoutSpec.summary}</p>
        <div className="card-spec-notes">
          {brand.layoutSpec.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      </div>

      <div className="layout-grid single">
        <div className="layout-card">
          <span>结构规则</span>
          {brand.layoutSpec.rows.map((row) => (
            <p key={row.label}>
              <strong>{row.label}</strong>
              {` ${row.value}`}
            </p>
          ))}
        </div>

        <div className={`layout-blueprint ${brand.layoutSpec.model}`}>
          {!isGenerated && brand.layoutSpec.model === 'airbnb' && (
            <>
              <div className="bp-header">Sticky header / centered search</div>
              <div className="bp-pill-row">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="bp-grid bp-grid-airbnb">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} />
                ))}
              </div>
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'apple' && (
            <>
              <div className="bp-nav dark">Glass nav</div>
              <div className="bp-scene dark">
                <div className="bp-centered-block">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="bp-scene light">
                <div className="bp-apple-grid">
                  <div />
                  <div />
                  <div />
                </div>
              </div>
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'figma' && (
            <>
              <div className="bp-hero-gradient">
                <div className="bp-centered-block light">
                  <span />
                  <span />
                </div>
              </div>
              <div className="bp-figma-gallery">
                <div className="bp-figma-column dark" />
                <div className="bp-figma-column light" />
              </div>
              <div className="bp-footer-dark" />
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'cursor' && (
            <>
              <div className="bp-cursor-nav">Warm navigation</div>
              <div className="bp-cursor-hero">
                <div className="bp-centered-block cursor">
                  <span />
                  <span />
                </div>
              </div>
              <div className="bp-cursor-grid">
                <div />
                <div />
                <div />
              </div>
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'elevenlabs' && (
            <>
              <div className="bp-elevenlabs-nav">Light nav / pill CTA</div>
              <div className="bp-elevenlabs-hero">
                <div className="bp-centered-block elevenlabs">
                  <span />
                  <span />
                </div>
              </div>
              <div className="bp-elevenlabs-grid">
                <div />
                <div />
                <div />
              </div>
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'linear' && (
            <>
              <div className="bp-linear-nav">Dark nav / command</div>
              <div className="bp-linear-hero">
                <div className="bp-centered-block linear">
                  <span />
                  <span />
                </div>
              </div>
              <div className="bp-linear-grid">
                <div />
                <div />
                <div />
              </div>
            </>
          )}

          {!isGenerated && brand.layoutSpec.model === 'nike' && (
            <>
              <div className="bp-nike-nav">Retail nav / categories</div>
              <div className="bp-nike-hero" />
              <div className="bp-nike-grid">
                <div />
                <div />
                <div />
              </div>
            </>
          )}

          {isGenerated && (
            <GeneratedLayoutBlueprint brand={brand} />
          )}
        </div>
      </div>
    </div>
  );
}

function SpacingSection({ brand }) {
  return (
    <div className="specimen-stack spacing-showcase simple">
      <div className="spacing-row spacing-scale-row">
        {brand.spacingScale.map((value) => (
          <div className="spacing-item" key={value}>
            <div className="spacing-bar" style={{ width: `${Math.max(value * 2, 4)}px` }} />
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadiusSection({ brand }) {
  const radiusLabelMap = {
    Micro: '微型',
    'Buttons, Cards': '按钮、卡片',
    Search: '搜索',
    Features: '功能模块',
    Pills: '胶囊',
    Media: '媒体控件',
    Links: '链接',
    Containers: '容器',
    Cards: '卡片',
    Circles: '圆形控件',
    '细小链接': '细小链接',
    '按钮': '按钮',
    '徽标': '徽标',
    '卡片': '卡片',
    '大容器': '大容器',
    '圆形控件': '圆形控件',
    '细节': '细节',
    '内联元素': '内联元素',
    '标准卡片': '标准卡片',
    '主按钮与卡片': '主按钮与卡片',
    '强调容器': '强调容器',
    '胶囊': '胶囊',
  };

  const summaries = {
    airbnb:
      'Airbnb 的圆角是“越重要、越可触、越柔和”。按钮从 8px 开始，卡片到 20px，大容器到 32px，圆形控件直接 50%。这套体系传递的是温暖和可逛感。',
    apple:
      'Apple 的圆角非常克制。普通矩形大多停在 5–12px，只有 CTA 胶囊才会跳到 980px，圆形媒体控件则用 50%。它的重点是精准，不是柔软。',
    figma:
      'Figma 的圆角本质上是几何语言：2px 链接、6px 容器、8px 卡片、50px pill、50% circle。不是层层变大，而是不同控件家族各自固定在少数几个几何节点上。',
    cursor:
      'Cursor 的圆角偏温暖但不夸张。它不会像消费产品那样极度柔软，而是用 8px 卡片、10px 强调容器和 full pill 标签来维持一种编辑器里的纸面触感。',
    elevenlabs:
      'ElevenLabs 的圆角服务于“柔软浮起”的感觉。16px 到 24px 是主区间，按钮直接拉到 9999px，整个系统显得很圆润，但并不厚重。',
    linear:
      'Linear 的圆角是纯功能性的：2px、4px、6px、8px、12px 这些精确节点足够覆盖全部控件。它靠精密和统一取胜，而不是靠圆润来制造情绪。',
    nike:
      'Nike 的圆角带有明确分工。商品图保持 0px 硬边，输入和容器各自停在 8px、20px、24px，而购买按钮再统一拉成 30px pill。',
  };

  return (
    <div className="card-spec-wrap radius-spec-wrap">
      <div className="card-spec-meta">
        <p>{summaries[brand.id]}</p>
      </div>

      <div className="specimen-stack radius-showcase">
        <div className="radius-usage-grid">
          {brand.radiusScale.map((item) => (
            <div className="radius-usage-card" key={`${item.value}-usage`}>
              <div
                className={`radius-usage-demo ${item.shape}`}
                style={{
                  borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'pill' ? '999px' : item.value,
                }}
              />
              <div className="radius-usage-copy">
                <strong>{item.value}</strong>
                <p>{radiusLabelMap[item.label] || item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElevationSection({ brand }) {
  return (
    <div className="elevation-grid simple">
      {brand.elevationScale.map((item) => (
        <div className={`elevation-simple-card ${item.tone}`} key={item.title} style={item.style}>
          <strong>{item.title}</strong>
          <p>{item.meta}</p>
        </div>
      ))}
    </div>
  );
}

function FormsSection({ brand }) {
  const formSet = brand.forms.fields || [];

  return (
    <div className="card-spec-wrap form-spec-wrap">
      <div className="card-spec-meta">
        <p>{brand.forms.summary}</p>
        <div className="card-spec-notes">
          {brand.forms.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      </div>

      {formSet.length ? (
        <div className="form-demo">
          {formSet.map((field) => (
            <article className="form-card" key={field.label}>
              <div className="form-card-header">
                <strong>{field.label}</strong>
                <span>{field.note}</span>
              </div>

              {field.type === 'textarea' ? (
                <div className="form-stage">
                  <textarea defaultValue={field.placeholder} rows={4} style={field.fieldStyle} />
                </div>
              ) : field.type === 'search' ? (
                <div className="form-stage">
                  <div className="search-demo" style={field.containerStyle}>
                    <input defaultValue={field.placeholder} style={field.inputStyle} />
                    <button style={field.buttonStyle} type="button">
                      ⌕
                    </button>
                  </div>
                </div>
              ) : field.type === 'chips' ? (
                <div className="form-stage">
                  <div className="chip-row airbnb-form-chips">
                    {field.chips.map((chip, index) => (
                      <button className={`airbnb-chip ${index === 0 ? 'active' : ''}`} key={chip} type="button">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : field.type === 'filter-row' ? (
                <div className="form-stage">
                  <div className="chip-row apple-form-chips">
                    {field.chips.map((chip, index) => (
                      <button className={`apple-filter-chip ${index === 0 ? 'is-focus' : ''}`} key={chip} type="button">
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="form-stage">
                  <input defaultValue={field.placeholder} style={field.fieldStyle} />
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="generated-empty-state">
          <strong>文档缺少可复原的表单规范</strong>
          <p>本品牌未展示表单样例，避免使用推断样式造成误导。</p>
        </div>
      )}
    </div>
  );
}

function GuidanceSection({ brand }) {
  const doItems = brand.guidance?.do || [];
  const dontItems = brand.guidance?.dont || [];

  return (
    <div className="guidance-grid">
      <div className="guidance-card do">
        <span>要做</span>
        {doItems.length ? (
          doItems.map((item) => <p key={item}>{item}</p>)
        ) : (
          <div className="generated-empty-state">
            <strong>文档未提供明确 Do 清单</strong>
            <p>当前仅保留其它章节已给出的规则，不补写主观建议。</p>
          </div>
        )}
      </div>
      <div className="guidance-card dont">
        <span>不要做</span>
        {dontItems.length ? (
          dontItems.map((item) => <p key={item}>{item}</p>)
        ) : (
          <div className="generated-empty-state">
            <strong>文档未提供明确 Don't 清单</strong>
            <p>避免根据推测生成禁忌项，防止误导执行。</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ComponentPreview({ brand, variant }) {
  const brandId = brand.id;

  if (variant === 'airbnb-buttons') {
    return (
      <ButtonSpecSection
        summary="Airbnb 的按钮是“温暖可触”的一组：主动作只让品牌红承担，普通动作退回黑白体系，圆形控件负责浏览与导航。"
        notes={['主 CTA 用 #ff385c', '标准按钮 8px', '大按钮/卡片可到 20px', '圆形导航 50%']}
      >
        <div className="button-showcase airbnb-button-showcase">
          <article className="button-family">
            <div className="button-family-header">
              <strong>主动作</strong>
              <span>预订 / 搜索 / 核心转化</span>
            </div>
            <div className="button-stage">
              <button className="airbnb-cta">继续搜索</button>
              <button className="airbnb-cta pressed">已按下</button>
            </div>
            <ul className="button-spec-list">
              <li>颜色：Rausch Red `#ff385c`，按下态 `#e00b41`</li>
              <li>文字：白色，重量偏中等，不追求夸张强调</li>
              <li>交互：hover 用轻抬升，focus 用 ring，而不是强描边</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>次级动作</strong>
              <span>文字链接、描边与筛选胶囊</span>
            </div>
            <div className="button-stage">
              <button className="airbnb-outline">成为房东</button>
              <button className="airbnb-chip active">湖景</button>
              <button className="airbnb-chip">设计感</button>
            </div>
            <ul className="button-spec-list">
              <li>颜色退回黑白灰，让主红只留给关键动作</li>
              <li>筛选 pills 用横向滚动的一排胶囊，而不是实心大按钮</li>
              <li>标签圆角更柔和，贴近“浏览”而非“命令”</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>圆形控件</strong>
              <span>轮播、搜索、快速导航</span>
            </div>
            <div className="button-stage">
              <button className="circle airbnb-circle">←</button>
              <button className="circle airbnb-search">⌕</button>
              <button className="circle airbnb-circle raised">→</button>
            </div>
            <ul className="button-spec-list">
              <li>背景多为 `#f2f2f2`，搜索主动作可切到品牌红</li>
              <li>圆角固定 50%，一眼就和普通按钮区分开</li>
              <li>hover / active 主要靠阴影与 ring，而不是改结构</li>
            </ul>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'airbnb-card') {
    return (
      <div className="airbnb-demo-card">
        <div className="image-block">Photo placeholder 图片占位</div>
        <div className="demo-copy">
          <strong>Istanbul, Turkey 伊斯坦布尔，土耳其</strong>
          <span>Entire apartment. 2 guests, 1 bed. $78 night.</span>
        </div>
      </div>
    );
  }

  if (variant === 'airbnb-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="图片优先、白底、20px 圆角、三层暖调阴影。"
        notes={['背景 #ffffff', '圆角 20px', '三层阴影', '图片在上，信息在下']}
      >
        <div className="airbnb-card-grid">
          {[
            ['Istanbul, Turkey', 'Entire apartment. 2 guests, 1 bed. $78 night.'],
            ['Barcelona, Spain', 'Private room. 3 guests, 2 beds. $92 night.'],
            ['Galveston, TX', 'Entire house. 6 guests, 3 beds. $145 night.'],
          ].map(([title, meta]) => (
            <div className="airbnb-demo-card compact" key={title}>
              <div className="image-block">Photo placeholder</div>
              <div className="demo-copy">
                <strong>{title}</strong>
                <span>{meta}</span>
              </div>
            </div>
          ))}
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'apple-buttons') {
    return (
      <ButtonSpecSection
        summary="Apple 的按钮系统非常克制，真正高饱和的只有蓝色 CTA。更多动作其实是胶囊链接、筛选按钮和媒体控件。"
        notes={['蓝色主 CTA', '8px 标准按钮', '980px 胶囊链接', '11px 搜索 / 筛选']}
      >
        <div className="button-showcase apple-button-showcase">
          <article className="button-family">
            <div className="button-family-header">
              <strong>主 CTA</strong>
              <span>Buy / Shop</span>
            </div>
            <div className="button-stage">
              <button className="apple-solid">Buy</button>
              <button className="apple-dark-solid">Shop iPhone</button>
            </div>
            <ul className="button-spec-list">
              <li>主色是 `#0071e3`，深色按钮则退回 `#1d1d1f`</li>
              <li>标准圆角 8px，不做夸张胶囊感</li>
              <li>hover 轻微提亮，focus 用 2px 蓝色可访问性描边</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>胶囊链接</strong>
              <span>Learn more / Shop</span>
            </div>
            <div className="button-stage dark">
              <button className="apple-pill-link">Learn more</button>
              <button className="apple-pill-link dark">Learn more</button>
            </div>
            <ul className="button-spec-list">
              <li>核心不是实心按钮，而是有边框的 980px 胶囊链接</li>
              <li>浅底用 `#0066cc`，深底用 `#2997ff`</li>
              <li>hover 更像文字链接，下划线比阴影更重要</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>筛选与媒体控件</strong>
              <span>Filter / Play / Carousel</span>
            </div>
            <div className="button-stage">
              <button className="apple-filter-chip">Compare</button>
              <button className="circle apple-media">▶</button>
              <button className="circle apple-media active">❚❚</button>
            </div>
            <ul className="button-spec-list">
              <li>筛选按钮是 `#fafafc` 背景、11px 圆角、极轻边框</li>
              <li>媒体控件用半透明灰，而不是品牌蓝</li>
              <li>Apple 的控制感来自节制，不来自多种按钮造型</li>
            </ul>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'apple-card') {
    return (
      <div className="apple-demo-card">
        <div className="apple-device" />
        <div className="demo-copy centered">
          <strong>iPhone</strong>
          <span>Product as hero, scene as backdrop.</span>
        </div>
      </div>
    );
  }

  if (variant === 'apple-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="存在深底与浅底两套产品卡语境，边框极少，8px 左右圆角，信息层级克制。"
        notes={['dark / light 两组', '圆角 5px-8px', '无明显边框', '蓝色 Learn more 链接']}
      >
        <div className="apple-card-showcase">
          <section className="apple-card-surface dark">
            <div className="apple-surface-title">Dark product cards</div>
            <div className="apple-card-grid">
              {[
                ['iPhone', 'Designed to be extraordinary. Featuring the most advanced chip and all-day battery life.'],
                ['MacBook Neo', 'Supercharged for pros. The most powerful MacBook ever with the M-series chip.'],
                ['iPad Air', 'Powerful and colorful. Liquid Retina display and Apple Pencil support.'],
              ].map(([title, body]) => (
                <div className="apple-info-card dark" key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                  <a href="/">Learn more &gt;</a>
                </div>
              ))}
            </div>
          </section>

          <section className="apple-card-surface light">
            <div className="apple-surface-title">Light product cards</div>
            <div className="apple-card-grid">
              {[
                ['AirPods Max', 'High-fidelity audio with active noise cancellation and immersive listening.'],
                ['Apple Watch', 'The ultimate device for a healthy life with advanced sensors and seamless connectivity.'],
                ['Apple TV+', "Original shows and movies from the world's greatest storytellers."],
              ].map(([title, body]) => (
                <div className="apple-info-card light" key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                  <a href="/">Learn more &gt;</a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'figma-buttons') {
    return (
      <ButtonSpecSection
        summary="Figma 的按钮系统核心不是颜色，而是几何与焦点态：50px 胶囊、50% 圆形、虚线 focus，让整个网站都像编辑器工具栏的延伸。"
        notes={['50px 胶囊', '50% 图标圆按钮', '黑白二元', 'dashed 2px focus']}
      >
        <div className="button-showcase figma-button-showcase">
          <article className="button-family">
            <div className="button-family-header">
              <strong>主 CTA</strong>
              <span>黑白二元，颜色最少</span>
            </div>
            <div className="button-stage">
              <button className="figma-black-pill">Get started</button>
              <button className="figma-white-pill">Contact sales</button>
            </div>
            <ul className="button-spec-list">
              <li>主按钮可以是纯黑实心，也可以是白底黑字</li>
              <li>核心不是品牌色，而是黑白对比和统一几何</li>
              <li>所有 CTA 都维持 50px 胶囊感</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>标签 / Tab</strong>
              <span>像产品内部工具条一样组织内容</span>
            </div>
            <div className="button-stage">
              <button className="figma-black-pill tab">Design</button>
              <button className="figma-tab">Dev Mode</button>
              <button className="figma-tab">FigJam</button>
            </div>
            <ul className="button-spec-list">
              <li>tab 和 CTA 共享 pill 几何，不另起一套体系</li>
              <li>激活态黑底白字，未激活态透明或白底黑字</li>
              <li>这是工具系统感的关键来源之一</li>
            </ul>
          </article>

          <article className="button-family">
            <div className="button-family-header">
              <strong>圆形与玻璃态</strong>
              <span>icon button / overlay control</span>
            </div>
            <div className="button-stage dark">
              <button className="circle figma-glass">↗</button>
              <button className="circle figma-glass light">→</button>
              <button className="circle figma-glass focus">+</button>
            </div>
            <ul className="button-spec-list">
              <li>圆形按钮用 50%，和产品里的节点/控件语言一致</li>
              <li>玻璃态多用 `rgba(0,0,0,0.08)` 或 `rgba(255,255,255,0.16)`</li>
              <li>真正有辨识度的是 dashed 2px focus，而不是阴影</li>
            </ul>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'figma-hero') {
    return (
      <div className="figma-demo-hero">
        <div className="figma-gradient" />
        <div className="demo-copy">
          <strong>Design together.</strong>
          <span>Monochrome chrome, colorful output.</span>
        </div>
      </div>
    );
  }

  if (variant === 'figma-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="核心不是单一 UI 卡，而是容器系统：标准白卡、轻抬升卡和展示用彩色容器。"
        notes={['背景 #ffffff', '圆角 6px-8px', '边框极轻或轻阴影', '产品截图作为内容']}
      >
        <div className="figma-card-showcase">
          <div className="figma-card-grid">
            <div className="figma-info-card standard">
              <small>STANDARD CONTAINER</small>
              <strong>Minimal Border</strong>
              <p>Default content surface with minimal border and 8px radius.</p>
            </div>
            <div className="figma-info-card elevated">
              <small>ELEVATED CONTAINER</small>
              <strong>Subtle Shadow</strong>
              <p>Floating surface for showcases and hover moments with medium elevation.</p>
            </div>
            <div className="figma-info-card glass">
              <small>GLASS SURFACE</small>
              <strong>Overlay Surface</strong>
              <p>Glass-like surface using low-opacity black to separate grouped content.</p>
            </div>
          </div>
          <div className="figma-demo-hero slim">
            <div className="figma-gradient" />
            <div className="demo-copy">
              <strong>Design together.</strong>
              <span>Monochrome chrome, colorful output.</span>
            </div>
          </div>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'cursor-buttons') {
    return (
      <ButtonSpecSection summary="" notes={[]}>
        <div className="button-showcase cursor-button-showcase">
          <article className="button-family cursor-family">
            <div className="button-family-header">
              <strong>主动作</strong>
              <span>暖灰面按钮，靠文字和边界变化建立反馈</span>
            </div>
            <div className="button-stage">
              <button className="cursor-primary-button">Continue</button>
              <button className="cursor-primary-button hover">Run task</button>
            </div>
            <ul className="button-spec-list">
              <li>背景来自 warm surface，而不是高饱和品牌色</li>
              <li>文字保持 `#26251e`，hover 才向暖红偏移</li>
              <li>圆角 8px，像编辑器里克制的主操作</li>
            </ul>
          </article>

          <article className="button-family cursor-family">
            <div className="button-family-header">
              <strong>Pill 标签</strong>
              <span>高频过滤、分类、状态标签</span>
            </div>
            <div className="button-stage">
              <button className="cursor-pill">Ask</button>
              <button className="cursor-pill active">Agent</button>
              <button className="cursor-pill ghost">Editor</button>
            </div>
            <ul className="button-spec-list">
              <li>full pill 是 Cursor 非常高频的几何语言</li>
              <li>通过 surface 深浅变化区分默认 / active / ghost</li>
              <li>比 Airbnb 和 Apple 更像编辑器过滤标签</li>
            </ul>
          </article>

          <article className="button-family cursor-family">
            <div className="button-family-header">
              <strong>轻交互</strong>
              <span>下拉、辅助、文档动作</span>
            </div>
            <div className="button-stage">
              <button className="cursor-ghost-button">Open docs</button>
              <button className="cursor-ghost-button strong">Install</button>
            </div>
            <ul className="button-spec-list">
              <li>很多次级动作并不做强边框，而是暖灰透明面</li>
              <li>重点是温暖纸面感，而不是冷白科技按钮</li>
              <li>hover 通过文字 / 边界变化传达活跃状态</li>
            </ul>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'cursor-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="Cursor 的卡片像暖纸页面里切开的信息块：不是冰冷 UI 盒子，而是带有边界、柔和阴影和编辑气质的内容容器。"
        notes={['暖灰背景', 'oklab 边框', '大 blur 阴影', '编辑器截图与正文并置']}
      >
        <div className="cursor-card-grid">
          <div className="cursor-demo-card">
            <div className="cursor-code-block">refactor-button.tsx</div>
            <div className="demo-copy">
              <strong>Agent Timeline</strong>
              <span>Warm surface, editorial copy, and a gentle bordered container.</span>
            </div>
          </div>
          <div className="cursor-demo-card elevated">
            <div className="cursor-code-block soft">docs / guide.mdx</div>
            <div className="demo-copy">
              <strong>Feature Card</strong>
              <span>Large diffused shadow with warm paper-like interior.</span>
            </div>
          </div>
          <div className="cursor-demo-card compact">
            <div className="cursor-chip-row">
              <span>Thinking</span>
              <span>Read</span>
              <span>Edit</span>
            </div>
            <div className="demo-copy">
              <strong>Workflow Module</strong>
              <span>Small pills and warm border tones define micro hierarchy.</span>
            </div>
          </div>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'elevenlabs-buttons') {
    return (
      <ButtonSpecSection summary="" notes={[]}>
        <div className="button-showcase elevenlabs-button-showcase">
          <article className="button-family elevenlabs-family">
            <div className="button-family-header">
              <strong>黑色主动作</strong>
              <span>用纯黑文字和深色 pill 直接建立第一层级</span>
            </div>
            <div className="button-stage">
              <button className="elevenlabs-dark-button">Start creating</button>
              <button className="elevenlabs-dark-button soft">Voice library</button>
            </div>
          </article>

          <article className="button-family elevenlabs-family">
            <div className="button-family-header">
              <strong>暖石 CTA</strong>
              <span>真正有品牌触感的是暖石色半透明 pill</span>
            </div>
            <div className="button-stage">
              <button className="elevenlabs-warm-button">Listen now</button>
              <button className="elevenlabs-warm-button subtle">API access</button>
            </div>
          </article>

          <article className="button-family elevenlabs-family">
            <div className="button-family-header">
              <strong>白色描边动作</strong>
              <span>白底与 outline shadow 的差别极细，但很高级</span>
            </div>
            <div className="button-stage">
              <button className="elevenlabs-light-button">Documentation</button>
              <button className="elevenlabs-light-button ring">Playground</button>
            </div>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'elevenlabs-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="白底或暖石底，极轻 outline shadow 与极轻标题共同决定 ElevenLabs 的卡片气质。"
        notes={['白底 / 暖石底', '16px-24px 圆角', 'outline shadow', '极轻标题']}
      >
        <div className="elevenlabs-card-grid">
          <div className="elevenlabs-demo-card">
            <div className="elevenlabs-wave" />
            <div className="demo-copy">
              <strong>Voice showcase</strong>
              <span>White surface, soft outline, and a whisper-light heading.</span>
            </div>
          </div>
          <div className="elevenlabs-demo-card warm">
            <div className="elevenlabs-wave warm" />
            <div className="demo-copy">
              <strong>Featured workflow</strong>
              <span>Warm stone surface with tactile shadow for featured moments.</span>
            </div>
          </div>
          <div className="elevenlabs-demo-card elevated">
            <div className="elevenlabs-wave dark" />
            <div className="demo-copy">
              <strong>API panel</strong>
              <span>Light surface that barely lifts above the page.</span>
            </div>
          </div>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'linear-buttons') {
    return (
      <ButtonSpecSection summary="" notes={[]}>
        <div className="button-showcase linear-button-showcase">
          <article className="button-family linear-family">
            <div className="button-family-header">
              <strong>品牌主动作</strong>
              <span>唯一真正有色彩的按钮，负责关键转化</span>
            </div>
            <div className="button-stage">
              <button className="linear-primary-button">Start free</button>
              <button className="linear-primary-button hover">Create issue</button>
            </div>
          </article>

          <article className="button-family linear-family">
            <div className="button-family-header">
              <strong>Ghost 动作</strong>
              <span>深底上用极低透明白面和细白边界建立可点击性</span>
            </div>
            <div className="button-stage">
              <button className="linear-ghost-button">Changelog</button>
              <button className="linear-ghost-button strong">Command menu</button>
            </div>
          </article>

          <article className="button-family linear-family">
            <div className="button-family-header">
              <strong>Pill 状态</strong>
              <span>大量状态、过滤与标签使用轻量 pill</span>
            </div>
            <div className="button-stage">
              <button className="linear-pill">Backlog</button>
              <button className="linear-pill active">In progress</button>
              <button className="linear-pill">Done</button>
            </div>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'linear-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="Linear 的卡片主要靠 surface 亮度层级和半透明白边框工作，而不是靠传统黑色阴影。"
        notes={['dark surface', 'rgba white 边界', '8px-12px 圆角', '高密度信息']}
      >
        <div className="linear-card-grid">
          <div className="linear-demo-card">
            <div className="linear-card-top">
              <span>Issue</span>
              <span>UX-42</span>
            </div>
            <div className="demo-copy">
              <strong>Improve command menu</strong>
              <span>Dark translucent surface with fine white border and cool hierarchy.</span>
            </div>
          </div>
          <div className="linear-demo-card elevated">
            <div className="linear-card-top">
              <span>Dialog</span>
              <span>Cmd+K</span>
            </div>
            <div className="demo-copy">
              <strong>Command palette</strong>
              <span>Higher level surface with denser shadow stack for popovers.</span>
            </div>
          </div>
          <div className="linear-demo-card inset">
            <div className="linear-card-top">
              <span>Status</span>
              <span>Live</span>
            </div>
            <div className="demo-copy">
              <strong>Recessed module</strong>
              <span>Inset shadow creates a sunken panel instead of a lifted card.</span>
            </div>
          </div>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'nike-buttons') {
    return (
      <ButtonSpecSection summary="" notes={[]}>
        <div className="button-showcase nike-button-showcase">
          <article className="button-family nike-family">
            <div className="button-family-header">
              <strong>黑色主按钮</strong>
              <span>购买路径中最直接的黑底白字 pill</span>
            </div>
            <div className="button-stage">
              <button className="nike-primary-button">Shop now</button>
              <button className="nike-primary-button soft">Join us</button>
            </div>
          </article>

          <article className="button-family nike-family">
            <div className="button-family-header">
              <strong>白底与描边次动作</strong>
              <span>比主动作更轻，但仍然保持 30px pill</span>
            </div>
            <div className="button-stage">
              <button className="nike-secondary-button">Find a store</button>
              <button className="nike-outline-button">Learn more</button>
            </div>
          </article>

          <article className="button-family nike-family">
            <div className="button-family-header">
              <strong>圆形控件</strong>
              <span>收藏、购物车、轮播等小动作仍保持简洁圆形几何</span>
            </div>
            <div className="button-stage">
              <button className="nike-circle-button">♡</button>
              <button className="nike-circle-button dark">→</button>
              <button className="nike-circle-button">＋</button>
            </div>
          </article>
        </div>
      </ButtonSpecSection>
    );
  }

  if (variant === 'nike-cards') {
    return (
      <CardSpecSection
        brand={brandId}
        summary="Nike 的卡片重点不是装饰，而是商品承载效率。图片无圆角、无阴影，标题、分类和价格直接排列。"
        notes={['商品图硬边', '无阴影', '标题 + 分类 + 价格', '高密度商品网格']}
      >
        <div className="nike-card-grid">
          <div className="nike-demo-card">
            <div className="nike-product-image" />
            <div className="demo-copy">
              <strong>Air Max Dn8</strong>
              <span>Men’s road running shoes</span>
              <span>$190</span>
            </div>
          </div>
          <div className="nike-demo-card">
            <div className="nike-product-image alt" />
            <div className="demo-copy">
              <strong>Pegasus Premium</strong>
              <span>Women’s running shoes</span>
              <span>$210</span>
            </div>
          </div>
          <div className="nike-demo-card category">
            <div className="nike-category-image">
              <span>TRAINING</span>
            </div>
            <div className="demo-copy">
              <strong>Category card</strong>
              <span>Photography carries the emotion, UI only supports navigation.</span>
            </div>
          </div>
        </div>
      </CardSpecSection>
    );
  }

  if (variant === 'generated-buttons' && brand.buttonPreview) {
    const buttonItems = brand.buttonPreview || [];

    return (
      <ButtonSpecSection
        summary={brand.buttonSpec?.summary || '根据文档提取的按钮规范。'}
        notes={(brand.buttonSpec?.notes || []).slice(0, 4)}
      >
        {buttonItems.length ? (
          <div className="button-showcase">
            {buttonItems.map((item) => (
              <article className="button-family generated-family" key={`${brand.id}-${item.title}`}>
                <div className="button-family-header">
                  <strong>{item.title}</strong>
                  <span>{item.note}</span>
                </div>
                <div className="button-stage">
                  <button className="generated-preview-button" style={item.style} type="button">
                    {item.label}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="generated-empty-state">
            <strong>文档未明确按钮家族变体</strong>
            <p>当前仅保留按钮规则文本，避免展示伪按钮样式。</p>
          </div>
        )}
      </ButtonSpecSection>
    );
  }

  if (variant === 'generated-cards' && brand.cardPreview) {
    const cardItems = brand.cardPreview || [];

    return (
      <CardSpecSection
        brand={brandId}
        summary={brand.cardSpec?.summary || '根据文档提取的卡片结构。'}
        notes={(brand.cardSpec?.variants || []).flatMap((item) => item.notes).slice(0, 4)}
      >
        {cardItems.length ? (
          <div className="generated-card-grid">
            {cardItems.map((item) => (
              <div className="generated-demo-card" key={`${brand.id}-${item.title}`} style={item.surfaceStyle}>
                {(() => {
                  const note = item.note?.trim();
                  const body = item.body?.trim();
                  const secondaryBody = item.secondaryBody?.trim();
                  const showNote =
                    note &&
                    note.toLowerCase() !== (body || '').toLowerCase() &&
                    note.toLowerCase() !== (secondaryBody || '').toLowerCase();

                  return (
                    <>
                      {item.showMedia ? <div className="generated-card-media" style={item.mediaStyle} /> : null}
                      <div className="demo-copy generated-demo-copy">
                        {item.badgeLabel ? (
                          <span className="generated-card-badge" style={item.badgeStyle}>
                            {item.badgeLabel}
                          </span>
                        ) : null}
                        <strong>{item.heading || item.title}</strong>
                        {item.body ? <p>{item.body}</p> : null}
                        {item.secondaryBody ? <p className="generated-secondary-copy">{item.secondaryBody}</p> : null}
                        {showNote ? <span className="generated-card-note">{note}</span> : null}
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        ) : (
          <div className="generated-empty-state">
            <strong>文档未明确卡片变体</strong>
            <p>当前仅保留卡片结构规则文本，避免展示伪卡片模板。</p>
          </div>
        )}
      </CardSpecSection>
    );
  }

  return <div className="preview-row">{brandId}</div>;
}

function CardSpecSection({ summary, notes, children }) {
  return (
    <div className="card-spec-wrap">
      <div className="card-spec-meta">
        <p>{summary}</p>
        <div className="card-spec-notes">
          {notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

function BrandTitleWithPreview({ brand, website }) {
  const triggerRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, width: 320 });
  const previewSrc = getBrandPreviewSrc(brand);
  const profile = getBrandProfile(brand);

  const updateTooltipPosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const triggerNode = triggerRef.current;
    if (!triggerNode) return;

    const rect = triggerNode.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const margin = 10;
    const computedWidth = Math.min(560, Math.max(260, viewportWidth * 0.72));

    let left = rect.left;
    if (left + computedWidth > viewportWidth - margin) {
      left = viewportWidth - computedWidth - margin;
    }
    left = Math.max(margin, left);

    const estimatedHeight = computedWidth * (982 / 1512) + 20;
    let top = rect.bottom + 12;
    if (top + estimatedHeight > viewportHeight - margin) {
      top = Math.max(margin, rect.top - estimatedHeight - 12);
    }

    setTooltipStyle({ top, left, width: computedWidth });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    function handleViewportChange() {
      updateTooltipPosition();
    }

    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
    return () => {
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [open, updateTooltipPosition]);

  function showTooltip() {
    updateTooltipPosition();
    setOpen(true);
  }

  function hideTooltip() {
    setOpen(false);
  }

  function handleBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    hideTooltip();
  }

  return (
    <div
      className="brand-title-wrap"
      onBlur={handleBlur}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      ref={triggerRef}
    >
      <h3>{brand.name}</h3>
      {website ? (
        <a
          aria-label={`查看 ${brand.name} 官网`}
          className="brand-site-link"
          href={website}
          rel="noopener noreferrer"
          target="_blank"
          title="查看官网"
        >
          ↗
        </a>
      ) : null}

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="brand-tooltip brand-tooltip-preview brand-tooltip-floating" role="note" style={tooltipStyle}>
              {!failed && previewSrc ? (
                <img
                  alt={`${brand.name} 官网首屏`}
                  className="brand-tooltip-image"
                  loading="lazy"
                  onError={() => setFailed(true)}
                  src={previewSrc}
                />
              ) : (
                <div className="brand-tooltip-fallback">{getBrandPreviewFallbackLabel(brand)}</div>
              )}
              {profile ? (
                <div className="brand-tooltip-meta">
                  <span className="brand-tooltip-category">{profile.category}</span>
                  <p>{profile.intro}</p>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function ButtonSpecSection({ summary, notes, children }) {
  const showMeta = Boolean(summary) || (notes || []).length > 0;

  return (
    <div className="button-spec-wrap">
      {showMeta ? (
        <div className="card-spec-meta">
          {summary ? <p>{summary}</p> : null}
          {(notes || []).length ? (
            <div className="card-spec-notes">
              {(notes || []).map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export default App;
