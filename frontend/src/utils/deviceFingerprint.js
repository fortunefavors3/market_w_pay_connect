/**
 * Device Fingerprinting Utility for Fraud Prevention
 * Collects device/browser information for Visa CE3.0 compliance
 */

// Generate a unique device fingerprint from browser characteristics
export const generateDeviceFingerprint = () => {
  const components = [];
  
  // Screen info
  components.push(window.screen.width);
  components.push(window.screen.height);
  components.push(window.screen.colorDepth);
  components.push(window.screen.pixelDepth);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(new Date().getTimezoneOffset());
  
  // Language
  components.push(navigator.language);
  components.push(navigator.languages?.join(',') || '');
  
  // Platform
  components.push(navigator.platform);
  components.push(navigator.userAgent);
  
  // Hardware concurrency
  components.push(navigator.hardwareConcurrency || 'unknown');
  
  // Device memory (if available)
  components.push(navigator.deviceMemory || 'unknown');
  
  // Touch support
  components.push('ontouchstart' in window ? 'touch' : 'no-touch');
  components.push(navigator.maxTouchPoints || 0);
  
  // WebGL renderer (graphics card info)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    components.push('webgl-error');
  }
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Effinsure-FP-2025', 2, 2);
    components.push(canvas.toDataURL().slice(-50));
  } catch (e) {
    components.push('canvas-error');
  }
  
  // Generate hash from components
  const fingerprintString = components.join('|||');
  return hashString(fingerprintString);
};

// Simple hash function for fingerprint
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex and ensure minimum length for CE3.0 (≥20 chars)
  const hexHash = Math.abs(hash).toString(16);
  const timestamp = Date.now().toString(16);
  return `efp_${hexHash}${timestamp}`.padEnd(25, '0');
};

// Collect all device metadata for fraud prevention
export const collectDeviceMetadata = () => {
  return {
    // Device fingerprint (CE3.0 required, ≥20 chars)
    device_fingerprint: generateDeviceFingerprint(),
    
    // Screen info
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    
    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Language
    language: navigator.language,
    
    // User agent
    user_agent: navigator.userAgent,
    
    // Platform
    platform: navigator.platform,
    
    // Touch capability
    has_touch: 'ontouchstart' in window,
    max_touch_points: navigator.maxTouchPoints || 0,
    
    // Connection info (if available)
    connection_type: navigator.connection?.effectiveType || 'unknown',
    
    // Do Not Track
    do_not_track: navigator.doNotTrack === '1',
    
    // Cookies enabled
    cookies_enabled: navigator.cookieEnabled,
    
    // PDF viewer plugin
    pdf_viewer: navigator.pdfViewerEnabled || false
  };
};

// Get client IP address (requires backend call)
export const getClientIP = async (backendUrl) => {
  try {
    const response = await fetch(`${backendUrl}/api/get-client-ip`);
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return null;
  }
};

export default {
  generateDeviceFingerprint,
  collectDeviceMetadata,
  getClientIP
};
