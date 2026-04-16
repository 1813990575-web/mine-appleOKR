import fs from 'node:fs';
import path from 'node:path';
import { generatedBrands } from '../src/generatedBrands.js';

const SOURCE_DIR = '/Users/aha/Desktop/design-md-library-remaining-renamed';
const REPORT_FILE = path.resolve('EXTRACTION_AUDIT.md');
const REPORT_JSON = path.resolve('audit/brand-audit.json');

function readSource(brandName) {
  const filePath = path.join(SOURCE_DIR, `${brandName} DESIGN.md`);
  if (!fs.existsSync(filePath)) {
    return { path: filePath, text: '' };
  }
  return { path: filePath, text: fs.readFileSync(filePath, 'utf8') };
}

function parseSections(text) {
  const matches = [...text.matchAll(/^##\s+(\d+)\.\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    return {
      index: Number(match[1]),
      title: match[2].trim(),
      content: text.slice(start, end).trim(),
    };
  });
}

function bySection(sections, index) {
  return sections.find((item) => item.index === index)?.content ?? '';
}

function hasKeywords(text, keywords) {
  const lower = (text || '').toLowerCase();
  return keywords.some((word) => lower.includes(word.toLowerCase()));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function hasPlaceholderText(value) {
  const text = String(value || '').toLowerCase();
  return [
    'default input',
    'focused input',
    'card spec',
    'button spec',
    'auto extracted layout',
    '后续补充',
    '自动生成',
    'placeholder',
  ].some((token) => text.includes(token));
}

function auditBrand(brand) {
  const source = readSource(brand.name);
  const sections = parseSections(source.text);
  const section3 = bySection(sections, 3);
  const section4 = bySection(sections, 4);
  const section5 = bySection(sections, 5);
  const section8 = bySection(sections, 8);

  const issues = [];
  const warnings = [];
  let score = 100;

  const sourceSignals = {
    hasTypographyTable: /\|.+Role.+\|/i.test(section3) || /\|.+Size.+\|/i.test(section3),
    hasButtonSection: hasKeywords(section4, ['buttons', 'button', 'cta']),
    hasCardSection: hasKeywords(section4, ['cards', 'card', 'container']),
    hasFormSection: hasKeywords(section4, ['inputs', 'input', 'forms', 'form', 'search']),
    hasLayoutSection: hasKeywords(section5, ['spacing', 'grid', 'radius', 'layout']),
    hasResponsiveSection: hasKeywords(section8, ['breakpoint', 'responsive', 'mobile', 'tablet', 'desktop']),
  };

  const typographySizes = (brand.typography || []).map((item) => Number(item?.style?.fontSize || 0)).filter(Boolean);
  const maxTypographySize = Math.max(0, ...typographySizes);
  if (maxTypographySize >= 160) {
    warnings.push('字体 token 含超大字号');
  } else if (maxTypographySize >= 96) {
    warnings.push('字体 token 含较大字号');
  }
  if ((brand.typography || []).length < 6) {
    issues.push('字体层级偏少');
    score -= 8;
  }

  const placeholderButton = (brand.buttonPreview || []).some((item) => {
    const title = String(item?.title || '').toLowerCase();
    const note = String(item?.note || '').toLowerCase();
    return title === 'primary' || hasPlaceholderText(title) || hasPlaceholderText(note) || /默认主动作/.test(note);
  });
  if (placeholderButton) {
    issues.push('按钮存在占位样式');
    score -= 14;
  }

  const weakButtonEvidence = (brand.buttonPreview || []).some((item) => {
    const title = String(item?.title || '').toLowerCase();
    return /^primary$|^secondary$|^button rule$/i.test(title);
  });
  if (weakButtonEvidence) {
    warnings.push('按钮标题仍偏泛化');
  }

  const placeholderCard =
    sourceSignals?.hasCardSection &&
    (hasKeywords(brand.cardSpec?.summary || '', ['文档未明确', '自动提炼']) ||
      (brand.cardSpec?.variants || []).some((item) => /^Variant\s+\d+$/i.test(String(item?.name || ''))) ||
      (brand.cardPreview || []).some((item) => hasPlaceholderText(item?.title)));
  if (placeholderCard) {
    issues.push('卡片信息含占位');
    score -= 12;
  }

  const layoutRows = (brand.layoutSpec?.rows || []).map((row) => String(row?.value || '').trim()).filter(Boolean);
  const rawMarkdownLeak = layoutRows.some((value) => value.includes('|') || value.includes('###'));
  if (rawMarkdownLeak) {
    issues.push('布局行仍含原始 Markdown 痕迹');
    score -= 8;
  }
  const unclearLayoutRows = layoutRows.filter((value) => hasKeywords(value, ['文档未明确', '未说明']));
  if (!layoutRows.length || unclearLayoutRows.length >= 2) {
    issues.push('布局规则证据不足');
    score -= 12;
  } else if (layoutRows.length && new Set(layoutRows).size <= 1) {
    issues.push('布局规则区分度低');
    score -= 8;
  }

  const formFields = brand.forms?.fields || [];
  const formSummary = brand.forms?.summary || '';
  const formNotes = brand.forms?.notes || [];
  const formConfidence = brand.forms?.confidence || 'low';
  if (sourceSignals.hasFormSection) {
    if (!formFields.length) {
      issues.push('表单解析缺失');
      score -= 10;
    } else if (hasKeywords(formSummary, ['未明确给出表单', '保守展示'])) {
      issues.push('表单为兜底提取');
      score -= 8;
    }
    if (formNotes.some((note) => hasKeywords(note, ['缺少表单专门章节', '未发现独立表单章节']))) {
      issues.push('表单证据不足');
      score -= 6;
    }
  } else {
    if (!formFields.length) {
      warnings.push('源文档未提供表单章节');
    } else if (formConfidence !== 'high') {
      issues.push('表单由弱证据生成');
      score -= 8;
    }
  }

  if (formFields.some((field) => hasPlaceholderText(field?.placeholder) || hasPlaceholderText(field?.label))) {
    issues.push('表单字段存在占位命名');
    score -= 10;
  }

  const guidanceSource = bySection(sections, 7);
  const hasGuidanceSignals = /(^|\n)\s*###\s*do\b|(^|\n)\s*###\s*don'?t\b|(^|\n)\s*-\s*do\s*:|(^|\n)\s*-\s*don'?t\s*:/im.test(
    guidanceSource,
  );
  if (hasGuidanceSignals && !(brand.guidance?.do || []).length && !(brand.guidance?.dont || []).length) {
    issues.push('规范边界提取缺失');
    score -= 8;
  }

  if (!sourceSignals.hasButtonSection) {
    issues.push('源文档按钮章节弱');
    score -= 4;
  }
  if (!sourceSignals.hasCardSection) {
    issues.push('源文档卡片章节弱');
    score -= 4;
  }
  if (!sourceSignals.hasLayoutSection) {
    issues.push('源文档布局章节弱');
    score -= 4;
  }

  score = clampScore(score);
  let level = 'A';
  if (score < 85) level = 'B';
  if (score < 70) level = 'C';
  if (score < 55) level = 'D';

  return {
    id: brand.id,
    name: brand.name,
    score,
    level,
    issues,
    warnings,
    sourcePath: source.path,
    sourceSignals,
    metrics: {
      typographyCount: (brand.typography || []).length,
      maxTypographySize,
      buttonCount: (brand.buttonPreview || []).length,
      cardCount: (brand.cardPreview || []).length,
      layoutModel: brand.layoutSpec?.model || 'unknown',
      formCount: (brand.forms?.fields || []).length,
    },
  };
}

function summarize(results) {
  const byLevel = results.reduce(
    (acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0 },
  );

  const topIssueMap = new Map();
  for (const item of results) {
    for (const issue of item.issues) {
      topIssueMap.set(issue, (topIssueMap.get(issue) || 0) + 1);
    }
  }
  const topIssues = [...topIssueMap.entries()].sort((a, b) => b[1] - a[1]);

  const warningMap = new Map();
  for (const item of results) {
    for (const warning of item.warnings || []) {
      warningMap.set(warning, (warningMap.get(warning) || 0) + 1);
    }
  }
  const topWarnings = [...warningMap.entries()].sort((a, b) => b[1] - a[1]);

  return { byLevel, topIssues, topWarnings };
}

function toMarkdown(results, summary) {
  const lines = [];
  lines.push('# Design MD 审计报告');
  lines.push('');
  lines.push(`- 审计时间: ${new Date().toISOString()}`);
  lines.push(`- 品牌总数: ${results.length}`);
  lines.push(`- 评级分布: A=${summary.byLevel.A}, B=${summary.byLevel.B}, C=${summary.byLevel.C}, D=${summary.byLevel.D}`);
  lines.push('');
  lines.push('## 审计口径');
  lines.push('');
  lines.push('- 证据完整度: 文档章节存在且提取后有可读规则');
  lines.push('- 占位拦截: 禁止默认字段名、模板标题、半成品文案直接进入展示层');
  lines.push('- 结构准确性: 布局/表单/卡片不得泄露原始 Markdown 表格痕迹');
  lines.push('- 弱证据策略: 证据不足时允许空态，不允许伪样例');
  lines.push('');
  lines.push('## 主要问题');
  lines.push('');
  if (!summary.topIssues.length) {
    lines.push('- 无');
  } else {
    for (const [issue, count] of summary.topIssues.slice(0, 10)) {
      lines.push(`- ${issue}: ${count}`);
    }
  }
  lines.push('');
  lines.push('## 风险提示');
  lines.push('');
  if (!summary.topWarnings.length) {
    lines.push('- 无');
  } else {
    for (const [warning, count] of summary.topWarnings.slice(0, 10)) {
      lines.push(`- ${warning}: ${count}`);
    }
  }
  lines.push('');
  lines.push('## 明细');
  lines.push('');
  lines.push('| 品牌 | 分数 | 等级 | 主要问题 |');
  lines.push('|---|---:|:---:|---|');
  for (const item of results) {
    const issueText = item.issues.length ? item.issues.join('；') : '通过';
    lines.push(`| ${item.name} | ${item.score} | ${item.level} | ${issueText} |`);
  }
  lines.push('');
  lines.push('## C/D 重点修复清单');
  lines.push('');
  const critical = results.filter((item) => item.level === 'C' || item.level === 'D');
  if (!critical.length) {
    lines.push('- 无');
  } else {
    for (const item of critical) {
      lines.push(`- **${item.name}**: ${item.issues.join('；')}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const results = generatedBrands.map(auditBrand).sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const summary = summarize(results);
  const markdown = toMarkdown(results, summary);

  fs.writeFileSync(REPORT_FILE, markdown);
  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify({ summary, results }, null, 2));

  console.log(`Audit report written: ${REPORT_FILE}`);
  console.log(`Audit JSON written: ${REPORT_JSON}`);
  console.log(`Level counts:`, summary.byLevel);
  console.log(`Top issues:`, summary.topIssues.slice(0, 8));
}

main();
