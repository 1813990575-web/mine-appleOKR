import { brandWebsites } from './brandWebsites';

export function getBrandPreviewSrc(brand) {
  if (!brand?.id) return '';
  return `/brand-previews/${brand.id}.jpg`;
}

export function getBrandPreviewFallbackLabel(brand) {
  if (!brand?.name) return '暂无截图';
  return `${brand.name} 官网截图暂不可用`;
}

export const totalBrandWebsiteCount = Object.keys(brandWebsites).length;
