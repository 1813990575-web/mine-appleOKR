import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = '/Users/aha/Desktop/design-md-library-remaining-renamed';
const OUTPUT_FILE = path.resolve('src/generatedBrands.js');

const themeKicker = '批量提炼版';

const translationPairs = [
  ['Surface & Background', '表面与背景'],
  ['Background Surfaces', '背景层级'],
  ['Surface & Borders', '表面与边界'],
  ['Neutrals & Text', '中性色与文字'],
  ['Text & Content', '文字与内容'],
  ['Brand & Accent', '品牌与强调'],
  ['Brand & Dark', '品牌与深色'],
  ['Secondary & Accent', '次级与强调'],
  ['Primary Brand', '品牌主色'],
  ['Accent Colors', '强调色'],
  ['Interactive', '交互色'],
  ['Neutral Scale', '中性色阶'],
  ['Semantic', '功能色'],
  ['Primary', '主色'],
  ['Shadows', '阴影'],
  ['Shadow Colors', '阴影颜色'],
  ['Buttons', '按钮'],
  ['Cards & Containers', '卡片与容器'],
  ['Inputs & Forms', '表单与输入'],
  ['Navigation', '导航'],
  ['Image Treatment', '图片处理'],
  ['Grid & Container', '网格与容器'],
  ['Grid & Container', '网格与容器'],
  ['Whitespace Philosophy', '留白策略'],
  ['Border Radius Scale', '圆角尺度'],
  ['Touch Targets', '触控目标'],
  ['Collapsing Strategy', '折叠策略'],
  ['Responsive Behavior', '响应式行为'],
  ['Layout Principles', '布局原则'],
  ['Typography Rules', '字体规则'],
  ['Color Palette & Roles', '颜色系统'],
  ['Visual Theme & Atmosphere', '视觉气质'],
  ['Depth & Elevation', '层级与阴影'],
  ['Do\'s and Don\'ts', '规范边界'],
  ['Page background', '页面背景'],
  ['Primary background', '主背景'],
  ['Primary surface', '主表面'],
  ['Secondary surface', '次级表面'],
  ['Elevated surface', '抬升表面'],
  ['Card surfaces', '卡片表面'],
  ['Card surface', '卡片表面'],
  ['card surfaces', '卡片表面'],
  ['button backgrounds', '按钮背景'],
  ['button background', '按钮背景'],
  ['Button backgrounds', '按钮背景'],
  ['Primary text', '主文字'],
  ['Secondary text', '次级文字'],
  ['Muted labels', '弱化标签'],
  ['Muted content', '弱化内容'],
  ['Headings', '标题'],
  ['Body text', '正文'],
  ['CTA buttons', 'CTA 按钮'],
  ['CTA button', 'CTA 按钮'],
  ['links', '链接'],
  ['link text', '链接文字'],
  ['Link text', '链接文字'],
  ['active states', '激活状态'],
  ['hover states', '悬浮状态'],
  ['hover state', '悬浮状态'],
  ['Focus ring', '聚焦描边'],
  ['focus ring', '聚焦描边'],
  ['Keyboard focus indicator', '键盘聚焦提示'],
  ['Card borders', '卡片边框'],
  ['Card borders', '卡片边框'],
  ['Border color', '边框颜色'],
  ['Border', '边框'],
  ['Divider lines', '分隔线'],
  ['dividers', '分隔线'],
  ['Success indicators', '成功提示'],
  ['warning states', '警告状态'],
  ['error states', '错误状态'],
  ['status badges', '状态徽标'],
  ['selected elements', '选中元素'],
  ['interactive highlights', '交互高亮'],
  ['Primary button', '主按钮'],
  ['Primary CTA', '主 CTA'],
  ['Ghost / Outlined', 'Ghost / 描边'],
  ['Outlined Pill', '描边胶囊'],
  ['Dark Pill', '深色胶囊'],
  ['Light Pill', '浅色胶囊'],
  ['Circular Play', '圆形播放键'],
  ['Default input', '默认输入'],
  ['Focused input', '聚焦输入'],
  ['Default state', '默认状态'],
  ['Use:', '用途：'],
];

function readFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
}

function parseSections(text) {
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    return {
      title: match[1].trim(),
      content: text.slice(start, end).trim(),
    };
  });
}

function parseSubsections(content) {
  const matches = [...content.matchAll(/^###\s+(.+)$/gm)];

  if (matches.length === 0) {
    return [{ title: '', content: content.trim() }];
  }

  return matches.map((match, index) => {
    const heading = match[1].trim();
    const colonIndex = heading.indexOf(':');
    const title = colonIndex > -1 ? heading.slice(0, colonIndex).trim() : heading;
    const inlineContent = colonIndex > -1 ? heading.slice(colonIndex + 1).trim() : '';
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : content.length;
    const blockContent = content.slice(start, end).trim();
    const mergedContent = [inlineContent ? `- ${inlineContent}` : '', blockContent].filter(Boolean).join('\n');
    return {
      title,
      content: mergedContent,
    };
  });
}

function sectionByNumber(sections, number) {
  return sections.find((section) => section.title.startsWith(`${number}.`)) ?? null;
}

function firstParagraph(content) {
  return content
    .split('\n\n')
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('###') && !item.startsWith('**Key Characteristics:**')) ?? '';
}

function bulletLines(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '));
}

function parseMarkdownTableRows(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'))
    .map((line) => line.slice(1, -1).split('|').map((cell) => cleanText(cell.trim())))
    .filter((cells) => cells.length >= 2)
    .filter((cells) => {
      const joined = cells.join(' ').toLowerCase();
      if (joined.includes('---')) return false;
      if (cells[0].toLowerCase() === 'level') return false;
      if (cells[0].toLowerCase() === 'name') return false;
      if (cells[0].toLowerCase() === 'breakpoint') return false;
      return true;
    });
}

function formatResponsiveTable(content) {
  const rows = parseMarkdownTableRows(content || '').filter((cells) => cells.length >= 2);
  if (!rows.length) return '';

  return rows
    .slice(0, 4)
    .map((cells) => {
      const [name = '', width = '', detail = ''] = cells;
      const head = [cleanText(name), cleanText(width)].filter(Boolean).join(' ');
      if (!detail) return head;
      return `${head} ${cleanText(detail)}`.trim();
    })
    .filter(Boolean)
    .join(' · ');
}

function cleanText(value) {
  return value
    .replace(/^\s*-\s*/, '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function translateUiText(value) {
  let output = cleanText(value);

  for (const [from, to] of translationPairs) {
    output = output.replaceAll(from, to);
  }

  return output.replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getBrandName(text, filename) {
  const line = text.match(/^#\s+Design System Inspired by\s+(.+)$/m);
  return line?.[1]?.trim() ?? filename.replace(/ DESIGN\.md$/i, '').trim();
}

function textColorFor(value) {
  if (!value || !value.startsWith('#')) return '#111111';
  const hex = value.slice(1);
  const full = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#111111';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? '#111111' : '#ffffff';
}

function extractCodeValue(text) {
  const match = text.match(/`([^`]+)`/);
  return match?.[1]?.trim() ?? '';
}

function parseColorSection(section) {
  if (!section) return [];
  return parseSubsections(section.content)
    .map((subsection) => {
      const items = bulletLines(subsection.content)
        .map((line) => {
          const parsed = line.match(/- \*\*(.+?)\*\* \((`[^`]+`)\):\s*(.+)$/);
          if (parsed) {
            const value = parsed[2].replace(/`/g, '');
            return {
              name: cleanText(parsed[1]),
              value,
              usage: translateUiText(parsed[3]),
              textColor: textColorFor(value),
            };
          }

          const inline = line.match(/- \*\*(.+?)\*\*:\s*(.+)$/);
          if (inline) {
            const value = extractCodeValue(inline[2]) || '#ffffff';
            return {
              name: cleanText(inline[1]),
              value,
              usage: translateUiText(inline[2]),
              textColor: textColorFor(value),
            };
          }

          return null;
        })
        .filter(Boolean);

      if (items.length === 0) return null;
      return {
        group: translateUiText(subsection.title || '核心色'),
        items: items.slice(0, 8),
      };
    })
    .filter(Boolean);
}

function parseMarkdownTable(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'));

  if (lines.length < 3) return [];

  const rows = lines.slice(2).map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean));
  return rows;
}

function parseNumber(text, fallback) {
  const match = String(text).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : fallback;
}

function sampleForRole(role) {
  const lower = role.toLowerCase();
  if (lower.includes('hero') || lower.includes('display')) return 'Design systems, compared clearly.';
  if (lower.includes('heading') || lower.includes('title')) return 'Section heading';
  if (lower.includes('button')) return 'Primary action';
  if (lower.includes('caption') || lower.includes('micro') || lower.includes('label')) return 'Metadata label';
  if (lower.includes('code') || lower.includes('mono')) return 'code / technical label';
  return 'Readable product copy for fast comparison.';
}

function fontFallback(fontName) {
  const lower = fontName.toLowerCase();
  if (lower.includes('mono') || lower.includes('code')) return '"IBM Plex Mono", monospace';
  if (lower.includes('serif') || lower.includes('waldenburg') || lower.includes('groot')) return 'Georgia, "Times New Roman", serif';
  return 'system-ui, -apple-system, sans-serif';
}

function parseTypography(section) {
  if (!section) return [];
  const table = parseMarkdownTable(section.content);
  return table.slice(0, 8).map((row) => {
    const [label = '文本', font = 'System', size = '16px', weight = '400', lineHeight = '1.4', letterSpacing = 'normal'] = row;
    const sizePx = parseNumber(size, 16);
    const weightNum = parseNumber(weight, 400);
    const lineHeightNum = parseNumber(lineHeight, 1.4);
    const spacing = /normal/i.test(letterSpacing) ? 0 : `${parseNumber(letterSpacing, 0)}px`;

    return {
      label: cleanText(label),
      sample: sampleForRole(label),
      meta: `${cleanText(size)} / ${cleanText(weight)} / ${cleanText(lineHeight)} / ${cleanText(font)}`,
      style: {
        fontSize: sizePx,
        fontWeight: weightNum,
        lineHeight: lineHeightNum,
        letterSpacing: spacing,
        fontFamily: fontFallback(font),
      },
    };
  });
}

function parseButtonBlocks(content) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const boldOnly = line.match(/^\*\*(.+?)\*\*$/);
    const bulletBold = line.match(/^- \*\*(.+?)\*\*:\s*(.+)$/);
    const bulletBoldOnly = line.match(/^- \*\*(.+?)\*\*$/);
    const heading4 = line.match(/^####\s+(.+)$/);

    if (boldOnly) {
      if (current) blocks.push(current);
      current = { title: cleanText(boldOnly[1]), lines: [] };
      continue;
    }

    if (bulletBoldOnly) {
      if (current) blocks.push(current);
      current = { title: cleanText(bulletBoldOnly[1]), lines: [] };
      continue;
    }

    if (heading4) {
      if (current) blocks.push(current);
      current = { title: cleanText(heading4[1]), lines: [] };
      continue;
    }

    if (bulletBold) {
      blocks.push({ title: cleanText(bulletBold[1]), lines: [cleanText(bulletBold[2])] });
      current = null;
      continue;
    }

    if (current) current.lines.push(line);
  }

  if (current) blocks.push(current);
  return blocks;
}

function findLineValue(lines, keywords) {
  const line = lines.find((item) => keywords.some((keyword) => item.toLowerCase().includes(keyword)));
  if (!line) return '';
  const raw = line.includes(':') ? line.split(':').slice(1).join(':') : line;
  return extractCodeValue(line) || cleanText(raw);
}

function looksLikeShadowValue(value) {
  if (!value) return false;
  if (/(^|\s)(solid|dashed|dotted)(\s|$)/i.test(value) && !/var\(--shadow|drop-shadow|shadow/i.test(value)) {
    return false;
  }
  if (/(rgba|rgb|hsl|hsla|inset|drop-shadow)/i.test(value)) return true;
  if (/var\(--shadow/i.test(value)) return true;
  if (/^\d/.test(value) && value.includes('px') && /\s+\d+/.test(value)) return true;
  return false;
}

function findShadowValue(lines) {
  const shadowLine = lines.find((line) => /shadow/i.test(line));
  if (!shadowLine) return '';
  const codeMatches = [...shadowLine.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
  const codeValue = codeMatches.find((item) => looksLikeShadowValue(item));
  if (codeValue) return codeValue;
  const plain = cleanText(shadowLine.split(':').slice(1).join(':'));
  return looksLikeShadowValue(plain) ? plain : '';
}

function stripTrailingAnnotation(value) {
  return value
    .replace(/\s+\([^)]*\)\s*$/g, '')
    .replace(/\s+--.*$/g, '')
    .trim();
}

function firstCssLength(value, fallback = '') {
  const match = (value || '').match(/-?\d+(?:\.\d+)?(?:px|rem|em|%)|(?:50%|9999px)/i);
  return match ? match[0] : fallback;
}

function normalizeBorderValue(border) {
  if (!border) return '';
  const normalized = stripTrailingAnnotation(border);
  if (!normalized) return '';
  if (/^\d+px\s+solid/i.test(normalized) || /^\d+px\s+dashed/i.test(normalized) || /^\d+px\s+dotted/i.test(normalized)) return normalized;
  if (/^none$/i.test(normalized)) return 'none';
  return `1px solid ${normalized}`;
}

function normalizeShadowValue(value) {
  const normalized = stripTrailingAnnotation(value || '');
  if (!normalized) return '';
  if (!looksLikeShadowValue(normalized)) return '';
  if (/(^|\s)(solid|dashed|dotted)(\s|$)/i.test(normalized) && !/(rgba|rgb|inset|var\(--shadow)/i.test(normalized)) {
    return '';
  }
  return normalized;
}

function normalizeBorderFromHint(value, fallback = '1px solid rgba(0,0,0,0.12)') {
  const raw = cleanText(value || '');
  if (!raw) return fallback;
  if (/^\d+px\s+(solid|dashed|dotted)\s+/i.test(raw)) return raw;
  if (/^none$/i.test(raw)) return 'none';
  const color = extractFirstColorValue(raw);
  if (color && color !== 'transparent') return `1px solid ${color}`;
  return fallback;
}

function normalizePlaceholderValue(value) {
  const raw = cleanText(value || '');
  if (!raw) return 'Input field';
  if (raw.length > 40) return 'Input field';
  if (/border|radius|padding|focus|hover|shadow|ring|outline/i.test(raw)) return 'Input field';
  return translateUiText(raw);
}

function extractFirstColorValue(value) {
  const source = String(value || '').trim();
  if (!source) return '';

  const token =
    source.match(/#[0-9a-fA-F]{3,8}\b/)?.[0] ||
    source.match(/rgba?\([^)]+\)/i)?.[0] ||
    source.match(/hsla?\([^)]+\)/i)?.[0] ||
    source.match(/oklch\([^)]+\)/i)?.[0] ||
    source.match(/var\(--[^)]+\)/i)?.[0] ||
    source.match(/\btransparent\b/i)?.[0] ||
    source.match(/\bwhite\b/i)?.[0] ||
    source.match(/\bblack\b/i)?.[0];

  if (!token) return '';

  if (/^white$/i.test(token)) return '#ffffff';
  if (/^black$/i.test(token)) return '#000000';
  return token;
}

function normalizePaddingValue(value, fallback = '') {
  const lengths = String(value || '').match(/-?\d+(?:\.\d+)?(?:px|rem|em|%)\b/gi) || [];
  if (!lengths.length) return fallback;
  if (lengths.length === 1) return `${lengths[0]} ${lengths[0]}`;
  return lengths.slice(0, 4).join(' ');
}

function normalizeStyle(style) {
  const next = { ...style };
  Object.keys(next).forEach((key) => {
    if (!next[key]) delete next[key];
  });
  return next;
}

function parseNamedBlocks(content) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const boldOnly = line.match(/^\*\*(.+?)\*\*$/);
    if (boldOnly) {
      if (current) blocks.push(current);
      current = { title: cleanText(boldOnly[1]), lines: [] };
      continue;
    }
    if (current) current.lines.push(cleanText(line));
  }

  if (current) blocks.push(current);
  return blocks;
}

function linesByKeywords(content, keywords) {
  const lines = content
    .split('\n')
    .map((line) => cleanText(line))
    .filter(Boolean);
  const lowered = keywords.map((keyword) => keyword.toLowerCase());
  return lines.filter((line) => {
    const value = line.toLowerCase();
    return lowered.some((keyword) => value.includes(keyword));
  });
}

function hasKeywords(content, keywords) {
  const lower = cleanText(content || '').toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function extractBadgeLabels(value) {
  const source = cleanText(value || '').replace(/^use:\s*/i, '');
  if (!source) return [];

  const quoted = [...source.matchAll(/"([^"]+)"/g)].map((match) => match[1].trim());
  const chunks = source
    .split(',')
    .map((item) => item.replace(/"([^"]+)"/g, '$1'))
    .map((item) => item.replace(/\b(badges?|labels?|tags?)\b/gi, '').trim())
    .filter(Boolean);

  const dictionary = {
    status: '状态',
    feature: '功能',
    new: '新功能',
    project: '项目',
    projects: '项目',
    workspace: '工作区',
    productivity: '生产力',
  };

  const toTitleCase = (value) =>
    value
      .toLowerCase()
      .split(/\s+/)
      .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
      .join(' ');

  const all = [...chunks, ...quoted];
  const deduped = all.filter((item, index) => all.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
  return deduped.map((item) => {
    const display = toTitleCase(item);
    const key = display.toLowerCase();
    const translated = dictionary[key] || '';
    return translated ? `${display} ${translated}` : display;
  });
}

function parseButtonsAndCards(section, colors, typography = []) {
  const subsections = parseSubsections(section?.content ?? '');
  const sectionContent = section?.content ?? '';
  const buttonsContent =
    subsections.find((item) => item.title.toLowerCase().includes('button'))?.content ??
    linesByKeywords(sectionContent, ['button', 'cta', 'pill', 'chip', 'link']).join('\n');
  const cardsContent =
    subsections.find((item) => item.title.toLowerCase().includes('card'))?.content ??
    linesByKeywords(sectionContent, ['card', 'container', 'surface', 'shadow', 'radius', 'border']).join('\n');
  const distinctiveContent = subsections.find((item) => item.title.toLowerCase().includes('distinctive'))?.content ?? '';

  const buttonLines = buttonsContent.split('\n').map((line) => cleanText(line)).filter(Boolean);
  const extractedButtonBlocks = parseButtonBlocks(buttonsContent);
  const propertyPrefixes = ['background', 'text', 'color', 'border', 'radius', 'padding', 'hover', 'focus', 'active', 'transition', 'shadow'];
  const colonVariantBlocks = buttonLines
    .map((line) => {
      const match = line.match(/^([A-Za-z0-9\u4e00-\u9fa5 ()/\-]{2,40}):\s*(.+)$/);
      if (!match) return null;
      const title = cleanText(match[1]);
      const detail = cleanText(match[2]);
      if (!title || !detail) return null;
      const lowerTitle = title.toLowerCase();
      if (propertyPrefixes.some((prefix) => lowerTitle === prefix || lowerTitle.startsWith(`${prefix} `))) {
        return null;
      }
      return { title, lines: [detail] };
    })
    .filter(Boolean)
    .slice(0, 3);
  const buttonBlocks =
    extractedButtonBlocks.length > 0
      ? extractedButtonBlocks.slice(0, 3)
      : colonVariantBlocks.length
        ? colonVariantBlocks
      : buttonLines.length
        ? [
            {
              title: 'Button Rule',
              lines: buttonLines.filter((line) =>
                /background|text|border|radius|padding|hover|focus|font|line-height|use|cta|button/i.test(line),
              ),
            },
          ]
        : [];
  const primaryColor = colors.flatMap((group) => group.items).find((item) => item.usage.toLowerCase().includes('cta') || item.usage.toLowerCase().includes('button'))?.value ?? '#111111';

  const buttonPreview = buttonBlocks.length
    ? buttonBlocks.map((block, index) => {
        const context = `${block.title} ${block.lines.join(' ')}`.toLowerCase();
        const titleRaw = cleanText(block.title);
        const visualHint =
          findLineValue(block.lines, ['background', 'bg']) ||
          (context.includes('transparent') ? 'transparent' : '') ||
          (context.includes('white') ? '#ffffff' : '') ||
          (context.includes('black') ? '#000000' : '');
        const background =
          extractFirstColorValue(visualHint) || (index === 0 ? primaryColor : index === 1 ? '#ffffff' : 'transparent');
        const hasExplicitTextSignal = block.lines.some((line) => /\btext\b|\bcolor\b/i.test(line));
        const textHint = findLineValue(block.lines, ['text', 'color']) || context;
        const colorFromHint = extractFirstColorValue(textHint);
        const color =
          (hasExplicitTextSignal ? colorFromHint : '') ||
          (background === 'transparent'
            ? extractFirstColorValue(context) || '#111111'
            : textColorFor(background));
        const border = findLineValue(block.lines, ['border']);
        const borderRadius = findLineValue(block.lines, ['radius']) || '10px';
        const boxShadow = findShadowValue(block.lines);
        const padding = normalizePaddingValue(findLineValue(block.lines, ['padding']), '10px 16px');
        const note = findLineValue(block.lines, ['use']) || block.lines.slice(0, 2).join(' · ') || '';
        const title =
          /button rule|button spec/i.test(titleRaw) && block.lines[0]
            ? `${cleanText(block.lines[0].split(':')[0]).slice(0, 18) || `Button ${index + 1}`}`
            : titleRaw;
        const isCircle = context.includes('circle');
        const isBadge = context.includes('badge');
        const finalBackground = background;
        const finalBorder =
          normalizeBorderValue(border) ||
          (finalBackground === 'transparent' ? `1px solid ${color || '#111111'}` : '');
        const finalPadding = isCircle ? '0' : isBadge ? normalizePaddingValue(padding, '4px 8px') : padding;

        return {
          title,
          note: translateUiText(note),
          label: isCircle ? '○' : title,
          style: normalizeStyle({
            background: finalBackground,
            color,
            border:
              finalBorder ||
              (isCircle && finalBackground === '#ffffff' ? '1px solid rgba(0,0,0,0.18)' : ''),
            borderRadius: isCircle ? '50%' : firstCssLength(borderRadius, '10px'),
            boxShadow,
            padding: finalPadding,
            width: isCircle ? '44px' : '',
            height: isCircle ? '44px' : '',
          }),
        };
      })
    : [];

  const buttonSpec = {
    summary:
      translateUiText(firstParagraph(buttonsContent)) ||
      buttonPreview
        .map((item) => item.note)
        .filter(Boolean)
        .slice(0, 2)
        .join(' ') ||
      '文档未提供明确按钮家族说明。',
    notes: buttonLines.slice(0, 4).map(translateUiText),
    variants: buttonPreview.map((item) => ({
      name: item.title,
      notes: [item.note].filter(Boolean),
    })),
  };

  const cardLines = bulletLines(cardsContent);
  const cardBackground = findLineValue(cardLines, ['background']) || '#ffffff';
  const cardBorder = findLineValue(cardLines, ['border']) || '1px solid rgba(0,0,0,0.08)';
  const cardRadius = findLineValue(cardLines, ['radius']) || '16px';
  const cardShadow = findLineValue(cardLines, ['shadow']);
  const warmSurface = colors
    .flatMap((group) => group.items)
    .find((item) => item.name.toLowerCase().includes('warm white') || item.value.toLowerCase() === '#f6f5f4')?.value;

  const badgeBlock = parseButtonBlocks(buttonsContent).find(
    (block) => /badge|pill|tag|label/i.test(block.title) || block.lines.some((line) => /badge|pill|tag|label/i.test(line)),
  );
  const badgeBackground = badgeBlock ? findLineValue(badgeBlock.lines, ['background']) : '';
  const badgeText = badgeBlock ? findLineValue(badgeBlock.lines, ['text']) : '';
  const badgeRadius = badgeBlock ? findLineValue(badgeBlock.lines, ['radius']) : '';
  const badgePadding = badgeBlock ? findLineValue(badgeBlock.lines, ['padding']) : '';
  const badgeBorder = badgeBlock ? findLineValue(badgeBlock.lines, ['border']) : '';
  const badgeUseLine = badgeBlock ? findLineValue(badgeBlock.lines, ['use']) : '';
  const badgeIsSemantic = badgeBlock ? /badge|tag|label/i.test(badgeBlock.title) || /badge|tag|label/i.test(badgeUseLine) : false;
  const badgeLabels = badgeIsSemantic ? extractBadgeLabels(badgeUseLine).slice(0, 3) : [];

  const cardBlocks = parseNamedBlocks(distinctiveContent).filter(
    (block) => /card|container|feature|metric/i.test(block.title) || block.lines.some((line) => /card|container|feature|metric/i.test(line)),
  );
  const cardTitleMeta = typography.find((item) => item.label.toLowerCase().includes('card title'))?.meta || '';
  const bodyMeta = typography.find((item) => item.label.toLowerCase().includes('body') || item.label.toLowerCase().includes('paragraph'))?.meta || '';

  const cardSeeds = cardBlocks.slice(0, 3).map((block, index) => {
    const title = block.title.replace(/\bwith\b.*$/i, '').trim() || `Card Spec ${index + 1}`;
    const firstLine = block.lines.find((line) => !/^[-*]/.test(line)) || '';
    const detailLine = block.lines.find((line) => /title|description|use|number|background|radius/i.test(line) && line !== firstLine) || block.lines[1] || '';
    const prefersMedia = block.lines.some((line) => /image|illustration|screenshot/i.test(line));
    const prefersWarm = block.lines.some((line) => /warm white|alternating/i.test(line));

    return {
      title,
      heading: translateUiText(title),
      note: translateUiText(firstLine || cardLines[index] || '基于文档提炼的卡片结构'),
      body: firstLine || cardTitleMeta,
      secondaryBody: detailLine || bodyMeta,
      prefersMedia,
      prefersWarm,
    };
  });

  if (!cardSeeds.length && cardLines.length) {
    const buildTitleFromLine = (line, index) => {
      const lower = line.toLowerCase();
      const colonLabel = cleanText(line.split(':')[0] || '');
      const colonWordCount = colonLabel.split(/\s+/).filter(Boolean).length;
      if (colonLabel && colonLabel.length >= 3 && colonLabel.length <= 28 && colonWordCount <= 3) {
        return `${colonLabel} Rule`;
      }
      if (lower.includes('feature')) return 'Feature Card';
      if (lower.includes('metric')) return 'Metric Card';
      if (lower.includes('media') || lower.includes('image') || lower.includes('photo')) return 'Media Card';
      if (lower.includes('container')) return 'Container Card';
      if (lower.includes('hero')) return 'Hero Card';
      if (lower.includes('radius')) return 'Radius Rule';
      if (lower.includes('border')) return 'Border Rule';
      if (lower.includes('shadow')) return 'Shadow Rule';
      if (lower.includes('background')) return 'Surface Rule';
      return `Card Rule ${index + 1}`;
    };

    cardLines.slice(0, 3).forEach((line, index) => {
      cardSeeds.push({
        title: buildTitleFromLine(line, index),
        heading: translateUiText(buildTitleFromLine(line, index)),
        note: translateUiText(line),
        body: cleanText(line),
        secondaryBody: index === 0 ? cardTitleMeta || bodyMeta : bodyMeta,
        prefersMedia: /image|photo|screenshot|illustration/i.test(line),
        prefersWarm: /warm|alternating|cream|beige/i.test(line),
      });
    });
  }

  const defaultBadgeLabels = ['Status 状态', 'Feature 功能', 'New 新功能'];

  const cardPreview = cardSeeds.slice(0, 3).map((seed, index) => {
    const background = seed.prefersWarm && warmSurface ? warmSurface : cardBackground;
    const badgeLabel = badgeLabels[index] || defaultBadgeLabels[index] || '';
    const bodyText = cleanText(seed.body || seed.note || seed.heading || `Card ${index + 1}`);
    const secondaryBodyText = cleanText(seed.secondaryBody || seed.note || bodyMeta || cardTitleMeta || '');

    return {
      title: seed.title,
      heading: seed.heading,
      note: seed.note,
      body: translateUiText(bodyText),
      secondaryBody: translateUiText(secondaryBodyText),
      showMedia: seed.prefersMedia,
      mediaStyle: seed.prefersMedia
        ? normalizeStyle({
            borderBottom: normalizeBorderValue(cardBorder),
            background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.08), rgba(17, 17, 17, 0.02))',
          })
        : {},
      badgeLabel: badgeIsSemantic ? badgeLabel : '',
      badgeStyle: badgeIsSemantic
        ? normalizeStyle({
            background: badgeBackground,
            color: badgeText || textColorFor(badgeBackground || '#f2f9ff'),
            border: normalizeBorderValue(badgeBorder),
            borderRadius: firstCssLength(badgeRadius, '9999px'),
            padding: badgePadding || '4px 8px',
          })
        : {},
      surfaceStyle: normalizeStyle({
        background,
        border: normalizeBorderValue(cardBorder),
        borderRadius: firstCssLength(cardRadius, '12px'),
        boxShadow: cardShadow,
        color: textColorFor(background),
      }),
    };
  });

  const cardNotes = [
    ...cardLines.slice(0, 4),
    ...cardBlocks.slice(0, 2).flatMap((block) => block.lines.slice(0, 1).map((line) => `- ${line}`)),
  ];

  const cardSpec = {
    summary:
      cardNotes.slice(0, 2).map(translateUiText).join(' ') ||
      cardPreview.map((item) => item.note).filter(Boolean).slice(0, 2).join(' ') ||
      '文档未明确给出卡片变体说明。',
    variants: cardPreview.map((item) => ({
      name: item.title,
      notes: [item.note, item.secondaryBody].filter(Boolean).map(translateUiText),
    })),
  };

  return {
    buttonSpec,
    buttonPreview,
    cardPreview,
    cardSpec,
    components: [
      { title: '按钮', note: '根据文档提取的按钮家族。', variant: 'generated-buttons' },
      { title: '卡片', note: '根据文档提取的卡片结构。', variant: 'generated-cards' },
    ],
  };
}

function inferGeneratedLayoutBlueprint({ sectionContent, gridText, spacingText, responsiveText, summary }) {
  const source = [sectionContent, gridText, spacingText, responsiveText, summary]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const features = {
    fullBleed: /full[- ]?bleed|full[- ]?width|edge[- ]?to[- ]?edge|全宽/.test(source),
    centeredContainer: /max content width|centered|居中|container/.test(source),
    heroSingle: /hero[^.]{0,48}(single|centered|单列)|single-column hero|hero 保持单列|hero centered/.test(source),
    alternatingSections: /alternat|asymmetric|zigzag|left \/ text right|reversed|交错|左右反转/.test(source),
    cardGrid: /card grids?|cards?[^.]{0,30}(2|3|4)[-–~to]{0,8}(2|3|4)?\s*column|[234]\s*-\s*[234]\s*columns?|multi-column|3-column|2-column/.test(
      source,
    ),
    sidebarRail: /sidebar|left rail|toc|table of contents|侧栏|目录/.test(source),
    marqueeStrip: /marquee|horizontal scroll|横向滚动/.test(source),
    dashboardShell: /dashboard|widget|metrics|table|panel/.test(source),
    responsiveStack: /single column|stacked|collapse|2-column|3-column|断点|mobile|tablet|desktop/.test(source),
  };

  const score = [
    features.fullBleed ? 2 : 0,
    features.centeredContainer ? 1 : 0,
    features.heroSingle ? 1 : 0,
    features.alternatingSections ? 2 : 0,
    features.cardGrid ? 2 : 0,
    features.sidebarRail ? 2 : 0,
    features.marqueeStrip ? 1 : 0,
    features.dashboardShell ? 2 : 0,
    features.responsiveStack ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const hasLayoutSignals = /hero|grid|container|column|section|sidebar|breakpoint|responsive|layout/.test(source);
  const confidence = hasLayoutSignals && score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  const evidence = [gridText, responsiveText, summary, spacingText]
    .map((item) => cleanText(item || ''))
    .filter(Boolean)
    .slice(0, 4);

  return {
    confidence,
    score,
    features,
    evidence,
  };
}

function parseLayout(section, responsiveSection) {
  const subsections = parseSubsections(section?.content ?? '');
  const sectionContent = section?.content ?? '';
  const spacing =
    subsections.find((item) => /spacing|scale|base unit/i.test(item.title))?.content ??
    linesByKeywords(sectionContent, ['spacing', 'scale', 'base unit']).join(' ');
  const grid =
    subsections.find((item) => /grid|container|layout/i.test(item.title))?.content ??
    linesByKeywords(sectionContent, ['grid', 'container', 'layout', 'column', 'hero']).join(' ');
  const whitespace =
    subsections.find((item) => /whitespace|rhythm|pacing/i.test(item.title))?.content ??
    linesByKeywords(sectionContent, ['whitespace', 'rhythm', 'padding', 'breathing', 'section spacing']).join(' ');
  const radius =
    subsections.find((item) => /radius/i.test(item.title))?.content ??
    linesByKeywords(sectionContent, ['radius', 'pill', 'circle']).join(' ');
  const responsiveTable = formatResponsiveTable(responsiveSection?.content ?? '');
  const responsiveBullets = bulletLines(responsiveSection?.content ?? '').slice(0, 3).map(cleanText);
  const responsiveText =
    responsiveTable ||
    responsiveBullets.join(' ') ||
    cleanText(firstParagraph(responsiveSection?.content ?? '')) ||
    linesByKeywords(responsiveSection?.content ?? '', ['breakpoint', 'responsive', 'mobile', 'tablet', 'desktop']).join(' ');
  const summary = [firstParagraph(grid), firstParagraph(whitespace), firstParagraph(sectionContent)].filter(Boolean).join(' ');
  const spacingText = firstParagraph(spacing) || bulletLines(spacing).join(' ');
  const gridText = firstParagraph(grid) || bulletLines(grid).join(' ');
  const rhythmText = firstParagraph(whitespace) || bulletLines(whitespace).join(' ');
  const radiusText = firstParagraph(radius) || bulletLines(radius).join(' ');
  const sectionFallback = cleanText(firstParagraph(sectionContent) || bulletLines(sectionContent).join(' '));
  const spacingFinal = translateUiText(spacingText || sectionFallback || '文档未明确说明');
  const gridFinal = translateUiText(gridText || sectionFallback || '文档未明确说明');
  const rhythmFinal = translateUiText(rhythmText || sectionFallback || '文档未明确说明');
  const radiusFinal = translateUiText(radiusText || sectionFallback || '文档未明确说明');
  const summaryFinal = translateUiText(summary || '文档未完整给出页面骨架描述。');
  const generatedBlueprint = inferGeneratedLayoutBlueprint({
    sectionContent,
    gridText: gridFinal,
    spacingText: spacingFinal,
    responsiveText: translateUiText(responsiveText || ''),
    summary: summaryFinal,
  });

  return {
    layout: {
      spacing: spacingFinal,
      grid: gridFinal,
      rhythm: rhythmFinal,
      radius: radiusFinal,
    },
    layoutSpec: {
      summary: summaryFinal,
      notes:
        bulletLines(grid).slice(0, 4).map(translateUiText).length
          ? bulletLines(grid).slice(0, 4).map(translateUiText)
          : bulletLines(sectionContent).slice(0, 4).map(translateUiText),
      rows: [
        { label: '间距系统', value: spacingFinal },
        { label: '网格与容器', value: gridFinal },
        {
          label: '响应式',
          value:
            translateUiText(responsiveText) ||
            translateUiText(linesByKeywords(sectionContent, ['breakpoint', 'responsive']).join(' ')) ||
            '文档未明确给出',
        },
      ],
      model: 'generated',
      generatedBlueprint,
    },
  };
}

function uniqueSortedNumbers(values) {
  return [...new Set(values)].filter((value) => value > 0 && value < 10000).sort((a, b) => a - b);
}

function parseSpacingScale(layoutSection) {
  const values = [...(layoutSection?.content ?? '').matchAll(/(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  const filtered = uniqueSortedNumbers(values).filter((value) => value <= 96);
  return filtered.slice(0, 16);
}

function parseRadiusScale(layoutSection) {
  const layoutContent = layoutSection?.content ?? '';
  const radiusSub =
    parseSubsections(layoutContent).find((item) => item.title.toLowerCase().includes('radius'))?.content ??
    linesByKeywords(layoutContent, ['radius', 'pill', 'circle']).join(' ');
  const values = [
    ...[...radiusSub.matchAll(/(\d+(?:\.\d+)?)px/g)].map((match) => `${match[1]}px`),
    ...[...radiusSub.matchAll(/(50%|9999px|500px)/g)].map((match) => match[1]),
  ];
  const deduped = [...new Set(values)].slice(0, 6);
  return deduped.length
    ? deduped.map((value) => ({
        value,
        label: value === '50%' ? '圆形控件' : value.includes('9999') || value.includes('500') ? '胶囊' : '容器',
        shape: value === '50%' ? 'circle' : value.includes('9999') || value.includes('500') ? 'pill' : 'square',
      }))
    : [
        { value: '8px', label: '容器', shape: 'square' },
        { value: '9999px', label: '胶囊', shape: 'pill' },
      ];
}

function parseElevation(depthSection, colors) {
  const content = depthSection?.content ?? '';
  const lines = bulletLines(content);
  const entries = [];
  const colorItems = colors.flatMap((group) => group.items);
  const cardShadowToken = colorItems.find((item) => /card shadow/i.test(item.name) || /card shadow/i.test(item.usage))?.value || '';
  const deepShadowToken = colorItems.find((item) => /deep shadow/i.test(item.name) || /deep shadow/i.test(item.usage))?.value || '';
  const whisperBorderToken = colorItems.find((item) => /whisper border/i.test(item.name) || /whisper border/i.test(item.usage))?.value || '1px solid rgba(0,0,0,0.1)';

  for (const line of lines) {
    const value = extractCodeValue(line);
    if (value && /(shadow|rgba|rgb|inset)/i.test(line)) {
      const shadow = normalizeShadowValue(value);
      if (!shadow) continue;
      entries.push({
        title: cleanText(line.split(':')[0].replace(/^- /, '')),
        meta: shadow,
        shadow,
        border: '1px solid rgba(0,0,0,0.05)',
      });
    }
  }

  const tableRows = parseMarkdownTableRows(content);
  for (const row of tableRows) {
    const [level = '', treatment = '', use = ''] = row;
    const title = cleanText(level).replace(/\s*\(.*?\)\s*/g, '').trim() || 'Level';
    const treatmentValue = cleanText(treatment);
    const useValue = cleanText(use);
    const lowerTreatment = treatmentValue.toLowerCase();
    const codeValues = [...treatment.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
    const shadowFromCode = normalizeShadowValue(codeValues.find((item) => looksLikeShadowValue(item)) || '');
    const borderFromCode = normalizeBorderValue(codeValues.find((item) => /(solid|dashed|dotted)/i.test(item)) || '');

    let shadow = '';
    let border = '1px solid rgba(0,0,0,0.05)';

    if (/flat/.test(lowerTreatment)) {
      shadow = 'none';
      border = '1px solid rgba(0,0,0,0.06)';
    } else if (/whisper|outline|border|solid|dashed|dotted/.test(lowerTreatment)) {
      border = borderFromCode || normalizeBorderValue(whisperBorderToken) || '1px solid rgba(0,0,0,0.1)';
      shadow = 'none';
    } else if (/4-layer|soft card/.test(lowerTreatment)) {
      shadow = shadowFromCode || normalizeShadowValue(cardShadowToken) || '0 8px 24px rgba(0,0,0,0.08)';
      border = normalizeBorderValue(whisperBorderToken) || '1px solid rgba(0,0,0,0.08)';
    } else if (/5-layer|deep/.test(lowerTreatment)) {
      shadow = shadowFromCode || normalizeShadowValue(deepShadowToken) || normalizeShadowValue(cardShadowToken) || '0 14px 36px rgba(0,0,0,0.1)';
      border = normalizeBorderValue(whisperBorderToken) || '1px solid rgba(0,0,0,0.08)';
    } else if (/focus/.test(lowerTreatment)) {
      border = borderFromCode || '2px solid #097fe8';
      shadow = '0 0 0 2px rgba(9,127,232,0.18)';
    } else {
      shadow = shadowFromCode || normalizeShadowValue(treatmentValue);
      if (!shadow) border = borderFromCode || border;
    }

    entries.push({
      title,
      meta: [treatmentValue, useValue].filter(Boolean).join(' | '),
      shadow: shadow || 'none',
      border,
    });
  }

  const baseBackground =
    colorItems.find((item) => /page background|页面背景|canvas/i.test(item.usage || ''))?.value ??
    colorItems.find((item) => item.name.toLowerCase().includes('white') || item.usage.toLowerCase().includes('background'))?.value ??
    '#ffffff';
  const light = textColorFor(baseBackground) === '#ffffff' ? '#191919' : '#ffffff';
  const tone = textColorFor(baseBackground) === '#ffffff' ? 'dark' : 'light';

  const deduped = entries.filter(
    (item, index) =>
      entries.findIndex((candidate) => candidate.title.toLowerCase() === item.title.toLowerCase()) === index,
  );

  return deduped.slice(0, 4).map((item, index) => ({
    title: item.title || `Level ${index + 1}`,
    meta: item.meta,
    tone,
    style: {
      background: light,
      boxShadow: item.shadow || 'none',
      border: item.border || '1px solid rgba(0,0,0,0.05)',
      color: textColorFor(light),
    },
  }));
}

function parseForms(componentSection, colors) {
  const sectionContent = componentSection?.content ?? '';
  const subsections = parseSubsections(sectionContent);
  const explicitFormsSection = subsections.find(
    (item) => item.title.toLowerCase().includes('input') || item.title.toLowerCase().includes('form') || item.title.toLowerCase().includes('search'),
  );
  let formsContent = explicitFormsSection?.content ?? '';
  let confidence = explicitFormsSection ? 'high' : 'low';
  if (!formsContent) {
    const fallbackLines = linesByKeywords(sectionContent, ['input', 'form', 'placeholder', 'label', 'search', 'textarea', 'select']);
    formsContent = fallbackLines.join(' ');
    if (fallbackLines.length) confidence = 'medium';
  }

  if (!formsContent) {
    return {
      summary: '该品牌文档未提供可复原的独立表单系统。',
      notes: ['未发现 input / form / search 专门章节，避免使用推断表单样式。'],
      confidence,
      fields: [],
    };
  }

  const formsLines = formsContent.split('\n');
  const buttonColor = colors.flatMap((group) => group.items).find((item) => item.usage.toLowerCase().includes('button') || item.usage.toLowerCase().includes('cta'))?.value ?? '#111111';
  const defaultBg = colors.flatMap((group) => group.items).find((item) => item.usage.toLowerCase().includes('surface') || item.name.toLowerCase().includes('white'))?.value ?? '#ffffff';
  const border = normalizeBorderFromHint(findLineValue(formsLines, ['border']), '1px solid rgba(0,0,0,0.12)');
  const radius = firstCssLength(findLineValue(formsLines, ['radius']), '12px');
  const focusHint = findLineValue(formsLines, ['focus', 'ring']);
  const focus = normalizeShadowValue(focusHint) || (extractFirstColorValue(focusHint) ? `0 0 0 2px ${extractFirstColorValue(focusHint)}` : `0 0 0 2px ${buttonColor}`);
  const summary = translateUiText(firstParagraph(formsContent) || bulletLines(formsContent).join(' '));
  const notes = bulletLines(formsContent).slice(0, 4).map(translateUiText);

  const fields = [];
  const hasConcreteFieldSignal = confidence === 'high' || hasKeywords(formsContent, ['input', 'form', 'search', 'placeholder', 'textarea', 'select']);
  const placeholderValue = normalizePlaceholderValue(findLineValue(formsLines, ['placeholder']));

  if (hasConcreteFieldSignal) {
    fields.push({
      label: '输入样式',
      type: 'input',
      fieldStyle: {
        background: defaultBg,
        border,
        borderRadius: radius,
        color: textColorFor(defaultBg),
        padding: '14px 16px',
      },
      placeholder: translateUiText(placeholderValue),
      note: '基于文档中的输入规范提取',
    });

    if (hasKeywords(formsContent, ['focus', 'ring', 'active'])) {
      fields.push({
        label: '聚焦态输入',
        type: 'input',
        fieldStyle: {
          background: defaultBg,
          border,
          borderRadius: radius,
          color: textColorFor(defaultBg),
          padding: '14px 16px',
          boxShadow: focus,
        },
        placeholder: translateUiText(placeholderValue),
        note: '基于文档 focus/ring 线索生成',
      });
    }

    const hasChipLike = hasKeywords(formsContent, ['chip', 'pill', 'filter', 'tag', 'badge']);
    const chipSeedLine =
      formsLines.find((line) => /chip|pill|filter|tag|badge/i.test(line)) ||
      bulletLines(formsContent).find((line) => /chip|pill|filter|tag|badge/i.test(line)) ||
      '';
    const chipLabels = extractBadgeLabels(chipSeedLine).slice(0, 4);
    if (hasChipLike) {
      if (chipLabels.length >= 2) {
        fields.push({
          label: '筛选项',
          type: 'chips',
          chips: chipLabels,
          note: '基于文档中的筛选控件线索提取',
        });
      }
    }
  }

  return {
    summary: summary || '该品牌文档未给出独立表单系统，页面以其它组件规范为主。',
    notes: notes.length ? notes : ['表单线索较弱，当前仅保留文本证据。'],
    confidence,
    fields,
  };
}

function parseGuidance(section) {
  const subsections = parseSubsections(section?.content ?? '');
  const doContent =
    subsections.find((item) => /\bdo\b/i.test(item.title) && !/don'?t|avoid|never/i.test(item.title))?.content ?? '';
  const dontContent =
    subsections.find((item) => /don'?t|avoid|never|禁止|不要/i.test(item.title))?.content ?? '';
  const fallbackBullets = bulletLines(section?.content ?? '').map(cleanText);
  const fallbackDo = fallbackBullets
    .filter((line) => /^do\s*:/i.test(line))
    .map((line) => cleanText(line.replace(/^do\s*:/i, '')))
    .filter(Boolean);
  const fallbackDont = fallbackBullets
    .filter((line) => /^don'?t\s*:/i.test(line))
    .map((line) => cleanText(line.replace(/^don'?t\s*:/i, '')))
    .filter(Boolean);

  return {
    do: (bulletLines(doContent).slice(0, 5).map(cleanText).length
      ? bulletLines(doContent).slice(0, 5).map(cleanText)
      : fallbackDo.slice(0, 5)),
    dont: (bulletLines(dontContent).slice(0, 5).map(cleanText).length
      ? bulletLines(dontContent).slice(0, 5).map(cleanText)
      : fallbackDont.slice(0, 5)),
  };
}

function parseVisual(section) {
  const summary = cleanText(firstParagraph(section?.content ?? '')) || '文档未明确给出品牌气质总结。';
  const bullets = bulletLines(section?.content ?? '').map(cleanText);
  return {
    kicker: themeKicker,
    mood: bullets.slice(0, 2).join(' · ') || '批量提炼',
    summary,
    anchors: bullets.slice(0, 4),
  };
}

function parseBrand(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const sections = parseSections(text);
  const name = getBrandName(text, filename);
  const visual = parseVisual(sectionByNumber(sections, 1));
  const colors = parseColorSection(sectionByNumber(sections, 2));
  const typography = parseTypography(sectionByNumber(sections, 3));
  const componentsSection = sectionByNumber(sections, 4);
  const componentData = parseButtonsAndCards(componentsSection, colors, typography);
  const layoutData = parseLayout(sectionByNumber(sections, 5), sectionByNumber(sections, 8));
  const spacingScale = parseSpacingScale(sectionByNumber(sections, 5));
  const radiusScale = parseRadiusScale(sectionByNumber(sections, 5));
  const elevationScale = parseElevation(sectionByNumber(sections, 6), colors);
  const forms = parseForms(componentsSection, colors);
  const guidance = parseGuidance(sectionByNumber(sections, 7));

  return {
    id: slugify(name),
    name,
    kicker: visual.kicker,
    mood: visual.mood,
    summary: visual.summary,
    anchors: visual.anchors,
    colors,
    typography,
    components: componentData.components,
    layout: layoutData.layout,
    layoutSpec: layoutData.layoutSpec,
    spacingScale: spacingScale.length ? spacingScale : [4, 8, 12, 16, 24, 32],
    radiusScale,
    elevationScale: elevationScale.length
      ? elevationScale
      : [
          {
            title: 'Flat',
            meta: 'No shadow',
            tone: 'light',
            style: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)', color: '#111111' },
          },
        ],
    forms,
    cardSpec: componentData.cardSpec,
    buttonSpec: componentData.buttonSpec,
    guidance: {
      do: guidance.do,
      dont: guidance.dont,
    },
    buttonPreview: componentData.buttonPreview,
    cardPreview: componentData.cardPreview,
  };
}

function main() {
  const files = readFiles(SOURCE_DIR);
  const brands = files.map((file) => parseBrand(path.join(SOURCE_DIR, file)));
  const output = `export const generatedBrands = ${JSON.stringify(brands, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${brands.length} brands into ${OUTPUT_FILE}`);
}

main();
