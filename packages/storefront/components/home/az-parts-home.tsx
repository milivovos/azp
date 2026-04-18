'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Car, GitCompareArrows, ScanBarcode } from 'lucide-react';
import { useTranslation, useDefaultLocale, useLocale } from '@forkcart/i18n/react';
import { LocaleLink } from '@/components/locale-link';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { SITE_BRAND } from '@/lib/site-brand';
import { DEMO_CROSS_ROWS, DEMO_SHOWCASE_PARTS, DEMO_SUPPLIERS } from '@/lib/parts-demo-data';
import { productToPart, type ProductWithImages } from '@/lib/product-to-part';
import { UniversalSearchBar } from '@/components/parts/universal-search-bar';
import { VehicleSelector } from '@/components/parts/vehicle-selector';
import { VinDecoderInput } from '@/components/parts/vin-decoder-input';
import { PartCard } from '@/components/parts/part-card';
import { CategoryNavTree } from '@/components/parts/category-nav-tree';
import { FacetedFilterPanel } from '@/components/parts/faceted-filter-panel';
import { CrossReferencesBlock } from '@/components/parts/cross-references-block';
import { SupplierComparisonTable } from '@/components/parts/supplier-comparison-table';
import { useRouter } from 'next/navigation';
import { localePath } from '@/lib/navigation';

interface AzPartsHomeProps {
  products: ProductWithImages[];
  categories: any[];
}

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export function AzPartsHome({ products, categories }: AzPartsHomeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const defaultLocale = useDefaultLocale();

  const fromApi = products.slice(0, 4).map(productToPart);
  const showcaseParts = fromApi.length >= 4 ? fromApi : DEMO_SHOWCASE_PARTS;

  const featureCards = [
    {
      icon: ScanBarcode,
      title: 'VIN и артикул',
      text: 'Маска VIN по ISO 3779 и мгновенный поиск по каталогу — меньше ошибок при заказе.',
      href: '/products',
    },
    {
      icon: Car,
      title: 'Ваше авто в шапке',
      text: 'Выберите марку, модель и мотор — сохраняем в гараж и подстраиваем выдачу.',
      href: '#vehicle-garage',
    },
    {
      icon: GitCompareArrows,
      title: 'Аналоги и кроссы',
      text: 'Таблица с релевантностью: цена, срок, рейтинг. Полная совместимость подсвечена.',
      href: '/products',
    },
    {
      icon: BarChart3,
      title: 'Поставщики',
      text: 'Сравнение предложений: лучшая цена и срок доставки по Баку и регионам.',
      href: '/products',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-primary-light/40 to-white">
        <div className="container-page py-16 lg:py-24">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {SITE_BRAND.fullName}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Запчасти с подбором <span className="text-primary">по авто и VIN</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{SITE_BRAND.tagline}</p>
            <div className="mx-auto mt-8 max-w-xl text-left">
              <UniversalSearchBar
                placeholder="Артикул, модель, VIN…"
                onSelect={(hit) => {
                  const path = localePath(
                    `/products?search=${encodeURIComponent(hit.label)}`,
                    locale,
                    defaultLocale,
                  );
                  router.push(path);
                }}
              />
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LocaleLink href="/products">
                <Button size="lg" className="gap-2">
                  В каталог
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </LocaleLink>
              <LocaleLink href="#vehicle-garage">
                <Button size="lg" variant="secondary">
                  Настроить авто
                </Button>
              </LocaleLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 карточки — ключевой флоу */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-gray-900">Как мы ускоряем подбор</h2>
        <p className="mt-2 max-w-2xl text-gray-600">
          Четыре опоры витрины: от VIN до сравнения поставщиков — в одном спокойном интерфейсе без
          «маркетплейсного» шума.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05, ease: 'easeOut' as const }}
            >
              <LocaleLink
                href={card.href}
                className="group flex h-full flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-base ease-motion-base hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <card.icon className="h-10 w-10 text-primary transition-transform duration-base group-hover:scale-105" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm text-gray-600">{card.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Подробнее <ArrowRight className="h-3 w-3" />
                </span>
              </LocaleLink>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Гараж + VIN */}
      <section id="vehicle-garage" className="border-y border-gray-100 bg-gray-50/80">
        <div className="container-page py-16">
          <h2 className="text-2xl font-bold text-gray-900">Гараж и VIN</h2>
          <p className="mt-2 text-gray-600">
            Сохраняем авто в cookie и в интерфейсе — дальше каталог и поиск работают в контексте
            вашей машины.
          </p>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <VehicleSelector
              onComplete={() => {
                document.getElementById('parts-showcase')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Декодер VIN</h3>
              <p className="mt-1 text-sm text-gray-500">
                Формат XXXX-XXXX-XXXX-XXXXX, проверка контрольного символа.
              </p>
              <div className="mt-6">
                <VinDecoderInput />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Категории из API + дерево и фильтры (UI) */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.shopByCategory')}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((cat: any) => (
              <LocaleLink
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:border-primary/25 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{cat.description}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {t('home.browse')} <ArrowRight className="h-3 w-3" />
                </span>
              </LocaleLink>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold text-gray-900">Категории и фильтры</h2>
        <p className="mt-2 text-gray-600">
          Дерево с подсветкой поиска и фасеты с синхронизацией в URL — без перезагрузки страницы.
        </p>
        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          <CategoryNavTree
            className="lg:sticky lg:top-24"
            onSelect={() => router.push(localePath('/products', locale, defaultLocale))}
          />
          <div className="min-w-0 flex-1 space-y-6">
            <FacetedFilterPanel />
            <p className="text-xs text-gray-500">
              На мобильном фильтры открываются нижним листом — удобно большим пальцем (от 44px).
            </p>
          </div>
        </div>
      </section>

      {/* Витрина PartCard */}
      <section id="parts-showcase" className="border-t border-gray-100 bg-gray-50/50">
        <div className="container-page py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Витрина запчастей</h2>
              <p className="mt-2 text-gray-600">
                Карточки в стиле премиального каталога; с бэкендом подставляются реальные товары.
              </p>
            </div>
            <LocaleLink
              href="/products"
              className="text-sm font-medium text-primary hover:underline"
            >
              Весь каталог
            </LocaleLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {showcaseParts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                onAddToCart={async () => {
                  await new Promise((r) => setTimeout(r, 350));
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Аналоги + поставщики */}
      <section className="container-page py-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Аналоги и поставщики (демо)</h2>
        <div className="space-y-10">
          <CrossReferencesBlock rows={DEMO_CROSS_ROWS} />
          <SupplierComparisonTable offers={DEMO_SUPPLIERS} currency="AZN" />
        </div>
      </section>

      {/* Каталог из API */}
      <section className="container-page py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
          <LocaleLink href="/products" className="text-sm font-medium text-primary hover:underline">
            {t('home.viewAll')}
          </LocaleLink>
        </div>
        {products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
            {t('home.noProducts')} — подключите API, чтобы увидеть живой каталог.
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-primary-light/50">
        <div className="container-page py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Готовы к запуску с вашим бэкендом</h2>
          <p className="mx-auto mt-3 max-w-lg text-gray-600">
            Наш каталог запчастей: товары, категории и поиск — всё связано с единым API.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LocaleLink href="/products">
              <Button size="lg">Смотреть каталог</Button>
            </LocaleLink>
            <LocaleLink href="/p/contact">
              <Button size="lg" variant="secondary">
                Связаться
              </Button>
            </LocaleLink>
          </div>
        </div>
      </section>
    </div>
  );
}
