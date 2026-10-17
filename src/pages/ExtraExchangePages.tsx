import React, { useMemo, useState } from 'react';
import { Activity, ArrowDownLeft, ArrowUpRight, Plus, Search, ShieldCheck, Smartphone, Trash2, Clock3, CircleAlert } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

const PageShell: React.FC<{ eyebrow: string; title: string; description: string; children: React.ReactNode }> = ({ eyebrow, title, description, children }) => (
  <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-b border-[var(--border-color)] pb-5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E68FF]">{eyebrow}</div>
        <h1 className="mt-2 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </div>
  </main>
);

const Panel: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] px-5 py-4">
      <h2 className="text-sm font-bold">{title}</h2>{action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const EmptyState: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="flex flex-col items-center py-12 text-center">
    <div className="mb-3 rounded-full bg-[var(--bg-hover)] p-4"><Activity className="h-6 w-6 text-[var(--text-muted)]" /></div>
    <div className="text-sm font-bold">{title}</div><p className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
  </div>
);

export const FuturesPositionsPage: React.FC = () => {
  const { orders, trades, navigate } = useExchange();
  const [tab, setTab] = useState<'Positions' | 'Open Orders' | 'History'>('Positions');
  const futuresOrders = orders.filter(o => o.marketType === 'Futures');
  const futuresTrades = trades.filter(t => futuresOrders.some(o => o.id === t.orderId));
  return <PageShell eyebrow="Derivatives" title="Futures Positions" description="Review your futures exposure, open orders and execution history. This page displays records available in your AetherX account; it does not create or simulate positions.">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{label:'Open positions',value:'—'},{label:'Margin balance',value:'—'},{label:'Unrealized PnL',value:'—'}].map(x=><div key={x.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"><div className="text-xs text-[var(--text-muted)]">{x.label}</div><div className="mt-2 text-2xl font-bold">{x.value}</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">Not provided by current API</div></div>)}</div>
    <Panel title="Futures activity" action={<button onClick={()=>navigate('/trade/futures')} className="rounded-lg bg-[#2E68FF] px-3 py-2 text-xs font-bold text-white">Open Futures Terminal</button>}>
      <div className="mb-5 flex gap-2">{(['Positions','Open Orders','History'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab===t?'bg-[#2E68FF] text-white':'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>{t}</button>)}</div>
      {tab==='Positions' ? <EmptyState title="Position endpoint not available" detail="No dedicated futures-positions API is currently connected. Position size, entry price, liquidation price, margin and PnL are intentionally not fabricated."/> : tab==='Open Orders' ? (futuresOrders.filter(o=>o.status==='Open'||o.status==='Partially Filled').length ? <div className="space-y-3">{futuresOrders.filter(o=>o.status==='Open'||o.status==='Partially Filled').map(o=><div key={o.id} className="flex flex-wrap justify-between gap-3 border-b border-[var(--border-color)] pb-3 text-sm"><div><b>{o.pair}</b><div className="text-xs text-[var(--text-muted)]">{o.type} · {o.side}</div></div><div className="text-right"><b>{o.amount}</b><div className="text-xs text-[var(--text-muted)]">Price {o.price}</div></div></div>)}</div> : <EmptyState title="No open futures orders" detail="There are no open futures orders in the current account data."/>) : (futuresTrades.length ? <div className="space-y-3">{futuresTrades.map(t=><div key={t.id} className="flex justify-between border-b border-[var(--border-color)] pb-3 text-sm"><span>{t.pair} · {t.side}</span><span className="font-mono-num">{t.amount} @ {t.price}</span></div>)}</div> : <EmptyState title="No futures trade history" detail="Futures executions will appear here when supported by the account API."/>)}
    </Panel>
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-5 text-[var(--text-secondary)]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"/><span>Risk notice: live futures positions, liquidation and funding calculations must be supplied by a verified trading backend before this screen is used for real funds.</span></div>
  </PageShell>;
};

export const ApiKeyManagementPage: React.FC = () => {
  const [showForm,setShowForm] = useState(false);
  const [label,setLabel] = useState('');
  const [readOnly,setReadOnly] = useState(true);
  const [keys,setKeys] = useState<{id:string;label:string;created:string;readOnly:boolean}[]>([]);
  const [search,setSearch] = useState('');
  const filtered = useMemo(()=>keys.filter(k=>k.label.toLowerCase().includes(search.toLowerCase())),[keys,search]);
  const { pushToast } = useExchange();
  const create = (e:React.FormEvent) => { e.preventDefault(); if(!label.trim()) return; setKeys(prev=>[...prev,{id:`local-${Date.now()}`,label:label.trim(),created:new Date().toLocaleDateString(),readOnly}]); setLabel('');setShowForm(false);pushToast({type:'info',title:'Local preview entry added',description:'This is only a browser-session UI preview. No API credential was issued or saved to a server.'}); };
  return <PageShell eyebrow="Developer tools" title="API Key Management" description="Manage the API key inventory interface. Key creation is disabled at the server level; entries added here are temporary UI previews only.">
    <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
      <Panel title="API access safety"><div className="flex gap-3"><ShieldCheck className="h-6 w-6 text-[#0ECB81]"/><div><div className="text-sm font-bold">Protect your account</div><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Use least-privilege permissions, restrict trusted IPs and never share secret keys. A production key service must generate secrets server-side and show them only once.</p></div></div><div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-[var(--text-secondary)]">API credentials are not connected to a backend yet. Do not paste real secrets into this page.</div></Panel>
      <Panel title="Key inventory" action={<button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1 rounded-lg bg-[#2E68FF] px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5"/> Add preview</button>}>
        <div className="relative mb-3"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search key labels" className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] py-2 pl-9 pr-3 text-xs outline-none"/></div>
        {showForm&&<form onSubmit={create} className="mb-4 space-y-3 rounded-lg border border-[var(--border-color)] p-3"><input value={label} onChange={e=>setLabel(e.target.value)} required maxLength={40} placeholder="Key label (e.g. Read-only dashboard)" className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-2.5 text-xs outline-none"/><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={readOnly} onChange={e=>setReadOnly(e.target.checked)}/> Read-only permissions</label><button className="rounded-lg bg-[#2E68FF] px-3 py-2 text-xs font-bold text-white">Add preview entry</button></form>}
        {filtered.length ? <div className="space-y-3">{filtered.map(k=><div key={k.id} className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3"><div className="min-w-0"><div className="truncate text-sm font-semibold">{k.label}</div><div className="mt-1 text-[10px] text-[var(--text-muted)]">{k.created} · {k.readOnly?'Read only':'Trading permission requested'} · Preview only</div></div><button aria-label="Remove preview key" onClick={()=>setKeys(prev=>prev.filter(x=>x.id!==k.id))} className="rounded-md p-2 text-[var(--text-muted)] hover:text-red-500"><Trash2 className="h-4 w-4"/></button></div>)}</div>:<EmptyState title="No API key entries" detail="No keys are issued by the current backend. Add a preview entry to review the interface only."/>}
      </Panel>
    </div>
  </PageShell>;
};

export const LoginActivityPage: React.FC = () => {
  const { pushToast } = useExchange();
  return <PageShell eyebrow="Account protection" title="Login & Device Activity" description="A dedicated place to review account sessions and security events. Current backend does not expose a trusted session-history endpoint.">
    <Panel title="Security overview"><div className="grid gap-3 sm:grid-cols-3">{[{label:'Current session',value:'Active browser'},{label:'Recent sign-ins',value:'Unavailable'},{label:'Unknown devices',value:'Unavailable'}].map(x=><div key={x.label} className="rounded-xl border border-[var(--border-color)] p-4"><div className="text-xs text-[var(--text-muted)]">{x.label}</div><div className="mt-2 text-sm font-bold">{x.value}</div></div>)}</div><div className="mt-5 flex gap-3 rounded-xl border border-[var(--border-color)] p-4"><Smartphone className="h-5 w-5 text-[#2E68FF]"/><div><div className="text-sm font-bold">Session history unavailable</div><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">For accurate IP, device, location and timestamp data, the server must record successful and failed authentication events. This page will not invent login records.</p></div></div><button onClick={()=>pushToast({type:'info',title:'Session controls not connected',description:'A secure server-side session revocation endpoint is required before devices can be signed out here.'})} className="mt-4 rounded-lg border border-[var(--border-color)] px-4 py-2.5 text-xs font-bold">Review session controls</button></Panel>
  </PageShell>;
};

export const TransactionHistoryPage: React.FC = () => {
  const { balances, navigate } = useExchange();
  const [kind,setKind] = useState('All');
  const [query,setQuery] = useState('');
  const rows = useMemo(()=>balances.flatMap(b=>[{id:`asset-${b.asset}`,asset:b.asset,kind:'Balance snapshot',status:'Current balance',amount:b.available,network:'Account ledger'}]).filter(r=>(kind==='All'||r.kind===kind)&&r.asset.toLowerCase().includes(query.toLowerCase())),[balances,kind,query]);
  return <PageShell eyebrow="Wallet records" title="Transaction History" description="A unified view for deposits, withdrawals and ledger movements. The current API provides balances but not a complete transaction ledger, so only available account snapshots are shown.">
    <Panel title="Wallet activity" action={<div className="flex gap-2"><button onClick={()=>navigate('/deposit')} className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-bold"><ArrowDownLeft className="mr-1 inline h-3.5 w-3.5"/>Deposit</button><button onClick={()=>navigate('/withdraw')} className="rounded-lg bg-[#2E68FF] px-3 py-2 text-xs font-bold text-white"><ArrowUpRight className="mr-1 inline h-3.5 w-3.5"/>Withdraw</button></div>}>
      <div className="mb-4 flex flex-wrap gap-2"><select value={kind} onChange={e=>setKind(e.target.value)} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs"><option>All</option><option>Balance snapshot</option></select><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter asset symbol" className="min-w-0 flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs outline-none"/></div>
      {rows.length?<div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs"><thead className="text-[var(--text-muted)]"><tr><th className="pb-3">Record</th><th className="pb-3">Asset</th><th className="pb-3">Amount</th><th className="pb-3">Source</th><th className="pb-3">Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-[var(--border-color)]"><td className="py-3">{r.kind}</td><td className="py-3 font-bold">{r.asset}</td><td className="py-3 font-mono-num">{r.amount}</td><td className="py-3">{r.network}</td><td className="py-3">{r.status}</td></tr>)}</tbody></table></div>:<EmptyState title="No records available" detail="No matching wallet balances were returned by the account API."/>}
      <p className="mt-4 text-[10px] leading-5 text-[var(--text-muted)]">This is not a deposit/withdrawal receipt list. Transaction IDs, confirmations, fees and blockchain status require a verified transaction-history API.</p>
    </Panel>
  </PageShell>;
};

export const P2POrdersPage: React.FC = () => {
  const { navigate } = useExchange();
  const [filter,setFilter] = useState('All');
  return <PageShell eyebrow="Peer-to-peer" title="My P2P Orders" description="Dedicated order tracking for peer-to-peer trades. No server-backed P2P order/escrow API is currently connected, so no fake orders are shown.">
    <Panel title="Order records" action={<button onClick={()=>navigate('/p2p')} className="rounded-lg bg-[#2E68FF] px-3 py-2 text-xs font-bold text-white">Browse P2P market</button>}>
      <div className="mb-4 flex gap-2">{['All','Pending','Completed','Cancelled','Appeals'].map(t=><button key={t} onClick={()=>setFilter(t)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter===t?'bg-[#2E68FF] text-white':'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>{t}</button>)}</div>
      <EmptyState title={filter==='All'?'No P2P orders returned':'No '+filter.toLowerCase()+' P2P orders'} detail="Order IDs, payment deadlines, merchant chat, escrow status, release confirmation and dispute actions must come from a trusted P2P backend."/>
    </Panel>
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-5 text-[var(--text-secondary)]"><Clock3 className="mr-2 inline h-4 w-4 text-amber-500"/>Do not send fiat payments based only on this preview UI. A verified escrow and dispute workflow is required for real P2P trading.</div>
  </PageShell>;
};
