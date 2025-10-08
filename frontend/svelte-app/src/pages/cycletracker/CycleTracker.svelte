<script>
    import { onMount } from 'svelte';
    import { userStore } from '../../stores/userStore.js';
    import onboardingService from '../../../../common/services/onboardingService.js';
    import styles from '../../../../common/styles/components/CycleTracker.module.css';
  
    // Render counter for performance testing
    let renderCount = 0;
    renderCount++;
    console.log('🔄 Svelte CycleTracker render count:', renderCount, 'times');
  
    let profileData = null;
    let loading = true;
    let currentDate = new Date();
  
    onMount(async () => {
      const fetchProfile = async () => {
        if (!$userStore?.id) {
          loading = false;
          return;
        }
  
        try {
          const data = await onboardingService.getProfile($userStore.id);
          profileData = data.profile;
        } catch (err) {
          // Fallback to user profile if available
          if ($userStore.profile) {
            profileData = $userStore.profile;
          }
        } finally {
          loading = false;
        }
      };
  
      fetchProfile();
    });
  
    // Calculate cycle phase for a given date
    function getCyclePhase(date) {
      if (!profileData?.lastPeriodStart) return 'unknown';
  
      const lastPeriod = new Date(profileData.lastPeriodStart);
      const daysDiff = Math.floor((date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = ((daysDiff % profileData.cycleLength) + profileData.cycleLength) % profileData.cycleLength + 1;
  
      if (cycleDay <= profileData.averagePeriodLength) {
        return 'menstrual';
      } else if (cycleDay <= 13) {
        return 'follicular';
      } else if (cycleDay <= 17) {
        return 'ovulation';
      } else {
        return 'luteal';
      }
    }
  
    // Generate calendar days for current month
    function generateCalendarDays() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
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
    }
  
    function navigateMonth(direction) {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + direction);
      currentDate = newDate;
    }
  
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    // Reactive calendar days - automatically updates when currentDate changes
    $: calendarDays = profileData ? generateCalendarDays() : [];
</script>
  
  <!-- Loading State -->
  {#if loading}
    <div class={styles.pageWrapper}>
      <div class={styles.loadingContainer}>
        <div class={styles.spinner}></div>
        <p>Loading your cycle data...</p>
      </div>
    </div>
  
  <!-- Empty State -->
  {:else if !profileData}
    <div class={styles.pageWrapper}>
      <div class={styles.emptyState}>
        <h2>Complete Your Profile</h2>
        <p>Set up your cycle information to start tracking.</p>
        <button 
          class={styles.primaryButton}
          on:click={() => window.location.href = '/onboarding'}
        >
          Complete Setup
        </button>
      </div>
    </div>
  
  <!-- Calendar Content -->
  {:else}
    <div class={styles.pageWrapper}>
      <div class={styles.container}>
        <header class={styles.header}>
          <h1>Cycle Calendar 🌙</h1>
          <p>Track your menstrual cycle and optimize your workouts</p>
        </header>
  
        <!-- Calendar Navigation -->
        <div class={styles.calendarHeader}>
          <button 
            class={styles.navButton}
            on:click={() => navigateMonth(-1)}
          >
            ‹
          </button>
          <h2 class={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button 
            class={styles.navButton}
            on:click={() => navigateMonth(1)}
          >
            ›
          </button>
        </div>
  
        <!-- Calendar -->
        <div class={styles.calendar}>
          <!-- Day Headers -->
          <div class={styles.dayHeaders}>
            {#each dayNames as day}
              <div class={styles.dayHeader}>
                {day}
              </div>
            {/each}
          </div>
  
          <!-- Calendar Days -->
          <div class={styles.calendarGrid}>
            {#each calendarDays as dayObj}
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
            {/each}
          </div>
        </div>
  
        <!-- Legend -->
        <div class={styles.legend}>
          <h3>Cycle Phases</h3>
          <div class={styles.legendItems}>
            <div class={styles.legendItem}>
              <div class={`${styles.legendColor} ${styles.menstrual}`}></div>
              <span>Menstrual (Days 1-{profileData.averagePeriodLength})</span>
            </div>
            <div class={styles.legendItem}>
              <div class={`${styles.legendColor} ${styles.follicular}`}></div>
              <span>Follicular (Days {profileData.averagePeriodLength + 1}-13)</span>
            </div>
            <div class={styles.legendItem}>
              <div class={`${styles.legendColor} ${styles.ovulation}`}></div>
              <span>Ovulation (Days 14-17)</span>
            </div>
            <div class={styles.legendItem}>
              <div class={`${styles.legendColor} ${styles.luteal}`}></div>
              <span>Luteal (Days 18-{profileData.cycleLength})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}