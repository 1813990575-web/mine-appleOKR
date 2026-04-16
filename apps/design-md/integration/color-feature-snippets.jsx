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
