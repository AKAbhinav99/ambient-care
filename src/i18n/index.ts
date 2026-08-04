/** Public entry point for the i18n layer. */

export { I18nProvider, useT } from './I18nProvider';
export { catalogFor } from './catalogs';
export {
  LANGUAGES,
  DEFAULT_LANG,
  langMeta,
  defaultTtsFor,
  isRtl,
  isNonLatin,
  type LangCode,
  type Dir,
  type Script,
  type LanguageMeta,
} from './config';
export type { Messages } from './types';
