import React, { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { VIP_ITEMS, type VipItemId } from '../../core/empire/EmpireService';
import { googlePlayBillingAvailable, purchaseGooglePlayCosmetic } from '../../core/empire/GooglePlayBilling';
import { useGameStore } from '../../core/store/useGameStore';

const categories = ['Wallpaper', 'Flooring', 'Facade', 'Objects'] as const;

export const CosmeticStore: React.FC = () => {
  const [category, setCategory] = useState<(typeof categories)[number]>('Wallpaper');
  const [busy, setBusy] = useState<VipItemId | null>(null);
  const [message, setMessage] = useState('');
  const { empire, houseInterior, energyCans, buyVipItem, equipCosmetic, resetHouseFinish, grantVerifiedCosmetic } = useGameStore();
  const playAvailable = googlePlayBillingAvailable();

  const equipped = (id: VipItemId) =>
    id.startsWith('wall_') ? houseInterior.wallpaperStyle === id.slice(5) :
    id.startsWith('floor_') ? houseInterior.flooringStyle === id.slice(6) :
    id.startsWith('facade_') ? houseInterior.facadeStyle === id.slice(7) : false;

  const checkout = async (id: VipItemId) => {
    setBusy(id);
    setMessage('');
    try {
      if (await purchaseGooglePlayCosmetic(id)) {
        grantVerifiedCosmetic(id);
        equipCosmetic(id);
        setMessage('Purchase verified and cosmetic unlocked.');
      } else setMessage('Purchase was not verified. No cosmetic was granted.');
    } catch {
      setMessage('Google Play checkout did not complete. No cosmetic was granted.');
    } finally {
      setBusy(null);
    }
  };

  return <section className="rounded-2xl border border-pink-500/25 bg-pink-950/15 p-3">
    <div className="flex items-start gap-2"><Sparkles size={17} className="mt-0.5 text-pink-300" /><div><h3 className="text-sm font-black">Cosmetic Store</h3><p className="text-[10px] text-slate-400">Wallpaper, house design and vanity items · {energyCans} Energy Cans</p></div></div>
    <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Cosmetic categories">
      {categories.map(name => <button key={name} role="tab" aria-selected={category === name} onClick={() => setCategory(name)} className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${category === name ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{name}</button>)}
    </div>
    {category !== 'Objects' && <button onClick={() => resetHouseFinish(category)} className="mt-1 rounded-lg border border-slate-600 px-2 py-1 text-[10px] font-bold text-slate-300">Use free default {category.toLowerCase()}</button>}
    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {VIP_ITEMS.filter(item => item.category === category).map(item => {
        const owned = empire.vipInventory.includes(item.id);
        const active = equipped(item.id);
        return <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-2">
          <div className="flex items-center gap-1.5"><Palette size={13} className="text-pink-300" /><span className="text-[11px] font-black">{item.name}</span></div>
          <p className="mt-0.5 min-h-7 text-[9px] text-slate-400">{item.description}</p>
          {owned ? <button disabled={active || item.category === 'Objects'} onClick={() => equipCosmetic(item.id)} className="mt-1 w-full rounded-lg bg-cyan-600 py-1.5 text-[10px] font-black disabled:bg-slate-700">{active ? 'Equipped' : item.category === 'Objects' ? 'Owned' : 'Equip'}</button> : <div className="mt-1 flex gap-1">
            <button disabled={energyCans < item.cost} onClick={() => { if (buyVipItem(item.id)) { equipCosmetic(item.id); setMessage(`${item.name} unlocked.`); } }} className="flex-1 rounded-lg bg-pink-600 py-1.5 text-[10px] font-black disabled:bg-slate-700 disabled:text-slate-500">{item.cost} Cans</button>
            {playAvailable && <button disabled={busy !== null} onClick={() => checkout(item.id)} className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[10px] font-black disabled:bg-slate-700">{busy === item.id ? 'Opening…' : 'Google Play'}</button>}
          </div>}
        </div>;
      })}
    </div>
    {message && <p role="status" className="mt-2 text-[10px] text-pink-200">{message}</p>}
    <p className="mt-2 text-[9px] text-slate-500">Google Play checkout appears only in a supported Android app. Cosmetics do not affect team stats.</p>
  </section>;
};
