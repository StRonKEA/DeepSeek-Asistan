// ==UserScript==
// @name         🔄 DeepSeek Asistan
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  DeepSeek için otomatik retry ve continue
// @author       Siz
// @match        https://chat.deepseek.com/*
// @match        https://*.deepseek.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000;
    const CHECK_INTERVAL = 3000;

    let isEnabled = false;
    let isScanning = false;
    let retryCount = 0;
    let totalClicks = 0;
    let continueClicks = 0;
    let checkInterval = null;

    const translations = {
        tr: {
            title: "🔄 DeepSeek Asistan",
            status: "Durum",
            active: "AKTİF",
            passive: "PASİF",
            retry: "Yeniden Dene",
            continue: "Devam Et",
            start: "Başlat",
            stop: "Durdur",
            scan: "🔍 Tara",
            cancelScan: "⏹️ Durdur",
            ready: "Hazır",
            scanStarted: "Tarama başladı",
            scanStopped: "Tarama durduruldu",
            retryClicked: "Yeniden dene tıklandı",
            continueClicked: "Devam et tıklandı",
            buttonNotFound: "Buton bulunamadı",
            noError: "Hata yok",
            foundSolution: "Çözüm bulundu",
            cancelScanMessage: "Tarama durdurulsun mu?"
        },
        en: {
            title: "🔄 DeepSeek Assistant",
            status: "Status",
            active: "ACTIVE",
            passive: "PASSIVE",
            retry: "Retry",
            continue: "Continue",
            start: "Start",
            stop: "Stop",
            scan: "🔍 Scan",
            cancelScan: "⏹️ Stop",
            ready: "Ready",
            scanStarted: "Scan started",
            scanStopped: "Scan stopped",
            retryClicked: "Retry clicked",
            continueClicked: "Continue clicked",
            buttonNotFound: "Button not found",
            noError: "No error",
            foundSolution: "Solution found",
            cancelScanMessage: "Stop scanning?"
        }
    };

    let currentLanguage = 'tr';

    function t(key) {
        return translations[currentLanguage][key] || key;
    }

    function createPanel() {
        if (document.getElementById('ds-retry-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'ds-retry-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            padding: 16px;
            border-radius: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            z-index: 2147483647;
            border: 2px solid #60a5fa;
            width: 250px;
            user-select: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `;

        updatePanelContent(panel);
        document.body.appendChild(panel);

        panel.querySelector('#toggleRetry').onclick = toggleRetry;
        panel.querySelector('#scanButton').onclick = toggleScan;
        panel.querySelector('#panelMinimize').onclick = toggleMinimize;
        panel.querySelector('#languageToggle').onclick = toggleLanguage;
    }

    function updatePanelContent(panel = null) {
        if (!panel) panel = document.getElementById('ds-retry-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="font-weight: 600; color: #60a5fa; font-size: 14px;">
                    ${t('title')}
                </div>
                <div id="panelMinimize" style="cursor: pointer; padding: 4px; color: #94a3b8; font-size: 16px; font-weight: bold;">
                    −
                </div>
            </div>

            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isEnabled ? '#10b981' : '#ef4444'};"></div>
                <span style="color: #94a3b8; font-size: 12px;">${t('status')}:</span>
                <span id="retryStatus" style="color: ${isEnabled ? '#10b981' : '#ef4444'}; font-weight: 500;">
                    ${isEnabled ? t('active') : t('passive')}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">${t('retry')}</div>
                    <div id="totalClicks" style="font-size: 16px; font-weight: 600; color: #f59e0b;">${totalClicks}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">${t('continue')}</div>
                    <div id="continueClicks" style="font-size: 16px; font-weight: 600; color: #60a5fa;">${continueClicks}</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <button id="toggleRetry" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer;
                    background: ${isEnabled ? '#ef4444' : '#10b981'}; color: white; font-weight: 500; font-size: 12px;">
                    ${isEnabled ? t('stop') : t('start')}
                </button>
                <button id="scanButton" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer;
                    background: ${isScanning ? '#ef4444' : '#3b82f6'}; color: white; font-weight: 500; font-size: 12px;">
                    ${isScanning ? t('cancelScan') : t('scan')}
                </button>
            </div>

            <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; margin-bottom: 8px;">
                <div id="lastError" style="font-size: 11px; color: #22c55e; text-align: center; min-height: 14px;">
                    ${t('ready')}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 10px; color: #64748b;">
                    v1.1
                </div>
                <div id="languageToggle" style="cursor: pointer; color: #64748b; font-size: 10px; padding: 4px 8px;
                    background: rgba(255,255,255,0.1); border-radius: 8px;">
                    ${currentLanguage.toUpperCase()}
                </div>
            </div>
        `;

        // Event listener'ları yeniden ekle
        setTimeout(() => {
            const toggleBtn = panel.querySelector('#toggleRetry');
            const scanBtn = panel.querySelector('#scanButton');
            const minimizeBtn = panel.querySelector('#panelMinimize');
            const langBtn = panel.querySelector('#languageToggle');

            if (toggleBtn) toggleBtn.onclick = toggleRetry;
            if (scanBtn) scanBtn.onclick = toggleScan;
            if (minimizeBtn) minimizeBtn.onclick = toggleMinimize;
            if (langBtn) langBtn.onclick = toggleLanguage;
        }, 100);
    }

    function updatePanel() {
        const panel = document.getElementById('ds-retry-panel');
        if (!panel) return;

        const statusEl = panel.querySelector('#retryStatus');
        const statusDot = panel.querySelector('div[style*="width: 8px; height: 8px;"]');
        const clicksEl = panel.querySelector('#totalClicks');
        const continueEl = panel.querySelector('#continueClicks');
        const toggleBtn = panel.querySelector('#toggleRetry');
        const scanBtn = panel.querySelector('#scanButton');

        if (statusEl) statusEl.textContent = isEnabled ? t('active') : t('passive');
        if (statusDot) statusDot.style.background = isEnabled ? '#10b981' : '#ef4444';
        if (clicksEl) clicksEl.textContent = totalClicks;
        if (continueEl) continueEl.textContent = continueClicks;
        if (toggleBtn) {
            toggleBtn.textContent = isEnabled ? t('stop') : t('start');
            toggleBtn.style.background = isEnabled ? '#ef4444' : '#10b981';
        }
        if (scanBtn) {
            scanBtn.textContent = isScanning ? t('cancelScan') : t('scan');
            scanBtn.style.background = isScanning ? '#ef4444' : '#3b82f6';
        }

        const langBtn = panel.querySelector('#languageToggle');
        if (langBtn) langBtn.textContent = currentLanguage.toUpperCase();
    }

    function updateStatus(message) {
        const panel = document.getElementById('ds-retry-panel');
        if (panel) {
            const errorEl = panel.querySelector('#lastError');
            if (errorEl) errorEl.textContent = message;
        }
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
        updatePanelContent(); // Tüm panel içeriğini yeniden oluştur
        updateStatus(currentLanguage === 'tr' ? 'Dil Türkçe' : 'Language English');
    }

    function toggleMinimize() {
        const panel = document.getElementById('ds-retry-panel');
        if (panel) {
            const isMinimized = panel.style.height === '40px';
            panel.style.height = isMinimized ? '' : '40px';
            panel.style.overflow = isMinimized ? '' : 'hidden';
            panel.querySelector('#panelMinimize').textContent = isMinimized ? '−' : '+';
        }
    }

    function toggleRetry() {
        isEnabled = !isEnabled;
        if (isEnabled) {
            startMonitoring();
            updateStatus(t('active'));
        } else {
            stopMonitoring();
            updateStatus(t('passive'));
        }
        updatePanel();
    }

    function toggleScan() {
        if (isScanning) {
            // Tarama zaten aktifse, durdur
            isScanning = false;
            updateStatus(t('scanStopped'));
            updatePanel();
        } else {
            // Tarama başlat
            isScanning = true;
            updateStatus(t('scanStarted'));
            updatePanel();
            performSmartScan();
        }
    }

    function performSmartScan() {
        if (!isScanning) return;

        const continueButton = findContinueButton();
        if (continueButton) {
            setTimeout(() => {
                if (!isScanning) return; // Tarama durdurulduysa devam etme
                continueButton.click();
                continueClicks++;
                updatePanel();
                updateStatus(t('foundSolution'));
                isScanning = false;
                updatePanel();
            }, RETRY_DELAY);
            return;
        }

        const retryElement = findRetryElement();
        if (retryElement) {
            setTimeout(() => {
                if (!isScanning) return; // Tarama durdurulduysa devam etme
                retryElement.click();
                totalClicks++;
                updatePanel();
                updateStatus(t('foundSolution'));
                isScanning = false;
                updatePanel();
            }, RETRY_DELAY);
            return;
        }

        // Hiçbir buton bulunamazsa
        setTimeout(() => {
            if (!isScanning) return;
            updateStatus(t('buttonNotFound'));
            isScanning = false;
            updatePanel();
        }, 1000);
    }

    function startMonitoring() {
        stopMonitoring();
        checkInterval = setInterval(performRetry, CHECK_INTERVAL);
    }

    function stopMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    }

    function findRetryElement() {
        return document.querySelector('.ds-icon-button.a3b9bd76._76a2310');
    }

    function findContinueButton() {
        const buttons = document.querySelectorAll('[role="button"]');
        for (const button of buttons) {
            if (button.textContent && button.textContent.includes('Continue') && button.querySelector('svg')) {
                return button;
            }
        }
        return null;
    }

    function hasErrorMessage() {
        const errorSpan = document.querySelector('span.ce66e6df');
        if (errorSpan && errorSpan.textContent.includes('Server busy, please try again later')) {
            return true;
        }
        return document.body.textContent.includes('Server busy, please try again later');
    }

    function performRetry() {
        if (!isEnabled) return;

        if (retryCount >= MAX_RETRIES) {
            updateStatus(t('buttonNotFound'));
            return;
        }

        const continueButton = findContinueButton();
        if (continueButton) {
            setTimeout(() => {
                continueButton.click();
                continueClicks++;
                updatePanel();
                updateStatus(t('continueClicked'));
            }, RETRY_DELAY);
            return;
        }

        if (hasErrorMessage()) {
            const retryElement = findRetryElement();
            if (retryElement) {
                retryCount++;
                setTimeout(() => {
                    retryElement.click();
                    totalClicks++;
                    updatePanel();
                    updateStatus(t('retryClicked'));
                }, RETRY_DELAY);
            } else {
                updateStatus(t('buttonNotFound'));
            }
        } else {
            retryCount = 0;
            updateStatus(t('noError'));
        }
    }

    function init() {
        if (document.body) {
            createPanel();
            updateStatus(t('ready'));
        } else {
            setTimeout(init, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();