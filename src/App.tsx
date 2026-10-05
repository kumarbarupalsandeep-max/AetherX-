/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExchangeProvider, useExchange } from './context/ExchangeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { MarketsPage } from './pages/MarketsPage';
import { TradingTerminalPage } from './pages/TradingTerminalPage';
import { BuyCryptoPage } from './pages/BuyCryptoPage';
import { ConvertPage } from './pages/ConvertPage';
import { P2PPage } from './pages/P2PPage';
import { WalletPage } from './pages/WalletPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { OrdersCenterPage } from './pages/OrdersCenterPage';
import { EarnPage } from './pages/EarnPage';
import { AirdropPage } from './pages/AirdropPage';
import { ReferralPage } from './pages/ReferralPage';
import { AccountHubPage } from './pages/AccountHubPage';
import {
  NotificationsPage,
  SupportPage,
  SitemapPage,
  PublicInfoPage,
} from './pages/SupportAndPublicPages';

const ExchangeRouter: React.FC = () => {
  const { route } = useExchange();

  const renderPage = () => {
    switch (route) {
      case '/':
        return <HomePage />;
      case '/markets':
        return <MarketsPage />;
      case '/trade/spot':
        return <TradingTerminalPage marketMode="Spot" />;
      case '/trade/futures':
        return <TradingTerminalPage marketMode="Futures" />;
      case '/buy-crypto':
        return <BuyCryptoPage />;
      case '/convert':
        return <ConvertPage />;
      case '/p2p':
        return <P2PPage />;
      case '/earn':
        return <EarnPage />;
      case '/airdrop':
        return <AirdropPage />;
      case '/referral':
        return <ReferralPage />;
      case '/wallet':
        return <WalletPage />;
      case '/deposit':
        return <DepositPage />;
      case '/withdraw':
        return <WithdrawPage />;
      case '/orders':
        return <OrdersCenterPage initialTab="open" />;
      case '/order-history':
        return <OrdersCenterPage initialTab="history" />;
      case '/trade-history':
        return <OrdersCenterPage initialTab="trades" />;
      case '/account':
        return <AccountHubPage section="account" />;
      case '/security':
        return <AccountHubPage section="security" />;
      case '/kyc':
        return <AccountHubPage section="kyc" />;
      case '/notifications':
        return <NotificationsPage />;
      case '/support':
        return <SupportPage />;
      case '/sitemap':
        return <SitemapPage />;
      case '/fees':
        return <PublicInfoPage pageType="fees" />;
      case '/proof-of-reserves':
        return <PublicInfoPage pageType="proof-of-reserves" />;
      case '/announcements':
        return <PublicInfoPage pageType="announcements" />;
      case '/api-docs':
        return <PublicInfoPage pageType="api-docs" />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <div className="flex-1 flex flex-col">{renderPage()}</div>
      <Footer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ExchangeProvider>
      <ExchangeRouter />
    </ExchangeProvider>
  );
}
