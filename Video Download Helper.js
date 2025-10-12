// ==UserScript==
// @name         Video Download Helper
// @namespace    www.youtube.com
// @version      1.7
// @description  Download videos from YouTube and TikTok using Pulsar API
// @author       Blankboii
// @match        https://www.youtube.com/watch?v=*
// @match        https://youtube.com/watch?v=*
// @match        https://*.youtube.com/watch?v=*
// @match        https://www.tiktok.com/*
// @match        https://tiktok.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @connect      pulsar.usk.lol
// @connect      pulsar-api.netlify.app
// @icon          https://images.vexels.com/media/users/3/137425/isolated/preview/f2ea1ded4d037633f687ee389a571086-youtube-icon-logo.png
// @run-at        document-start
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        .video-download-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #ff0000;
            border-radius: 10px;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            min-width: 400px;
            max-width: 500px;
        }
        .video-download-popup h3 {
            margin: 0 0 15px 0;
            color: #ff0000;
            text-align: center;
        }
        .video-download-popup button {
            background: #ff0000;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
        }
        .video-download-popup button:hover {
            background: #cc0000;
        }
        .video-download-popup button.cancel {
            background: #666;
        }
        .video-download-popup button.cancel:hover {
            background: #555;
        }
        .video-download-popup button.quality-btn {
            background: #4285f4;
            width: auto;
            margin: 2px;
            padding: 8px 12px;
        }
        .video-download-popup button.quality-btn:hover {
            background: #3367d6;
        }
        .video-download-popup button:disabled {
            background: #cccccc;
            cursor: not-allowed;
        }
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        }
        .download-options {
            margin: 15px 0;
        }
        .quality-section {
            margin: 10px 0;
        }
        .quality-section h4 {
            margin: 5px 0;
            color: #333;
        }
        .quality-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin: 5px 0;
        }
        .loading-spinner {
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff0000;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 2s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .universal-download-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff0000 !important;
            color: white !important;
            border: none;
            padding: 12px 16px !important;
            border-radius: 8px !important;
            cursor: pointer;
            font-size: 14px !important;
            font-weight: 600 !important;
            z-index: 9998;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .universal-download-btn:hover {
            background: #cc0000 !important;
        }
        .youtube-download-btn {
            background: #ff0000;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-left: 8px;
        }
        .youtube-download-btn:hover {
            background: #cc0000;
        }
        .url-input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            box-sizing: border-box;
        }
        .url-input:focus {
            outline: none;
            border-color: #ff0000;
        }
        .example-url {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
            font-style: italic;
        }
        .paste-button {
            background: #4285f4 !important;
            margin: 5px 0 !important;
        }
        .paste-button:hover {
            background: #3367d6 !important;
        }
    `;
    document.head.appendChild(style);

    let buttonAdded = false;
    let isYouTube = window.location.hostname.includes('youtube.com');

    function showDownloadPopup() {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        if (window.location.hostname.includes('tiktok.com')) {
            showTikTokUrlInput(overlay);
        } else {
            showStandardPopup(overlay);
        }
    }

    function showTikTokUrlInput(overlay) {
        const popup = document.createElement('div');
        popup.className = 'video-download-popup';
        popup.innerHTML = `
            <h3>Download TikTok Video</h3>
            <p>Please enter the TikTok video URL:</p>
            <input type="text" class="url-input" id="tiktok-url-input" placeholder="https://www.tiktok.com/@username/video/123456789" />
            <div class="example-url">Example: https://www.tiktok.com/@username/video/123456789</div>
            <button class="paste-button" id="paste-url-btn">📋 Paste from Clipboard</button>
            <div style="margin-top: 15px;">
                <button class="download-btn" id="tiktok-download-btn" disabled>Download Video</button>
                <button class="cancel-btn cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        const urlInput = popup.querySelector('#tiktok-url-input');
        const downloadBtn = popup.querySelector('#tiktok-download-btn');
        const pasteBtn = popup.querySelector('#paste-url-btn');

        urlInput.addEventListener('input', function() {
            downloadBtn.disabled = !isValidTikTokUrl(this.value);
        });

        pasteBtn.addEventListener('click', async function() {
            try {
                const text = await navigator.clipboard.readText();
                if (isValidTikTokUrl(text)) {
                    urlInput.value = text;
                    downloadBtn.disabled = false;
                } else {
                    showMessage('Clipboard does not contain a valid TikTok URL', 'error');
                }
            } catch (err) {
                showMessage('Failed to read clipboard: ' + err.message, 'error');
            }
        });

        downloadBtn.addEventListener('click', function() {
            const videoUrl = urlInput.value.trim();
            if (isValidTikTokUrl(videoUrl)) {
                closePopup();
                fetchDownloadOptions(videoUrl);
            }
        });

        popup.querySelector('.cancel-btn').addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);

        function closePopup() {
            if (document.body.contains(popup)) document.body.removeChild(popup);
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
        }
    }

    function showStandardPopup(overlay) {
        const videoUrl = window.location.href;
        const popup = document.createElement('div');
        popup.className = 'video-download-popup';
        popup.innerHTML = `
            <h3>Download Video?</h3>
            <p>Do you want to download this video using Pulsar API?</p>
            <div>
                <button class="download-btn">Yes, Show Download Options</button>
                <button class="cancel-btn cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        popup.querySelector('.download-btn').addEventListener('click', function() {
            closePopup();
            fetchDownloadOptions(videoUrl);
        });
        popup.querySelector('.cancel-btn').addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);

        function closePopup() {
            if (document.body.contains(popup)) document.body.removeChild(popup);
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
        }
    }

    function isValidTikTokUrl(url) {
        return url && (
            url.includes('tiktok.com/') && url.includes('/video/') ||
            url.includes('vm.tiktok.com/') ||
            url.includes('vt.tiktok.com/')
        );
    }

    function fetchDownloadOptions(videoUrl) {
        const apiUrl = `https://pulsar.usk.lol/api/v2/dl?url=${encodeURIComponent(videoUrl)}`;

        const loadingPopup = createPopup('Loading Download Options...', `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Fetching available download options from Pulsar API...</p>
                <p><small>Using URL: ${videoUrl}</small></p>
            </div>
        `);

        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            onload: function(response) {
                loadingPopup.close();

                try {
                    const data = JSON.parse(response.responseText);

                    if (data.status === 'success' && data.data) {
                        showDownloadOptions(data.data);
                    } else {
                        showMessage('API Error: ' + (data.message || 'Unknown error'), 'error');
                    }
                } catch (e) {
                    showMessage('Error parsing API response: ' + e.message, 'error');
                }
            },
            onerror: function(error) {
                loadingPopup.close();
                showMessage('API request failed: ' + error.statusText, 'error');
            }
        });
    }

    function showDownloadOptions(data) {
        const popup = createPopup('Download Options', `
            <div class="download-options">
                <h4>${data.title || 'Video'}</h4>

                ${data.videos && data.videos.length > 0 ? `
                <div class="quality-section">
                    <h4>Video Formats:</h4>
                    <div class="quality-buttons">
                        ${data.videos.map(video => `
                            <button class="quality-btn" data-url="${video.url}" data-type="video" data-quality="${video.quality}">
                                ${video.quality} (${video.type})
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${data.audios && data.audios.length > 0 ? `
                <div class="quality-section">
                    <h4>Audio Formats:</h4>
                    <div class="quality-buttons">
                        ${data.audios.map(audio => `
                            <button class="quality-btn" data-url="${audio.url}" data-type="audio" data-quality="${audio.quality}">
                                ${audio.quality} (${audio.type})
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <button class="cancel-btn cancel" style="margin-top: 15px;">Close</button>
            </div>
        `);

        popup.element.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                const type = this.getAttribute('data-type');
                const quality = this.getAttribute('data-quality');
                downloadFile(url, data.title, type, quality);
            });
        });

        popup.element.querySelector('.cancel-btn').addEventListener('click', function() {
            popup.close();
        });
    }

    function downloadFile(downloadUrl, title, type, quality) {
        const extension = type === 'audio' ? 'mp3' : 'mp4';
        const filename = `${cleanFilename(title || 'video')}_${quality}.${extension}`;

        const loadingPopup = createPopup('Downloading...', `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Downloading ${type} (${quality})...</p>
            </div>
        `);

        GM_download({
            url: downloadUrl,
            name: filename,
            onload: function() {
                loadingPopup.close();
                showMessage(`Download completed: ${filename}`, 'success');
            },
            onerror: function(error) {
                loadingPopup.close();
                showMessage(`Download failed: ${error.error}`, 'error');
            }
        });
    }

    function cleanFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
    }

    function createPopup(title, content) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'video-download-popup';
        popup.innerHTML = `
            <h3>${title}</h3>
            ${content}
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        return {
            element: popup,
            close: function() {
                if (document.body.contains(popup)) document.body.removeChild(popup);
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
            }
        };
    }

    function showMessage(message, type) {
        const popup = createPopup(type === 'error' ? 'Error' : 'Success', `
            <p>${message}</p>
            <button class="cancel">OK</button>
        `);
        popup.element.querySelector('.cancel').addEventListener('click', function() {
            popup.close();
        });
    }

    function addYouTubeButton() {
        const menu = document.querySelector('#top-level-buttons-computed') ||
                    document.querySelector('#actions') ||
                    document.querySelector('#menu-container');

        if (menu && !document.querySelector('.youtube-download-btn')) {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'youtube-download-btn';
            downloadBtn.innerHTML = '📥 Download';
            downloadBtn.addEventListener('click', showDownloadPopup);
            menu.appendChild(downloadBtn);
            buttonAdded = true;
        }
    }

    function addTikTokButton() {
        if (buttonAdded) return;

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'universal-download-btn';
        downloadBtn.innerHTML = '📥 Download';
        downloadBtn.addEventListener('click', showDownloadPopup);
        document.body.appendChild(downloadBtn);
        buttonAdded = true;
    }

    function init() {
        if (window.location.hostname.includes('youtube.com')) {
            addYouTubeButton();
        } else if (window.location.hostname.includes('tiktok.com')) {

            addTikTokButton();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(init, 3000);

    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            buttonAdded = false;
            init();
        }
    }, 1000);
})();
