// Security cleanup utility
export const SecurityCleanup = {
  // Clear all potentially compromised data
  clearCompromisedData() {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      console.log('Security cleanup completed');
      return true;
    } catch (error) {
      console.error('Security cleanup failed:', error);
      return false;
    }
  },

  // Force logout and cleanup
  forceSecureLogout() {
    this.clearCompromisedData();
    
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?security_cleanup=true';
    }
  },

  // Check if cleanup is needed (run on app start)
  checkSecurityStatus() {
    const lastCleanup = localStorage.getItem('last_security_cleanup');
    const cleanupDate = new Date('2025-01-31'); // Date when secrets were compromised
    
    if (!lastCleanup || new Date(lastCleanup) < cleanupDate) {
      this.clearCompromisedData();
      localStorage.setItem('last_security_cleanup', new Date().toISOString());
      return true;
    }
    
    return false;
  }
};

export default SecurityCleanup;