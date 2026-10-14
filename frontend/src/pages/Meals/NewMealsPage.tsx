import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Clock3, Leaf, Utensils } from 'lucide-react';
import ServiceBookingModal, { ServiceBookingOption } from '../../components/services/ServiceBookingModal';
import { MealServicePlan, serviceExperienceApi } from '../../services/serviceExperienceApi';

interface PendingServiceRequest {
  catalogType?: string;
  catalogId?: string;
  planName?: string;
}

const formatPrice = (plan: MealServicePlan) =>
  `₹${Number(plan.price).toLocaleString('en-IN')}${plan.billing_period === 'daily' ? ' / day' : ' / month'}`;

const categoryLabel = (category: MealServicePlan['category']) => {
  if (category === 'non_veg') return 'Non-Veg';
  if (category === 'both') return 'Veg & Non-Veg';
  return 'Vegetarian';
};

export const NewMealsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MealServicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealServicePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const rows = await serviceExperienceApi.getMealPlans();
      setPlans(rows.filter((plan) => plan.is_active && plan.is_available));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Meal plans could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    const pending = (location.state as { pendingServiceRequest?: PendingServiceRequest } | null)?.pendingServiceRequest;
    if (!pending || pending.catalogType !== 'meal_plan' || plans.length === 0) return;
    const plan = plans.find((item) => item.id === pending.catalogId || item.name === pending.planName);
    if (plan) setSelectedPlan(plan);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.key, location.pathname, location.search, location.state, navigate, plans]);

  const selectedOption: ServiceBookingOption | null = selectedPlan ? {
    catalogType: 'meal_plan',
    catalogId: selectedPlan.id,
    name: selectedPlan.name,
    price: Number(selectedPlan.price),
    billingPeriod: selectedPlan.billing_period,
    description: selectedPlan.description,
    durationLabel: selectedPlan.billing_period === 'daily' ? 'Number of days' : 'Number of months',
  } : null;

  return (
    <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#171A18] sm:px-6 lg:px-8">
      <main className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#EECA3A]/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#715d00]">
            <Utensils className="h-3.5 w-3.5" /> EaseHub meal plans
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Good food, on your schedule.</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B6B63] sm:text-base">Compare current meal plans, inclusions, and billing before you subscribe. Prices and availability are managed by EaseHub admins.</p>
        </header>

        {loading && <p role="status" className="mt-8 text-sm font-semibold text-[#225944]">Loading available meal plans…</p>}
        {error && <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div>}
        {!loading && !error && plans.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E5E1D6] bg-white p-8 text-center">
            <h2 className="font-extrabold">No meal plans are currently available</h2>
            <p className="mt-2 text-sm text-[#6B6B63]">Please check back later or contact support.</p>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <section aria-label="Available meal plans" className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="flex flex-col rounded-3xl border border-[#E5E1D6] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#225944]">{categoryLabel(plan.category)}</p>
                    <h2 className="mt-2 text-xl font-extrabold">{plan.name}</h2>
                  </div>
                  <span className="rounded-full bg-[#F7F5EF] px-3 py-1 text-[11px] font-bold text-[#6B6B63]">{plan.billing_period === 'daily' ? 'Daily' : 'Monthly'}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#6B6B63]">{plan.description}</p>
                <p className="mt-5 text-3xl font-black text-[#225944]">{formatPrice(plan)}</p>

                <div className="mt-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B6B63]">Meals included</h3>
                  <ul className="mt-2 space-y-2">
                    {plan.meals_included.map((meal) => <li key={meal} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-[#225944]" />{meal}</li>)}
                  </ul>
                </div>

                {plan.features.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{plan.features.map((feature) => <span key={feature} className="rounded-full bg-[#F7F5EF] px-3 py-1 text-[11px] font-semibold text-[#404944]">{feature}</span>)}</div>}

                <div className="mt-auto pt-6">
                  {plan.availability_note && <p className="mb-3 flex items-center gap-2 text-xs text-[#6B6B63]"><Clock3 className="h-3.5 w-3.5" />{plan.availability_note}</p>}
                  <button type="button" onClick={() => setSelectedPlan(plan)} className="w-full rounded-xl bg-[#225944] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#184232]">Subscribe / Book Now</button>
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

export default NewMealsPage;
