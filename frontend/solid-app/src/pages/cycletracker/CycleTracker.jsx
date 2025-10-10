import { createSignal, onMount, Show, For } from 'solid-js';
import { useUser } from '../../context/UserContext.jsx';
import onboardingService from '../../../../common/services/onboardingService.js';
import styles from '../../../../common/styles/CycleTracker.module.css';

export default function CycleTracker() {
  const { user } = useUser();
  const [profileData, setProfileData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [currentDate, setCurrentDate] = createSignal(new Date());

  onMount(async () => {
    const fetchProfile = async () => {
      if (!user()?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await onboardingService.getProfile(user().id);
        setProfileData(data.profile);
      } catch (err) {
        // Fallback to user profile if available
        if (user().profile) {
          setProfileData(user().profile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  });

  // Calculate cycle phase for a given date
  const getCyclePhase = (date) => {
    const profile = profileData();
    if (!profile?.lastPeriodStart) return 'unknown';

    const lastPeriod = new Date(profile.lastPeriodStart);
    const daysDiff = Math.floor((date - lastPeriod) / (1000 * 60 * 60 * 24));
    const cycleDay = ((daysDiff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;

    if (cycleDay <= profile.averagePeriodLength) {
      return 'menstrual';
    } else if (cycleDay <= 13) {
      return 'follicular';
    } else if (cycleDay <= 17) {
      return 'ovulation';
    } else {
      return 'luteal';
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const current = currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateObj = new Date(currentDay);
      const isCurrentMonth = dateObj.getMonth() === month;
      const isToday = dateObj.toDateString() === new Date().toDateString();
      const phase = isCurrentMonth ? getCyclePhase(dateObj) : 'unknown';

      days.push({
        date: dateObj,
        day: dateObj.getDate(),
        isCurrentMonth,
        isToday,
        phase
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate());
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Reactive calendar days
  const calendarDays = () => generateCalendarDays();

  return (
    <Show when={loading()} fallback={
      <Show when={profileData()} fallback={
        <div class={styles.pageWrapper}>
          <div class={styles.emptyState}>
            <h2>Complete Your Profile</h2>
            <p>Set up your cycle information to start tracking.</p>
            <button 
              class={styles.primaryButton}
              onClick={() => window.location.href = '/onboarding'}
            >
              Complete Setup
            </button>
          </div>
        </div>
      }>
        <div class={styles.pageWrapper}>
          <div class={styles.container}>
            <header class={styles.header}>
              <h1>Cycle Calendar 🌙</h1>
              <p>Track your menstrual cycle and optimize your workouts</p>
            </header>

            {/* Calendar Navigation */}
            <div class={styles.calendarHeader}>
              <button 
                class={styles.navButton}
                onClick={() => navigateMonth(-1)}
              >
                ‹
              </button>
              <h2 class={styles.monthTitle}>
                {monthNames[currentDate().getMonth()]} {currentDate().getFullYear()}
              </h2>
              <button 
                class={styles.navButton}
                onClick={() => navigateMonth(1)}
              >
                ›
              </button>
            </div>

            {/* Calendar */}
            <div class={styles.calendar}>
              {/* Day Headers */}
              <div class={styles.dayHeaders}>
                <For each={dayNames}>
                  {(day) => (
                    <div class={styles.dayHeader}>
                      {day}
                    </div>
                  )}
                </For>
              </div>

              {/* Calendar Days */}
              <div class={styles.calendarGrid}>
                <For each={calendarDays()}>
                  {(dayObj) => (
                    <div
                      class={`
                        ${styles.calendarDay}
                        ${!dayObj.isCurrentMonth ? styles.otherMonth : ''}
                        ${dayObj.isToday ? styles.today : ''}
                        ${styles[dayObj.phase]}
                      `}
                    >
                      <span class={styles.dayNumber}>{dayObj.day}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Legend */}
            <div class={styles.legend}>
              <h3>Cycle Phases</h3>
              <div class={styles.legendItems}>
                <div class={styles.legendItem}>
                  <div class={`${styles.legendColor} ${styles.menstrual}`}></div>
                  <span>Menstrual (Days 1-{profileData().averagePeriodLength})</span>
                </div>
                <div class={styles.legendItem}>
                  <div class={`${styles.legendColor} ${styles.follicular}`}></div>
                  <span>Follicular (Days {profileData().averagePeriodLength + 1}-13)</span>
                </div>
                <div class={styles.legendItem}>
                  <div class={`${styles.legendColor} ${styles.ovulation}`}></div>
                  <span>Ovulation (Days 14-17)</span>
                </div>
                <div class={styles.legendItem}>
                  <div class={`${styles.legendColor} ${styles.luteal}`}></div>
                  <span>Luteal (Days 18-{profileData().cycleLength})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    }>
      <div class={styles.pageWrapper}>
        <div class={styles.loadingContainer}>
          <div class={styles.spinner}></div>
          <p>Loading your cycle data...</p>
        </div>
      </div>
    </Show>
  );
}