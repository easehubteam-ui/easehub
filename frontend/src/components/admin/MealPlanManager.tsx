import React, { useEffect, useState } from 'react';
import { MealServicePlan, serviceExperienceApi } from '../../services/serviceExperienceApi';
import { CheckCircle2, Plus, RefreshCw, Save } from 'lucide-react';

interface MealPlanDraft {
  code: string;
  name: string;
  category: MealServicePlan['category'];
  billing_period: MealServicePlan['billing_period'];
  price: string;
  description: string;
  meals_included: string;
  features: string;
  is_active: boolean;
  is_available: boolean;
  availability_note: string;
  sort_order: string;
}

const emptyDraft = (): MealPlanDraft => ({
  code: '', name: '', category: 'veg', billing_period: 'monthly', price: '', description: '',
  meals_included: '', features: '', is_active: true, is_available: true, availability_note: '', sort_order: '100',
});
const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const toDraft = (plan: MealServicePlan): MealPlanDraft => ({
  code: plan.code, name: plan.name, category: plan.category, billing_period: plan.billing_period,
  price: String(plan.price), description: plan.description, meals_included: plan.meals_included.join(', '),
  features: plan.features.join(', '), is_active: plan.is_active, is_available: plan.is_available,
  availability_note: plan.availability_note, sort_order: String(plan.sort_order),
});

export const MealPlanManager: React.FC = () => {
  const [plans, setPlans] = useState<MealServicePlan[]>([]);
  const [draft, setDraft] = useState<MealPlanDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setPlans(await serviceExperienceApi.getMealPlans());
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Meal plan records could not be loaded.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); }, []);

  const save = async () => {
    const price = Number(draft.price);
    if (!draft.name.trim() || !Number.isFinite(price) || price < 0) {
      setError('Enter a plan name and a valid non-negative price.');
      return;
    }
    const code = (draft.code.trim() || draft.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')).replace(/^-|-$/g, '');
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const values = {
        code, name: draft.name.trim(), category: draft.category, billing_period: draft.billing_period,
        price, description: draft.description.trim(), meals_included: splitList(draft.meals_included),
        features: splitList(draft.features), is_active: draft.is_active, is_available: draft.is_available,
        availability_note: draft.availability_note.trim(), sort_order: Number(draft.sort_order) || 0,
      };
      if (editingId) await serviceExperienceApi.updateMealPlan(editingId, values);
      else await serviceExperienceApi.createMealPlan(values);
      await refresh();
      setDraft(emptyDraft());
      setEditingId(null);
      setMessage('Meal plan saved to InsForge.');
    } catch (err: any) {
      setError(err?.message || 'Meal plan was not saved.');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof MealPlanDraft>(key: K, value: MealPlanDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <section aria-labelledby="meal-plans-admin-title" className="mb-6 rounded-3xl border border-[#E5E1D6] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#225944]">New customer experience</p>
          <h2 id="meal-plans-admin-title" className="mt-1 text-xl font-black text-[#171A18]">Meal plans &amp; pricing</h2>
          <p className="mt-1 text-xs text-[#6B6B63]">Plan records are shared with the customer Meals catalog. Disable to hide without deleting.</p>
        </div>
        <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft()); }} className="inline-flex items-center gap-2 rounded-xl bg-[#225944] px-4 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" />New plan</button>
      </div>

      {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{error}</div>}
      {message && <p role="status" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</p>}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-2">
          {loading ? <p role="status" className="text-sm text-[#6B6B63]">Loading saved meal plans…</p> : plans.length === 0 ? <p className="rounded-xl bg-[#F7F5EF] p-4 text-sm text-[#6B6B63]">No meal plan records exist yet.</p> : plans.map((plan) => (
            <article key={plan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E1D6] p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{plan.name}</h3><span className="rounded-full bg-[#F7F5EF] px-2 py-0.5 text-[10px] font-bold uppercase">{plan.category.replace('_', '-')} · {plan.billing_period}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${plan.is_active && plan.is_available ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{plan.is_active && plan.is_available ? 'Visible' : 'Hidden'}</span></div>
                <p className="mt-1 text-sm font-bold text-[#225944]">₹{Number(plan.price).toLocaleString('en-IN')} / {plan.billing_period === 'daily' ? 'day' : 'month'}</p>
                <p className="mt-1 truncate text-xs text-[#6B6B63]">{plan.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setEditingId(plan.id); setDraft(toDraft(plan)); }} className="rounded-lg border border-[#E5E1D6] px-3 py-2 text-xs font-bold">Edit</button>
                <button type="button" disabled={saving} onClick={async () => { try { await serviceExperienceApi.updateMealPlan(plan.id, { is_active: !plan.is_active }); await refresh(); } catch (err: any) { setError(err?.message || 'Visibility update failed.'); } }} className="rounded-lg bg-[#F7F5EF] px-3 py-2 text-xs font-bold">{plan.is_active ? 'Disable' : 'Enable'}</button>
              </div>
            </article>
          ))}
          <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-1 pt-2 text-xs font-bold text-[#225944]"><RefreshCw className="h-3.5 w-3.5" />Refresh from database</button>
        </div>

        <div className="rounded-2xl bg-[#F7F5EF] p-4">
          <h3 className="font-extrabold">{editingId ? 'Edit plan' : 'Create plan'}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold">Plan name<input value={draft.name} onChange={(e) => set('name', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold">Plan code<input value={draft.code} onChange={(e) => set('code', e.target.value)} placeholder="Generated from name" className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold">Category<select value={draft.category} onChange={(e) => set('category', e.target.value as MealPlanDraft['category'])} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm"><option value="veg">Veg</option><option value="non_veg">Non-Veg</option><option value="both">Both</option></select></label>
            <label className="text-xs font-bold">Billing<select value={draft.billing_period} onChange={(e) => set('billing_period', e.target.value as MealPlanDraft['billing_period'])} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm"><option value="monthly">Monthly</option><option value="daily">Daily</option></select></label>
            <label className="text-xs font-bold">Price (₹)<input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => set('price', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold">Display order<input type="number" value={draft.sort_order} onChange={(e) => set('sort_order', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold sm:col-span-2">Description<textarea rows={2} value={draft.description} onChange={(e) => set('description', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold sm:col-span-2">Meals included (comma separated)<input value={draft.meals_included} onChange={(e) => set('meals_included', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold sm:col-span-2">Features (comma separated)<input value={draft.features} onChange={(e) => set('features', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold sm:col-span-2">Availability note<input value={draft.availability_note} onChange={(e) => set('availability_note', e.target.value)} className="mt-1 w-full rounded-lg border border-[#E5E1D6] bg-white px-3 py-2 text-sm" /></label>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={draft.is_active} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#225944]" />Active</label>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={draft.is_available} onChange={(e) => set('is_available', e.target.checked)} className="accent-[#225944]" />Available to customers</label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft()); }} className="rounded-xl border border-[#E5E1D6] bg-white px-4 py-2.5 text-xs font-bold">Cancel</button>}
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-[#225944] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save to InsForge'}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MealPlanManager;
