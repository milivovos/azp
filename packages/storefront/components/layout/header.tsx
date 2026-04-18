'use client';

import { useState, useCallback } from 'react';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslation, useLocale, useDefaultLocale } from '@forkcart/i18n/react';
import { LocaleLink } from '@/components/locale-link';
import { StorefrontLanguageSwitcher } from '@/components/i18n/language-switcher';
import { CurrencySwitcher } from '@/components/currency/currency-switcher';
import { usePluginNavPages } from '@/hooks/use-plugin-nav-pages';
import { UniversalSearchBar } from '@/components/parts/universal-search-bar';
import { VehicleHeaderChip } from '@/components/parts/vehicle-header-chip';
import { SITE_BRAND } from '@/lib/site-brand';
import { localePath } from '@/lib/navigation';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, setCartOpen } = useCart();
  const { customer } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const defaultLocale = useDefaultLocale();
  const pluginNavPages = usePluginNavPages();

  const onSearchSelect = useCallback(
    (hit: { label: string }) => {
      const path = localePath(
        `/products?search=${encodeURIComponent(hit.label)}`,
        locale,
        defaultLocale,
      );
      router.push(path);
    },
    [router, locale, defaultLocale],
  );

  const scrollToGarage = useCallback(() => {
    document.getElementById('vehicle-garage')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <header className="sticky top-0 z-header border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="container-page">
        <div className="flex flex-col gap-3 py-3 md:py-0">
          <div className="flex h-14 items-center justify-between gap-3 md:h-16">
            <LocaleLink href="/" className="flex shrink-0 items-center gap-2">
              <img src="/logo.png" alt="" className="hidden h-10 w-auto sm:block md:h-11" />
              <span className="flex flex-col leading-tight">
                <span className="text-base font-bold tracking-tight text-gray-900 md:text-lg">
                  {SITE_BRAND.shortName}
                </span>
                <span className="hidden text-[10px] font-medium uppercase tracking-wider text-primary sm:block">
                  {SITE_BRAND.fullName}
                </span>
              </span>
            </LocaleLink>

            <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
              <UniversalSearchBar
                className="max-w-xl flex-1"
                placeholder={t('nav.searchPlaceholder')}
                onSelect={onSearchSelect}
              />
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <VehicleHeaderChip onChangeClick={scrollToGarage} />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <CurrencySwitcher className="hidden rounded-md border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 lg:block" />
              <StorefrontLanguageSwitcher className="hidden rounded-md border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 lg:block" />

              <LocaleLink
                href={customer ? '/account' : '/account/login'}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-600 hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
              </LocaleLink>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-600 hover:bg-gray-50"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 md:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <UniversalSearchBar
              placeholder={t('nav.searchPlaceholder')}
              onSelect={onSearchSelect}
            />
            <VehicleHeaderChip className="mt-2 w-full" onChangeClick={scrollToGarage} />
          </div>

          <nav className="hidden items-center gap-6 border-t border-gray-100 pt-2 md:flex md:border-0 md:pt-0">
            <LocaleLink
              href="/"
              className="text-sm font-medium text-gray-600 transition duration-fast ease-motion-fast hover:text-primary"
            >
              {t('nav.home')}
            </LocaleLink>
            <LocaleLink
              href="/products"
              className="text-sm font-medium text-gray-600 transition duration-fast ease-motion-fast hover:text-primary"
            >
              {t('nav.shop')}
            </LocaleLink>
            <LocaleLink
              href="/auto-parts"
              className="text-sm font-medium text-gray-600 transition duration-fast ease-motion-fast hover:text-primary"
            >
              🚗 Автозапчасти
            </LocaleLink>
            {pluginNavPages.map((page) => (
              <LocaleLink
                key={page.path}
                href={`/ext${page.path}`}
                className="text-sm font-medium text-gray-600 transition duration-fast ease-motion-fast hover:text-primary"
              >
                {page.navLabel || page.title}
              </LocaleLink>
            ))}
          </nav>
        </div>

        {mobileOpen && (
          <nav className="border-t border-gray-100 pb-4 pt-2 md:hidden">
            <LocaleLink
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block min-h-[44px] py-3 text-sm font-medium text-gray-700"
            >
              {t('nav.home')}
            </LocaleLink>
            <LocaleLink
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block min-h-[44px] py-3 text-sm font-medium text-gray-700"
            >
              {t('nav.shop')}
            </LocaleLink>
            {pluginNavPages.map((page) => (
              <LocaleLink
                key={page.path}
                href={`/ext${page.path}`}
                onClick={() => setMobileOpen(false)}
                className="block min-h-[44px] py-3 text-sm font-medium text-gray-700"
              >
                {page.navLabel || page.title}
              </LocaleLink>
            ))}
            <div className="flex gap-2 pt-2">
              <CurrencySwitcher className="flex-1 rounded-md border border-gray-200 bg-transparent px-2 py-2 text-sm text-gray-600" />
              <StorefrontLanguageSwitcher className="flex-1 rounded-md border border-gray-200 bg-transparent px-2 py-2 text-sm text-gray-600" />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
