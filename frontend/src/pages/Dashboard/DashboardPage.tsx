import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi';
import { pgApi } from '../../services/pgApi';
import { mealApi } from '../../services/mealApi';
import { Skeleton } from '../../components/common/Skeleton';
import { SkeletonCard } from '../../components/common/SkeletonCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [recommendedPGs, setRecommendedPGs] = useState<any[]>([]);
  const [recommendedMeals, setRecommendedMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingApi.getMyBookings().catch(() => []),
      pgApi.getAll().catch(() => []),
      mealApi.getAll().catch(() => []),
    ]).then(([userBookings, pgs, meals]) => {
      if (Array.isArray(userBookings)) {
        setActiveBookings(userBookings);
      }
      if (Array.isArray(pgs)) {
        setRecommendedPGs(pgs.slice(0, 4));
      }
      if (Array.isArray(meals)) {
        setRecommendedMeals(meals.slice(0, 4));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#225944]/10 text-[#225944] text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#225944] animate-ping"></span>
              <span>Student Resident App</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
              Good Morning, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B63] mt-1">
              Everything you need for your stay, in one place.
            </p>
          </div>

          <Link
            to="/payment"
            className="px-4 py-2.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-extrabold text-xs shadow-xs transition flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Make Payment</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#6B6B63] text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search PG, meals or laundry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F7F5EF] border border-[#E5E1D6] text-xs sm:text-sm text-[#171A18] placeholder:text-[#6B6B63] focus:outline-none focus:ring-2 focus:ring-[#225944]"
          />
        </div>
      </div>

      {/* 2. Three Main Visually Dominant Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Service Card 1: PG / HOSTEL */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#225944] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[26px]">domain</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#225944] uppercase tracking-wider">PG / HOSTEL</div>
            <h2 className="text-xl font-extrabold text-[#171A18] mt-1">Find your stay</h2>
            <p className="text-xs text-[#6B6B63] mt-1.5 leading-relaxed">
              Browse verified student PGs, hostels and private rooms near BIT Durg, IIT Bhilai &amp; Rungta campuses.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#E5E1D6]">
            <Link
              to="/pg"
              className="w-full py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Explore PGs</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Service Card 2: MEALS */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[26px]">restaurant</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#715d00] uppercase tracking-wider">MEALS</div>
            <h2 className="text-xl font-extrabold text-[#171A18] mt-1">Your daily meals</h2>
            <p className="text-xs text-[#6B6B63] mt-1.5 leading-relaxed">
              Order hygienic home-style daily thalis or manage your 30-day North/South veg tiffin plan.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#E5E1D6]">
            <Link
              to="/meals"
              className="w-full py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Explore Meals</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Service Card 3: LAUNDRY */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#4F7A65] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[26px]">local_laundry_service</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#225944] uppercase tracking-wider">LAUNDRY</div>
            <h2 className="text-xl font-extrabold text-[#171A18] mt-1">Laundry made easy</h2>
            <p className="text-xs text-[#6B6B63] mt-1.5 leading-relaxed">
              Book doorstep pickup, steam ironing &amp; express 24-hour turnaround for your hostel laundry.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#E5E1D6]">
            <Link
              to="/laundry"
              className="w-full py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Book Laundry</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Active Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#171A18]">Active Services &amp; Orders</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#225944]/10 text-[#225944] font-bold text-xs">
              {activeBookings.length} Active
            </span>
          </div>
          <Link to="/bookings" className="text-xs font-bold text-[#225944] hover:underline flex items-center gap-1">
            <span>View All Bookings</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-5 border border-[#E5E1D6] space-y-3">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E5E1D6] text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-[#6B6B63] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
            <h3 className="text-sm font-bold text-[#171A18]">No active bookings found</h3>
            <p className="text-xs text-[#6B6B63] mt-1">Book PGs, Meals, Laundry or Repair Services from the marketplace above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeBookings.map((b: any) => (
              <div key={b._id || b.bookingNumber} className="bg-white rounded-3xl p-5 border border-[#E5E1D6] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#225944] text-[20px]">confirmation_number</span>
                    <span className="text-xs font-extrabold text-[#171A18]">{b.serviceType || 'Booking'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 uppercase">
                    {b.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#171A18]">{b.serviceName}</h3>
                  <p className="text-xs text-[#225944] font-semibold">{b.roomType || 'Standard Plan'}</p>
                  <p className="text-[11px] text-[#6B6B63]">{b.address || 'Bhilai, Chhattisgarh'}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#171A18]">₹{b.amount}</span>
                  <Link to="/bookings" className="px-3 py-1.5 rounded-xl bg-[#F7F5EF] text-[#171A18] font-bold text-[11px] hover:bg-[#E5E1D6]">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Recommended For You Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#171A18]">Recommended For You in Bhilai</h2>
          <span className="text-xs text-[#6B6B63]">Verified Student Marketplace</span>
        </div>

        {/* Recommended PGs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#225944] uppercase tracking-wider">Top Recommended PGs</h3>
            <Link to="/pg" className="text-xs font-bold text-[#225944] hover:underline">Explore All PGs →</Link>
          </div>
          {recommendedPGs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1D6] text-center text-xs text-[#6B6B63]">
              No PG recommendations available yet. PGs created from Admin Panel will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedPGs.map((pg: any) => (
                <div key={pg._id || pg.code} className="bg-white rounded-2xl p-4 border border-[#E5E1D6] shadow-xs flex items-center gap-4 hover:shadow-md transition">
                  {pg.images?.[0] ? (
                    <img src={pg.images[0]} alt={pg.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-[#6B6B63] shrink-0">
                      <span className="material-symbols-outlined text-2xl">domain</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#715d00] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{pg.rating || 5.0}</span>
                      </span>
                      <span className="font-extrabold text-xs text-[#225944]">₹{pg.monthlyRent || 0}/mo</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#171A18] truncate">{pg.name}</h4>
                    <p className="text-[11px] text-[#6B6B63] truncate">{pg.corridor || 'Bhilai'}</p>
                    <Link to="/pg" className="inline-block pt-1 text-xs font-bold text-[#225944] hover:underline">
                      View Property →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Meals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Popular Tiffin &amp; Mess Plans</h3>
            <Link to="/meals" className="text-xs font-bold text-[#225944] hover:underline">Explore All Meals →</Link>
          </div>
          {recommendedMeals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E5E1D6] text-center text-xs text-[#6B6B63]">
              No meal plan recommendations available yet. Mess providers created from Admin Panel will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedMeals.map((meal: any) => (
                <div key={meal._id || meal.code} className="bg-white rounded-2xl p-4 border border-[#E5E1D6] shadow-xs flex items-center gap-4 hover:shadow-md transition">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-[#6B6B63] shrink-0">
                      <span className="material-symbols-outlined text-2xl">restaurant</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#715d00] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{meal.rating || 5.0}</span>
                      </span>
                      <span className="font-extrabold text-xs text-amber-800">₹{meal.monthlyPrice || meal.dailyPrice || 0}/mo</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#171A18] truncate">{meal.name}</h4>
                    <p className="text-[11px] text-[#6B6B63] truncate">{meal.corridor || 'Bhilai'}</p>
                    <Link to="/meals" className="inline-block pt-1 text-xs font-bold text-[#225944] hover:underline">
                      View Tiffin Plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community & Admin Support Banner */}
      <div className="bg-[#225944] text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#EECA3A]/15 blur-2xl pointer-events-none"></div>
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#EECA3A] text-[#171A18] flex items-center justify-center shrink-0 shadow-sm font-bold">
            <span className="material-symbols-outlined text-[26px]">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">Community Support &amp; Discussion</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#EECA3A] text-[#171A18] text-[10px] font-black uppercase">Live</span>
            </div>
            <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
              Connect with fellow student residents in Bhilai &amp; Durg. Ask about room vacancies, tiffin mess reviews, or chat directly with EaseHub Admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 relative z-10">
          <Link
            to="/community"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-[#225944] hover:bg-[#F7F5EF] font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Open Community Chat</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <Link
            to="/support/chat"
            className="px-4 py-2.5 rounded-xl bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18] font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Contact Admin</span>
          </Link>
        </div>
      </div>

      {/* 5. Recent Activity Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-[#171A18] pb-3 border-b border-[#E5E1D6]">
          Recent Account Activity
        </h2>
        {activeBookings.length === 0 ? (
          <p className="text-xs text-[#6B6B63] text-center py-4">No recent account activity logged.</p>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b: any, idx: number) => (
              <div key={b._id || idx} className="p-3.5 rounded-2xl bg-[#F7F5EF] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#225944]/10 text-[#225944] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#171A18]">Booking {b.bookingNumber || b._id}</div>
                    <div className="text-[11px] text-[#6B6B63]">{b.serviceName} - {b.status}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[#6B6B63] shrink-0">
                  {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
