// ==UserScript==
// @name         Delta Executor Bypass & Ad Block v5
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Bypass installation steps and block ads for Delta Executor - Complete bypass
// @author       blankboii
// @match        *://deltaios-executor.com/*
// @match        *://*.deltaios-executor.com/*
// @match        *://krnl-ios.com/*
// @match        *://*.krnl-ios.com/*
// @match        *://*/*unlock*
// @match        *://*/*premium*
// @match        *://*/*access*
// @match        *://*/*verify*
// @downloadURL  https://raw.githubusercontent.com/blan3bo1/userscripts/refs/heads/main/Delta%7CKrnl%7CBypass.js
// @updateURL    https://raw.githubusercontent.com/blan3bo1/userscripts/refs/heads/main/Delta%7CKrnl%7CBypass.js
// @icon         https://static.thenounproject.com/png/3560673-200.png
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

    function init() {
        console.log('Delta/Krnl Bypass v5 activated');

        // Block analytics and ad scripts
        const blockedScripts = [
            'clarity',
            'googletagmanager',
            'google-analytics',
            'pagead2.googlesyndication',
            'adsbygoogle',
            'camomilegentlemennotable.com',
            'suspectplainrevulsion.com',
            'paypalobjects.com/donate',
            'monero-webminer',
            'key_generator.php',
            'verify.php',
            'cloudflareinsights.com',
            'beacon.min.js',
            'symaro.com'
        ];

        // Create notification GUI styles
        if (document.head) {
            const notificationStyles = `
                .delta-bypass-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: deltaSlideIn 0.3s ease-out, deltaFadeOut 0.3s ease-in 2.7s;
                    animation-fill-mode: forwards;
                    max-width: 300px;
                }
                
                .delta-bypass-notification::before {
                    content: '✓';
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .delta-bypass-notification.error {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }
                
                .delta-bypass-notification.error::before {
                    content: '⚠';
                }
                
                @keyframes deltaSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes deltaFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = notificationStyles;
            document.head.appendChild(styleSheet);
        }

        // Function to show notification
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `delta-bypass-notification ${type === 'error' ? 'error' : ''}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }

        // Function to copy to clipboard
        function copyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }

        // Detect if we're on an unlock page
        function isUnlockPage() {
            return document.getElementById('readButton') && 
                   document.getElementById('watchButton') && 
                   document.getElementById('lockedButton');
        }

        // Bypass the unlock page completely
        function bypassUnlockPage() {
            if (!isUnlockPage()) {
                console.log('Not an unlock page, skipping bypass');
                return false;
            }

            console.log('Detected unlock page - bypassing all steps...');
            showNotification('Bypassing unlock steps...');

            // Override the newLink function to prevent opening symaro.com
            if (typeof window.newLink === 'function') {
                window.newLink = function() {
                    console.log('Blocked symaro.com link generation');
                    return 'about:blank';
                };
            }
            
            // Parse URL parameters to get redirect URL
            function parseUrlParameters() {
                const urlParams = new URLSearchParams(window.location.search);
                const encodedUrl = urlParams.get('URL');
                
                if (encodedUrl) {
                    try {
                        const redirectUrl = atob(encodedUrl);
                        console.log('Found redirect URL:', redirectUrl);
                        return redirectUrl;
                    } catch (error) {
                        console.error('Error decoding URL:', error);
                    }
                }
                return null;
            }
            
            // Override the unlock page functions
            window.handleButtonClick = function(type) {
                console.log('Bypassing button click:', type);
                
                const button = document.getElementById(type + 'Button');
                const status = document.getElementById(type + 'Status');
                
                if (type === 'read') {
                    window.readCompleted = true;
                    button.innerHTML = '📖 Read an Article <span class="checkmark">✓</span>';
                    status.textContent = '✅ Completed';
                    status.className = 'completed';
                } else {
                    window.watchCompleted = true;
                    button.innerHTML = '📰 Read a Blog <span class="checkmark">✓</span>';
                    status.textContent = '✅ Completed';
                    status.className = 'completed';
                }
                
                checkUnlockStatus();
            };
            
            window.checkUnlockStatus = function() {
                if (window.readCompleted && window.watchCompleted) {
                    const lockedButton = document.getElementById('lockedButton');
                    lockedButton.disabled = false;
                    lockedButton.textContent = '🔓 Unlocked';
                    lockedButton.className = 'button unlocked-button';
                    
                    // Auto-click the unlocked button
                    setTimeout(() => {
                        handleLockedButton();
                    }, 500);
                }
            };
            
            window.handleLockedButton = function() {
                console.log('Bypassing locked button...');
                showNotification('Unlock completed! Getting download...');
                
                const redirectUrl = parseUrlParameters();
                if (redirectUrl) {
                    // Copy to clipboard and redirect
                    if (copyToClipboard(redirectUrl)) {
                        showNotification('Download link copied! Redirecting...');
                    }
                    
                    // Auto-redirect to the download URL
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    // Fallback to direct download for Delta/Krnl
                    showNotification('Using direct download method');
                    setTimeout(() => {
                        // Try common Delta/Krnl download URLs
                        const directUrls = [
                            'itms-services://?action=download-manifest&url=https://deltaios-executor.com/Install21.plist',
                            'itms-services://?action=download-manifest&url=https://krnl-ios.com/Install21.plist',
                            'https://deltaios-executor.com/Delta_Executor.ipa',
                            'https://krnl-ios.com/Krnl_IOS.ipa'
                        ];
                        
                        // Try each URL until one works
                        let currentIndex = 0;
                        function tryNextUrl() {
                            if (currentIndex < directUrls.length) {
                                const url = directUrls[currentIndex];
                                console.log('Trying download URL:', url);
                                window.location.href = url;
                                currentIndex++;
                                setTimeout(tryNextUrl, 2000);
                            }
                        }
                        tryNextUrl();
                    }, 1000);
                }
            };
            
            // Auto-start the bypass process immediately
            setTimeout(() => {
                // Auto-complete both tasks
                window.handleButtonClick('read');
                window.handleButtonClick('watch');
            }, 800);
            
            return true;
        }

        // Handle direct URL parameters for immediate redirect
        function handleDirectRedirect() {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedUrl = urlParams.get('URL');
            
            if (encodedUrl) {
                try {
                    const redirectUrl = atob(encodedUrl);
                    console.log('Direct redirect detected:', redirectUrl);
                    
                    // Copy to clipboard
                    if (copyToClipboard(redirectUrl)) {
                        showNotification('Download link copied! Redirecting...');
                    }
                    
                    // Auto-redirect after short delay
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1000);
                    return true;
                } catch (error) {
                    console.error('Error decoding redirect URL:', error);
                }
            }
            return false;
        }

        // Main execution
        if (!handleDirectRedirect()) {
            if (!bypassUnlockPage()) {
                // If not an unlock page, still block ads and handle symaro
                console.log('Running ad-blocking features only');
            }
        }
        
        // Handle symaro.com - close immediately
        if (window.location.hostname.includes('symaro.com')) {
            console.log('On symaro.com - closing tab');
            showNotification('Closing ad page...');
            setTimeout(() => {
                window.close();
                // If tab doesn't close, go back
                setTimeout(() => {
                    window.history.back();
                }, 500);
            }, 300);
        }

        // Enhanced script blocking
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    if (name === 'src' && blockedScripts.some(blocked => value && value.includes(blocked))) {
                        console.log('Blocked script:', value);
                        showNotification(`Blocked: ${value.split('/').pop()}`);
                        return;
                    }
                    return originalSetAttribute.call(this, name, value);
                };
                
                // Also block inline scripts that might contain symaro calls
                const originalAppendChild = element.appendChild;
                element.appendChild = function(child) {
                    if (child.nodeType === 3 && child.textContent && child.textContent.includes('symaro')) {
                        console.log('Blocked inline script with symaro');
                        return child;
                    }
                    return originalAppendChild.call(this, child);
                };
            }
            return element;
        };

        // Block iframes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'IFRAME') {
                        const src = node.src || '';
                        if (blockedScripts.some(blocked => src.includes(blocked))) {
                            console.log('Blocked iframe:', src);
                            node.remove();
                        }
                    }
                    // Also check for unlock page elements being added dynamically
                    if (node.nodeType === 1 && node.querySelector) {
                        if (node.querySelector('#readButton') && node.querySelector('#lockedButton')) {
                            setTimeout(bypassUnlockPage, 100);
                        }
                    }
                });
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Block requests to ad domains
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            if (blockedScripts.some(blocked => args[0] && args[0].includes(blocked))) {
                console.log('Blocked fetch request:', args[0]);
                return Promise.reject(new Error('Blocked by Delta/Krnl Bypass'));
            }
            return originalFetch.apply(this, args);
        };

        // Override XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (blockedScripts.some(blocked => url && url.includes(blocked))) {
                console.log('Blocked XHR request:', url);
                this._blocked = true;
                return;
            }
            return originalXHROpen.call(this, method, url, ...args);
        };

        const originalXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._blocked) {
                return;
            }
            return originalXHRSend.call(this, ...args);
        };

        // Block navigation to symaro.com
        const originalWindowOpen = window.open;
        window.open = function(url, ...args) {
            if (url && url.includes('symaro.com')) {
                console.log('Blocked symaro.com navigation:', url);
                showNotification('Blocked ad page popup');
                return null;
            }
            return originalWindowOpen.call(this, url, ...args);
        };

        // Prevent page from opening symaro.com
        const originalAssign = window.location.assign;
        window.location.assign = function(url) {
            if (url && url.includes('symaro.com')) {
                console.log('Blocked location.assign to symaro.com');
                return;
            }
            return originalAssign.call(this, url);
        };

        console.log('Delta/Krnl Bypass v5 fully loaded');
    }
})();
