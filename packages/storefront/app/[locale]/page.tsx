import { getProducts, getCategories, getHomepage, resolvePageForLocale } from '@/lib/api';
import { getI18nConfig } from '@/lib/i18n-config';
import { HomeContent } from './home-content';
import { PageRenderer } from '@/components/page-builder/renderer';

export const dynamic = 'force-static';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  /** Главная Azerbaijan Parts по умолчанию. Page Builder: `NEXT_PUBLIC_USE_PAGE_BUILDER_HOME=true`. */
  const usePageBuilderHome = process.env.NEXT_PUBLIC_USE_PAGE_BUILDER_HOME === 'true';

  if (usePageBuilderHome) {
    try {
      const homepage = await getHomepage();
      if (homepage?.content) {
        const i18n = await getI18nConfig();
        const resolved = resolvePageForLocale(homepage, locale, i18n.defaultLocale);

        return (
          <main>
            <PageRenderer content={resolved.content} locale={locale} />
          </main>
        );
      }
    } catch {
      // API недоступен или главная не настроена — показываем витрину запчастей
    }
  }

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts({ limit: 8, sortBy: 'createdAt', sortDirection: 'desc' }),
      getCategories(),
    ]);
    products = productsRes.data;
    categories = categoriesRes;
  } catch {
    // API not available yet — демо-блоки на клиенте
  }

  return <HomeContent products={products} categories={categories} />;
}
