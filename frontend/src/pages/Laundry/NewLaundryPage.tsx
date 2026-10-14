import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Clock3, Shirt } from 'lucide-react';
import ServiceBookingModal, { ServiceBookingOption } from '../../components/services/ServiceBookingModal';
import { LaundryServicePlan, serviceExperienceApi } from '../../services/serviceExperienceApi';

interface PendingServiceRequest {
  catalogType?: string;
  catalogId?: string;
  planName?: string;
}

const priceLabel = (plan: LaundryServicePlan) => {
  const unit = plan.billing_period === 'per_kg' ? '/ kg' : plan.billing_period === 'per_item' ? '/ item' : '/ month';
  return `₹${Number(plan.price).toLocaleString('en-IN')} ${unit}`;
};

export const NewLaundryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LaundryServicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LaundryServicePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const rows = await serviceExperienceApi.getLaundryPlans();
      setPlans(rows.filter((plan) => plan.is_active && plan.is_available));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Laundry plans could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    const pending = (location.state as { pendingServiceRequest?: PendingServiceRequest } | null)?.pendingServiceRequest;
    if (!pending || pending.catalogType !== 'laundry_plan' || plans.length === 0) return;
    const plan = plans.find((item) => item.id === pending.catalogId || item.name === pending.planName);
    if (plan) setSelectedPlan(plan);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.key, location.pathname, location.search, location.state, navigate, plans]);

  const selectedOption: ServiceBookingOption | null = selectedPlan ? {
    catalogType: 'laundry_plan',
    catalogId: selectedPlan.id,
    name: selectedPlan.name,
    price: Number(selectedPlan.price),
    billingPeriod: selectedPlan.billing_period,
    description: selectedPlan.description,
    quantityLabel: selectedPlan.billing_period === 'per_kg' ? 'Estimated weight (kg)' : 'Number of items',
    durationLabel: 'Number of months',
  } : null;

  return (
    <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#171A18] sm:px-6 lg:px-8">
      <main className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#225944]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#225944]">
            <Shirt className="h-3.5 w-3.5" /> EaseHub laundry care
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Laundry, without losing a day.</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B6B63] sm:text-base">Choose a current plan, share pickup details, and schedule service. Rates and pickup availability are managed by EaseHub admins.</p>
        </header>

        {loading && <p role="status" className="mt-8 text-sm font-semibold text-[#225944]">Loading available laundry plans…</p>}
        {error && <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div>}
        {!loading && !error && plans.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E5E1D6] bg-white p-8 text-center">
            <h2 className="font-extrabold">No laundry plans are currently available</h2>
            <p className="mt-2 text-sm text-[#6B6B63]">Please check back later or contact support.</p>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <section aria-label="Available laundry plans" className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="flex flex-col rounded-3xl border border-[#E5E1D6] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#225944]">{plan.billing_period.replace('_', ' ')}</p>
                    <h2 className="mt-2 text-xl font-extrabold">{plan.name}</h2>
                  </div>
                  <span className="rounded-full bg-[#F7F5EF] px-3 py-1 text-[11px] font-bold text-[#6B6B63]">{plan.pickup_available ? 'Pickup available' : 'Pickup unavailable'}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#6B6B63]">{plan.description}</p>
                <p className="mt-5 text-3xl font-black text-[#225944]">{priceLabel(plan)}</p>

                <div className="mt-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B6B63]">Included service</h3>
                  <ul className="mt-2 space-y-2">
                    {plan.services_included.map((service) => <li key={service} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-[#225944]" />{service}</li>)}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  {plan.turnaround_time && <p className="mb-3 flex items-center gap-2 text-xs text-[#6B6B63]"><Clock3 className="h-3.5 w-3.5" />{plan.turnaround_time}</p>}
                  {plan.availability_note && <p className="mb-3 text-xs text-[#6B6B63]">{plan.availability_note}</p>}
                  <button type="button" disabled={!plan.pickup_available} onClick={() => setSelectedPlan(plan)} className="w-full rounded-xl bg-[#225944] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#184232] disabled:cursor-not-allowed disabled:opacity-50">Book &amp; Schedule Pickup</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <ServiceBookingModal option={selectedOption} onClose={() => setSelectedPlan(null)} />
    </div>
  );
};

export default NewLaundryPage;
