<script>
    import styles from "./Auth.module.css";
    import authService from "../../services/authService.js";

    let renderCount = 0;
    renderCount ++;
    console.log(`Auth component rendered ${renderCount} times`);
    
    let isLogin = true;
    let email = "";
    let password = "";
    let confirmPassword = "";
    
    // Add loading and message states
    let isLoading = false;
    let error = null;
    let successMessage = "";
  
    async function handleSubmit(event) {
      event.preventDefault();
      
      // Clear previous messages
      error = null;
      successMessage = "";
      isLoading = true;
  
      try {
        if (isLogin) {
          const data = await authService.login(email, password);
          successMessage = data.message;
        } else {
          const data = await authService.register(email, password);
          successMessage = data.message;
        }
      } catch (err) {
        error = err.message;
      } finally {
        isLoading = false;
      }
    }
  
    function toggleMode() {
      isLogin = !isLogin;
      email = "";
      password = "";
      confirmPassword = "";
      error = null;
      successMessage = "";
    }
  </script>
  
  <div class={styles.pageWrapper}>
    <div class={styles.container}>
      <h1 class={styles.title}>
        {isLogin ? "Welcome Back" : "Create Account"}
      </h1>
  
      <!-- Add success/error messages -->
      {#if successMessage}
        <div class={styles.successMessage}>
          {successMessage}
        </div>
      {/if}
  
      {#if error}
        <div class={styles.errorBanner}>
          {error}
        </div>
      {/if}
  
      <form class={styles.form} on:submit={handleSubmit}>
        <div class={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email address"
            bind:value={email}
            class={styles.input}
          />
        </div>
  
        <div class={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            class={styles.input}
          />
        </div>
  
        {#if !isLogin}
          <div class={styles.inputGroup}>
            <input
              type="password"
              placeholder="Confirm Password"
              bind:value={confirmPassword}
              class={styles.input}
            />
          </div>
        {/if}
  
        <button 
          type="submit" 
          class={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>
  
      <div class={styles.toggleSection}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          type="button"
          on:click={toggleMode}
          class={styles.toggleButton}
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  </div>