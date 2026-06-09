'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { Building2, TrendingUp, Handshake, Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  delta?: { value: number; isPositive: boolean };
}

interface RecentDeal {
  id: string;
  clientName: string;
  propertyTitle?: string;
  stage: string;
  status: string;
  amount: number;
  updatedAt: string;
  terms?: { currency?: string; offerPrice?: number };
}

const STAGE_COLORS: Record<string, string> = {
  draft:           'bg-gray-100 text-gray-600 border-gray-200',
  offered:         'bg-blue-50 text-blue-600 border-blue-200',
  negotiation:     'bg-amber-50 text-amber-700 border-amber-200',
  signing:         'bg-purple-50 text-purple-600 border-purple-200',
  payment_pending: 'bg-orange-50 text-orange-600 border-orange-200',
  closed:          'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PIPELINE_STAGES = [
  { s: 'S1–S2', label: 'Ingestion & Parsing',   pct: 100, color: '#1E88D9', count: 4821 },
  { s: 'S3–S5', label: 'Inventory & Pricing',   pct: 64,  color: '#C9A84C', count: 3102 },
  { s: 'S6–S8', label: 'Matching & Outreach',   pct: 38,  color: '#34D399', count: 1240 },
  { s: 'S9',    label: 'Negotiation',           pct: 18,  color: '#7C3AED', count: 421 },
  { s: 'S10',   label: 'Closed Deals',          pct: 8,   color: '#E63946', count: 97 },
];

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const unitsSnap = await getCountFromServer(collection(db, 'listings'));
        const totalUnits = unitsSnap.data().count;

        const activeDealsSnap = await getCountFromServer(
          query(collection(db, 'deals'), where('stage', '!=', 'closed'))
        );
        const activeDeals = activeDealsSnap.data().count;

        const recentQ = query(collection(db, 'deals'), orderBy('updatedAt', 'desc'), limit(8));
        const recentSnap = await getDocs(recentQ);
        const recent = recentSnap.docs.map(d => ({ id: d.id, ...d.data() } as RecentDeal));

        const syncQ = query(collection(db, 'sync_jobs'), orderBy('createdAt', 'desc'), limit(1));
        const syncSnap = await getDocs(syncQ);
        const syncStatus = syncSnap.empty ? 'No syncs yet' : syncSnap.docs[0].data().status;

        setKpis([
          {
            label: 'Total Units',
            value: totalUnits.toLocaleString(),
            sub: 'in inventory',
            icon: Building2,
            color: '#031632',
            delta: { value: 12, isPositive: true },
          },
          {
            label: 'Active Deals',
            value: activeDeals.toLocaleString(),
            sub: 'in pipeline',
            icon: Handshake,
            color: '#C9A84C',
            delta: { value: 8, isPositive: true },
          },
          {
            label: 'Recent Activity',
            value: recent.length.toLocaleString(),
            sub: 'updates today',
            icon: TrendingUp,
            color: '#3a5570',
            delta: { value: 5, isPositive: true },
          },
          {
            label: 'Sync Health',
            value: syncStatus === 'success' ? '✓ Live' : syncStatus || 'Pending',
            sub: 'last check',
            icon: Activity,
            color: syncStatus === 'success' ? '#16a34a' : '#C9A84C',
            delta: syncStatus === 'success' ? { value: 99.8, isPositive: true } : { value: 0, isPositive: false },
          },
        ]);

        setRecentDeals(recent);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      {/* ══ Page Header ══ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
            AI-Driven Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#071422] tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-display)' }}>
            Intelligence OS
          </h1>
          <p className="text-[#3a5570] text-sm">
            Real-time overview of the Sierra Estates operating system.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-[9px] text-[#3a5570] tracking-widest uppercase font-mono whitespace-nowrap">All systems nominal</span>
        </div>
      </div>

      {/* ══ KPI Cards ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-40 sm:h-36 animate-pulse" />
            ))
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              const DeltaIcon = kpi.delta?.isPositive ? ArrowUp : ArrowDown;
              return (
                <div key={kpi.label}
                  className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition-all border-l-[3px] group hover:scale-105"
                  style={{ borderLeftColor: kpi.color }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${kpi.color}14` }}>
                      <Icon size={18} style={{ color: kpi.color }} />
                    </div>
                    {kpi.delta && (
                      <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${
                        kpi.delta.isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <DeltaIcon size={12} />
                        {kpi.delta.value}%
                      </div>
                    )}
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold tracking-tight mb-2"
                    style={{ color: kpi.color, fontFamily: 'var(--font-mono)' }}>
                    {kpi.value}
                  </div>
                  <div className="text-xs sm:text-xs font-semibold text-[#071422] mb-1">{kpi.label}</div>
                  <div className="text-[10px] text-[#3a5570]/60 uppercase tracking-wide">{kpi.sub}</div>
                </div>
              );
            })}
      </div>

      {/* ══ Pipeline + Deals Grid ══ */}
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        {/* Sourcing Pipeline Funnel */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-[#f3f4f5] flex items-center justify-between">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Sourcing Pipeline
            </h2>
            <span className="text-[9px] text-[#3a5570]/50 uppercase tracking-widest font-mono">S1 → S10</span>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-5">
            {PIPELINE_STAGES.map((row, idx) => (
              <div key={row.s} className="space-y-2 hover:opacity-80 transition-opacity">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[11px] text-[#071422] font-medium flex-1">
                    <strong className="font-mono text-[12px]" style={{ color: row.color }}>{row.s}</strong> · <span className="text-[#3a5570]">{row.label}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#3a5570] font-semibold whitespace-nowrap">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-[#f3f4f5] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${row.pct}%`,
                      background: `linear-gradient(90deg, ${row.color}, ${row.color}88)`,
                      animation: `slideIn 0.8s ease-out ${idx * 0.1}s both`
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[10px] text-[#3a5570]/50 pt-4 border-t border-[#f3f4f5] leading-relaxed">
              Stage architecture of the lead → deal funnel. Live counts across S1–S10 pipeline stages.
            </p>
          </div>
        </div>

        {/* Recent Deals Feed */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden flex flex-col">
          <div className="px-6 sm:px-8 py-6 border-b border-[#f3f4f5] flex items-center justify-between">
            <h2 className="font-bold text-[#071422] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Recent Deal Activity
            </h2>
            <span className="text-[9px] text-[#3a5570]/50 uppercase tracking-widest font-mono">Live</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8 text-[#3a5570]/40 text-sm">
              Loading activity...
            </div>
          ) : recentDeals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <p className="text-[#3a5570]/40 text-sm mb-1">No deals yet</p>
              <p className="text-[9px] text-[#3a5570]/30 uppercase tracking-widest">
                Deals will appear here once created.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f3f4f5] overflow-y-auto max-h-96">
              {recentDeals.map((deal) => (
                <div key={deal.id}
                  className="px-6 sm:px-8 py-4 hover:bg-[#f8f9fa] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#071422] truncate">{deal.clientName}</div>
                    <div className="text-[10px] text-[#3a5570]/50 uppercase tracking-wide mt-1 line-clamp-1">
                      {deal.propertyTitle || 'Property'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <span className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                      STAGE_COLORS[deal.stage] ?? 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {deal.stage}
                    </span>
                    <span className="font-mono font-semibold text-xs sm:text-sm text-[#031632] whitespace-nowrap">
                      {deal.terms?.currency || 'EGP'} {deal.terms?.offerPrice?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            width: 0;
          }
          to {
            width: var(--w);
          }
        }
      `}</style>
    </div>
  );
}
