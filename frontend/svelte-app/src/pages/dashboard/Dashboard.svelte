<script>
    import { onMount } from 'svelte';
    import { userStore } from '../../stores/userStore.js';
    import onboardingService from '../../services/onboardingService.js';
    import styles from './Dashboard.module.css';
  
    // Render counter for performance testing
    let renderCount = 0;
    renderCount++;
    console.log('🔄 Svelte Dashboard render count:', renderCount, 'times');
  
    let profileData = null;
    let loading = true;
    let error = null;
  
    onMount(async () => {
      const fetchProfileData = async () => {
        console.log('Dashboard onMount - user:', $userStore);
        
        if (!$userStore?.id) {
          console.log('No user ID found');
          loading = false;
          return;
        }
        
        try {
          loading = true;
          console.log('Fetching profile for user:', $userStore.id);
          const data = await onboardingService.getProfile($userStore.id);
          console.log('Profile data received:', data);
          profileData = data.profile;
        } catch (err) {
          console.error('Dashboard fetch error:', err);
          
          // Fallback: use profile from user state if available
          if ($userStore.profile) {
            console.log('Using fallback profile from user state:', $userStore.profile);
            profileData = $userStore.profile;
          } else {
            error = err.message;
          }
        } finally {
          loading = false;
        }
      };
  
      fetchProfileData();
    });
  
    // Calculate cycle phase (simplified)
    function calculateCyclePhase(profile) {
      if (!profile.lastPeriodStart) return { phase: 'Unknown', daysInPhase: 0 };
      
      const lastPeriod = new Date(profile.lastPeriodStart);
      const today = new Date();
// ✅ This is explicit about wanting the numeric timestamp
    const daysSincePeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));      
      if (daysSincePeriod <= profile.averagePeriodLength) {
        return { phase: 'Menstrual', daysInPhase: daysSincePeriod };
      } else if (daysSincePeriod <= 13) {
        return { phase: 'Follicular', daysInPhase: daysSincePeriod };
      } else if (daysSincePeriod <= 17) {
        return { phase: 'Ovulation', daysInPhase: daysSincePeriod };
      } else {
        return { phase: 'Luteal', daysInPhase: daysSincePeriod };
      }
    }
  
    $: cyclePhase = profileData ? calculateCyclePhase(profileData) : { phase: 'Unknown', daysInPhase: 0 };
  </script>
  
  <!-- Loading State -->
  {#if loading}
    <div class={styles.pageWrapper}>
      <div class={styles.loadingContainer}>
        <div class={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  
  <!-- Error State -->
  {:else if error}
    <div class={styles.pageWrapper}>
      <div class={styles.errorContainer}>
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
      </div>
    </div>
  
  <!-- Empty State -->
  {:else if !profileData}
    <div class={styles.pageWrapper}>
      <div class={styles.emptyState}>
        <h2>Welcome to StrongCycles!</h2>
        <p>Complete your onboarding to see your personalized dashboard.</p>
        <button 
          class={styles.primaryButton}
          on:click={() => window.location.href = '/onboarding'}
        >
          Complete Setup
        </button>
      </div>
    </div>
  
  <!-- Dashboard Content -->
  {:else}
    <div class={styles.pageWrapper}>
      <div class={styles.container}>
        <header class={styles.header}>
          <h1>Welcome back, {profileData.firstName}! 👋</h1>
          <p class={styles.subtitle}>Here's your StrongCycles overview</p>
        </header>
  
        <div class={styles.dashboardGrid}>
          <!-- Profile Summary Card -->
          <div class={styles.card}>
            <h3 class={styles.cardTitle}>Profile Summary</h3>
            <div class={styles.profileInfo}>
              <div class={styles.infoRow}>
                <span class={styles.label}>Age:</span>
                <span class={styles.value}>{profileData.age} years old</span>
              </div>
              <div class={styles.infoRow}>
                <span class={styles.label}>Fitness Level:</span>
                <span class={styles.value}>
                  {profileData.fitnessLevel.charAt(0).toUpperCase() + profileData.fitnessLevel.slice(1)}
                </span>
              </div>
              <div class={styles.infoRow}>
                <span class={styles.label}>Goals:</span>
                <span class={styles.value}>
                  {profileData.goals?.map(goal => 
                    goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ).join(', ') || 'None set'}
                </span>
              </div>
            </div>
          </div>
  
          <!-- Cycle Overview Card -->
          <div class={styles.card}>
            <h3 class={styles.cardTitle}>Cycle Overview</h3>
            <div class={styles.cycleInfo}>
              <div class={styles.currentPhase}>
                <span class={styles.phaseLabel}>Current Phase:</span>
                <span class={`${styles.phaseBadge} ${styles[cyclePhase.phase.toLowerCase()]}`}>
                  {cyclePhase.phase}
                </span>
              </div>
              <div class={styles.cycleStats}>
                <div class={styles.stat}>
                  <span class={styles.statValue}>{cyclePhase.daysInPhase}</span>
                  <span class={styles.statLabel}>Days in phase</span>
                </div>
                <div class={styles.stat}>
                  <span class={styles.statValue}>{profileData.cycleLength}</span>
                  <span class={styles.statLabel}>Cycle length</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Quick Stats Card -->
          <div class={styles.card}>
            <h3 class={styles.cardTitle}>Quick Stats</h3>
            <div class={styles.statsGrid}>
              <div class={styles.stat}>
                <span class={styles.statValue}>{profileData.preferredWorkoutTypes?.length || 0}</span>
                <span class={styles.statLabel}>Workout types</span>
              </div>
              <div class={styles.stat}>
                <span class={styles.statValue}>{profileData.goals?.length || 0}</span>
                <span class={styles.statLabel}>Active goals</span>
              </div>
              <div class={styles.stat}>
                <span class={styles.statValue}>{profileData.averagePeriodLength}</span>
                <span class={styles.statLabel}>Period days</span>
              </div>
            </div>
          </div>
  
          <!-- Recent Activity Card -->
          <div class={styles.card}>
            <h3 class={styles.cardTitle}>Recent Activity</h3>
            <div class={styles.activityList}>
              <div class={styles.activityItem}>
                <span class={styles.activityIcon}>✅</span>
                <span class={styles.activityText}>Profile completed</span>
                <span class={styles.activityTime}>Recently</span>
              </div>
              <div class={styles.activityItem}>
                <span class={styles.activityIcon}>🎯</span>
                <span class={styles.activityText}>
                  Goals set: {profileData.goals?.join(', ') || 'None'}
                </span>
                <span class={styles.activityTime}>Today</span>
              </div>
              <div class={styles.activityItem}>
                <span class={styles.activityIcon}>💪</span>
                <span class={styles.activityText}>Ready to start tracking!</span>
                <span class={styles.activityTime}>Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}