// ==UserScript==
// @name         🔄 DeepSeek Asistan | Assistant
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  DeepSeek için otomatik retry ve continue | Auto retry and continue for DeepSeek
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
    let lastAction = '';
    let checkInterval = null;
    let isMinimized = false;
    let isDragging = false;
    let dragOffsetX, dragOffsetY;

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
            scan: "Tara",
            cancelScan: "Durdur",
            ready: "Hazır",
            scanStarted: "Tarama başladı",
            scanStopped: "Tarama durduruldu",
            retryClicked: "Yeniden dene tıklandı",
            continueClicked: "Devam et tıklandı",
            buttonNotFound: "Buton bulunamadı",
            noError: "Hata yok",
            foundSolution: "Çözüm bulundu",
            cancelScanMessage: "Tarama durdurulsun mu?",
            lastAction: "Son İşlem",
            resetStats: "Sıfırla",
            statsReset: "İstatistikler sıfırlandı",
            drag: "⤴ Sürükle"
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
            scan: "Scan",
            cancelScan: "Stop",
            ready: "Ready",
            scanStarted: "Scan started",
            scanStopped: "Scan stopped",
            retryClicked: "Retry clicked",
            continueClicked: "Continue clicked",
            buttonNotFound: "Button not found",
            noError: "No error",
            foundSolution: "Solution found",
            cancelScanMessage: "Stop scanning?",
            lastAction: "Last Action",
            resetStats: "Reset",
            statsReset: "Statistics reset",
            drag: "⤴ Drag"
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
            background: rgba(30, 41, 59, 0.95);
            color: white;
            padding: 16px;
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 2147483647;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 260px;
            user-select: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease;
        `;

        updatePanelContent(panel);
        document.body.appendChild(panel);
    }

    function updatePanelContent(panel = null) {
        if (!panel) panel = document.getElementById('ds-retry-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="panel-header" style="margin-bottom: ${isMinimized ? '0' : '16px'}; display: flex; align-items: center; justify-content: space-between;">
                <div style="font-weight: 600; color: rgba(255,255,255,0.9); font-size: 14px;">
                    ${t('title')}
                </div>
                <div class="panel-controls" style="display: flex; gap: 6px;">
                    <div id="dragHandle" class="panel-control" style="cursor: grab; padding: 4px 6px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 11px; display: flex; align-items: center;">
                        ${t('drag')}
                    </div>
                    <div id="languageToggle" class="panel-control" style="cursor: pointer; padding: 4px 6px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 11px; display: flex; align-items: center;">
                        ${currentLanguage.toUpperCase()}
                    </div>
                    <div id="panelMinimize" class="panel-control" style="cursor: pointer; padding: 4px 6px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 14px; font-weight: bold; display: flex; align-items: center;">
                        ${isMinimized ? '+' : '−'}
                    </div>
                </div>
            </div>

            <div class="panel-content" style="display: ${isMinimized ? 'none' : 'block'};">
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isEnabled ? '#10b981' : '#ef4444'};"></div>
                    <span style="color: rgba(255,255,255,0.7); font-size: 12px;">${t('status')}:</span>
                    <span id="retryStatus" style="color: ${isEnabled ? '#10b981' : '#ef4444'}; font-weight: 500;">
                        ${isEnabled ? '▶ ' + t('active') : '⏸ ' + t('passive')}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">🔄 ${t('retry')}</div>
                        <div id="totalClicks" style="font-size: 16px; font-weight: 600; color: #f59e0b;">${totalClicks}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">⏩ ${t('continue')}</div>
                        <div id="continueClicks" style="font-size: 16px; font-weight: 600; color: #60a5fa;">${continueClicks}</div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                        <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">📋 ${t('lastAction')}</div>
                        <div id="lastAction" style="font-size: 12px; font-weight: 500; color: #22c55e; min-height: 16px;">
                            ${lastAction || t('ready')}
                        </div>
                    </div>
                    <button id="resetStats" style="padding: 10px 12px; border: none; border-radius: 8px; cursor: pointer;
                        background: rgba(255, 255, 255, 0.05); color: rgba(255,255,255,0.8); font-weight: 500; font-size: 12px; 
                        transition: background 0.2s ease; white-space: nowrap; display: flex; align-items: center; justify-content: center;">
                        🔄 ${t('resetStats')}
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <button id="toggleRetry" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer;
                        background: ${isEnabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; 
                        color: white; font-weight: 500; font-size: 12px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        ${isEnabled ? '⏹️' : '▶'} ${isEnabled ? t('stop') : t('start')}
                    </button>
                    <button id="scanButton" style="padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer;
                        background: ${isScanning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'}; 
                        color: white; font-weight: 500; font-size: 12px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        ${isScanning ? '⏹️' : '🔍'} ${isScanning ? t('cancelScan') : t('scan')}
                    </button>
                </div>
            </div>
        `;

        // Event listener'ları yeniden ekle
        setTimeout(() => {
            const toggleBtn = panel.querySelector('#toggleRetry');
            const scanBtn = panel.querySelector('#scanButton');
            const minimizeBtn = panel.querySelector('#panelMinimize');
            const langBtn = panel.querySelector('#languageToggle');
            const resetBtn = panel.querySelector('#resetStats');
            const dragHandle = panel.querySelector('#dragHandle');

            if (toggleBtn) toggleBtn.onclick = toggleRetry;
            if (scanBtn) scanBtn.onclick = toggleScan;
            if (minimizeBtn) minimizeBtn.onclick = toggleMinimize;
            if (langBtn) langBtn.onclick = toggleLanguage;
            if (resetBtn) resetBtn.onclick = resetStatistics;
            if (dragHandle) {
                dragHandle.addEventListener('mousedown', startDragging);
            }
            
            // Hover efektleri
            const buttons = panel.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = btn.id === 'toggleRetry' 
                        ? isEnabled ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'
                        : btn.id === 'scanButton'
                        ? isScanning ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)'
                        : 'rgba(255, 255, 255, 0.1)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = btn.id === 'toggleRetry' 
                        ? isEnabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                        : btn.id === 'scanButton'
                        ? isScanning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)';
                });
            });
        }, 100);
    }

    function startDragging(e) {
        const panel = document.getElementById('ds-retry-panel');
        if (!panel) return;

        isDragging = true;
        dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
        dragOffsetY = e.clientY - panel.getBoundingClientRect().top;

        panel.style.cursor = 'grabbing';
        panel.style.transition = 'none';

        // Sürükleme için olay dinleyicileri
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!isDragging) return;

        const panel = document.getElementById('ds-retry-panel');
        if (!panel) return;

        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;

        // Ekran sınırlarını kontrol et
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;

        // Panel pozisyonunu doğrudan güncelle
        panel.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
        panel.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
        panel.style.right = 'unset';
    }

    function onMouseUp() {
        if (!isDragging) return;

        const panel = document.getElementById('ds-retry-panel');
        if (panel) {
            panel.style.cursor = 'default';
            panel.style.transition = 'transform 0.2s ease';
        }

        isDragging = false;
        
        // Olay dinleyicileri kaldır
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
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
        const lastActionEl = panel.querySelector('#lastAction');
        const minimizeBtn = panel.querySelector('#panelMinimize');

        if (statusEl) {
            statusEl.textContent = isEnabled ? '▶ ' + t('active') : '⏸ ' + t('passive');
            statusEl.style.color = isEnabled ? '#10b981' : '#ef4444';
        }
        if (statusDot) {
            statusDot.style.background = isEnabled ? '#10b981' : '#ef4444';
        }
        if (clicksEl) clicksEl.textContent = totalClicks;
        if (continueEl) continueEl.textContent = continueClicks;
        if (lastActionEl) lastActionEl.textContent = lastAction || t('ready');
        if (minimizeBtn) minimizeBtn.textContent = isMinimized ? '+' : '−';
        if (toggleBtn) {
            toggleBtn.innerHTML = `${isEnabled ? '⏹️' : '▶'} ${isEnabled ? t('stop') : t('start')}`;
            toggleBtn.style.background = isEnabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        }
        if (scanBtn) {
            scanBtn.innerHTML = `${isScanning ? '⏹️' : '🔍'} ${isScanning ? t('cancelScan') : t('scan')}`;
            scanBtn.style.background = isScanning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
        }

        const langBtn = panel.querySelector('#languageToggle');
        if (langBtn) langBtn.textContent = currentLanguage.toUpperCase();
        
        // Panel içeriğini göster/gizle
        const panelContent = panel.querySelector('.panel-content');
        if (panelContent) {
            panelContent.style.display = isMinimized ? 'none' : 'block';
        }
        
        // Panel header margin ayarı
        const panelHeader = panel.querySelector('.panel-header');
        if (panelHeader) {
            panelHeader.style.marginBottom = isMinimized ? '0' : '16px';
        }
    }

    function updateStatus(message) {
        // Durum mesajını son işlem bölümüne taşı
        lastAction = message;
        updatePanel();
    }

    function updateLastAction(action) {
        lastAction = action;
        updatePanel();
    }

    function resetStatistics() {
        totalClicks = 0;
        continueClicks = 0;
        lastAction = t('ready');
        updatePanel();
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
        updatePanelContent();
        updateStatus(currentLanguage === 'tr' ? 'Dil Türkçe' : 'Language English');
    }

    function toggleMinimize() {
        isMinimized = !isMinimized;
        updatePanel();
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
            isScanning = false;
            updateStatus(t('scanStopped'));
            updatePanel();
        } else {
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
                if (!isScanning) return;
                continueButton.click();
                continueClicks++;
                updateLastAction(t('continueClicked'));
                isScanning = false;
                updatePanel();
            }, RETRY_DELAY);
            return;
        }

        const retryElement = findRetryElement();
        if (retryElement) {
            setTimeout(() => {
                if (!isScanning) return;
                retryElement.click();
                totalClicks++;
                updateLastAction(t('retryClicked'));
                isScanning = false;
                updatePanel();
            }, RETRY_DELAY);
            return;
        }

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
                updateLastAction(t('continueClicked'));
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
                    updateLastAction(t('retryClicked'));
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