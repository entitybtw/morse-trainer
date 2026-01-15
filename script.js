document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        targetChar: document.getElementById('target-char'),
        typedChar: document.getElementById('typed-char'),
        feedback: document.getElementById('feedback'),
        errorMessage: document.getElementById('error-message'),
        hint: document.getElementById('hint'),
        progressFill: document.getElementById('progress-fill'),
        currentRound: document.getElementById('current-round'),
        totalRounds: document.getElementById('total-rounds'),
        correctCount: document.getElementById('correct-count'),
        errorCount: document.getElementById('error-count'),
        streakCount: document.getElementById('streak-count'),
        accuracy: document.getElementById('accuracy'),
        startBtn: document.getElementById('start-btn'),
        layoutSelect: document.getElementById('layout-select'),
        roundsSelect: document.getElementById('rounds-select'),
        keyboardInput: document.getElementById('keyboard-input'),
        morseInput: document.getElementById('morse-input'),
        morseText: document.getElementById('morse-text'),
        clearBtn: document.getElementById('clear-btn'),
        toggleRef: document.getElementById('toggle-ref'),
        refContent: document.getElementById('ref-content'),
        modeButtons: document.querySelectorAll('.mode-btn'),
        clearRecordsBtn: document.getElementById('clear-records-btn'),
        editNameBtn: document.getElementById('edit-name-btn'),
        keyboardRecords: document.getElementById('keyboard-records'),
        morseRecords: document.getElementById('morse-records'),
        recordTabs: document.querySelectorAll('.record-tab'),
        nameModal: document.getElementById('name-modal'),
        playerNameInput: document.getElementById('player-name'),
        saveNameBtn: document.getElementById('save-name-btn'),
        cancelNameBtn: document.getElementById('cancel-name-btn')
    };

    let currentMode = 'keyboard';
    let currentLayout = 'en';
    let trainingActive = false;
    let currentKey = '';
    let morseSymbol = '';
    
    let playerName = '';
    
    let trainingData = {
        targetChar: '',
        currentRound: 0,
        totalRounds: 10,
        correct: 0,
        errors: 0,
        streak: 0,
        bestStreak: 0,
        sequence: [],
        started: false,
        startTime: null,
        endTime: null,
        typedChars: 0,
        correctChars: 0
    };

    let records = {
        keyboard: [],
        morse: []
    };

    const keyMaps = {
        en: {
            'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e',
            'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'j',
            'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o',
            'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't',
            'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y',
            'z': 'z'
        },
        ru: {
            'а': 'а', 'б': 'б', 'в': 'в', 'г': 'г', 'д': 'д',
            'е': 'е', 'ж': 'ж', 'з': 'з', 'и': 'и',
            'й': 'й', 'к': 'к', 'л': 'л', 'м': 'м', 'н': 'н',
            'о': 'о', 'п': 'п', 'р': 'р', 'с': 'с', 'т': 'т',
            'у': 'у', 'ф': 'ф', 'х': 'х', 'ц': 'ц', 'ч': 'ч',
            'ш': 'ш', 'щ': 'щ', 'ъ': 'ъ', 'ы': 'ы', 'ь': 'ь',
            'э': 'э', 'ю': 'ю', 'я': 'я'
        }
    };

    const morseTables = {
        en: {
            ".-": "a", "-...": "b", "-.-.": "c", "-..": "d", ".": "e",
            "..-.": "f", "--.": "g", "....": "h", "..": "i", ".---": "j",
            "-.-": "k", ".-..": "l", "--": "m", "-.": "n", "---": "o",
            ".--.": "p", "--.-": "q", ".-.": "r", "...": "s", "-": "t",
            "..-": "u", "...-": "v", ".--": "w", "-..-": "x", "-.--": "y",
            "--..": "z"
        },
        ru: {
            ".-": "а", "-...": "б", ".--": "в", "--.": "г", "-..": "д", ".": "е",
            "...-": "ж", "--..": "з", "..": "и", ".---": "й", "-.-": "к", ".-..": "л",
            "--": "м", "-.": "н", "---": "о", ".--.": "п", ".-.": "р", "...": "с", "-": "т", "..-": "у", "..-.": "ф",
            "....": "х", "-.-.": "ц", "---.": "ч", "----": "ш", "--.-": "щ", ".--.-.": "ъ",
            "-.--": "ы", "-..-": "ь", "...-...": "э", "..--": "ю", ".-.-": "я"
        }
    };

    function init() {
        loadRecords();
        loadPlayerName();
        updateReference();
        setupEventListeners();
        updateRecordsDisplay();
    }

    function loadRecords() {
        const saved = localStorage.getItem('morseTrainerRecords');
        if (saved) {
            records = JSON.parse(saved);
        }
    }

    function saveRecords() {
        localStorage.setItem('morseTrainerRecords', JSON.stringify(records));
    }

    function loadPlayerName() {
        const savedName = localStorage.getItem('morseTrainerPlayerName');
        if (savedName) {
            playerName = savedName;
        } else {
            setTimeout(showNameModal, 500);
        }
    }

    function savePlayerName() {
        localStorage.setItem('morseTrainerPlayerName', playerName);
    }

    function updateRecordsDisplay() {
        updateRecordsList('keyboard');
        updateRecordsList('morse');
    }

    function updateRecordsList(mode) {
        const listElement = mode === 'keyboard' ? elements.keyboardRecords : elements.morseRecords;
        const modeRecords = records[mode];
        
        if (!modeRecords || modeRecords.length === 0) {
            listElement.innerHTML = `
                <div class="no-records">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                    </svg>
                    <p>Пока нет рекордов</p>
                    <p style="font-size: 14px; margin-top: 8px;">Пройдите тренировку, чтобы установить рекорд!</p>
                </div>
            `;
            return;
        }

        let html = '';
        modeRecords.forEach((record, index) => {
            const isCurrent = record.id === trainingData.currentRecordId;
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            
            html += `
                <div class="record-item ${isCurrent ? 'current' : ''}">
                    <div class="record-rank ${rankClass}">${index + 1}</div>
                    <div class="record-info">
                        <div class="record-player">${record.playerName || 'Аноним'}</div>
                        <div class="record-details">
                            ${record.mode === 'keyboard' ? '⌨️' : '••---'} • 
                            ${record.layout === 'ru' ? 'Русская' : 'Английская'} • 
                            ${formatDate(record.date)}
                        </div>
                    </div>
                    <div class="record-score">
                        <div class="record-accuracy">${record.charAccuracy}%</div>
                        <div class="record-details">
                            <span>${record.correct}</span> из <span>${record.total}</span>
                            ${record.time ? ` • ${record.time}с` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        listElement.innerHTML = html;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function updateReference() {
        const table = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        let html = '<div class="ref-grid">';
        
        Object.entries(table).forEach(([code, char]) => {
            if (char.length === 1 && char.match(/[a-zа-я]/i)) {
                const formattedCode = code.split('').join(' ');
                
                html += `
                    <div class="ref-item">
                        <div class="ref-char">${char.toUpperCase()}</div>
                        <div class="ref-code">${formattedCode.replace(/\./g, '•').replace(/-/g, '—')}</div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        elements.refContent.innerHTML = html;
    }

    function setupEventListeners() {
        elements.editNameBtn.addEventListener('click', showNameModal);
        
        elements.saveNameBtn.addEventListener('click', () => {
            const name = elements.playerNameInput.value.trim();
            if (name) {
                playerName = name;
                savePlayerName();
                elements.nameModal.style.display = 'none';
                updateRecordsDisplay();
            }
        });
        
        elements.cancelNameBtn.addEventListener('click', () => {
            elements.nameModal.style.display = 'none';
            if (!playerName) {
                playerName = 'Аноним';
                savePlayerName();
            }
        });
        
        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                if (currentMode === 'keyboard') {
                    elements.keyboardInput.style.display = 'block';
                    elements.morseInput.style.display = 'none';
                    elements.hint.textContent = 'Наберите соответствующий символ';
                    clearMorseInput();
                } else {
                    elements.keyboardInput.style.display = 'none';
                    elements.morseInput.style.display = 'block';
                    elements.hint.textContent = 'Введите код Морзе';
                    clearTypedChar();
                }
                
                if (trainingActive) {
                    updateHint();
                }
            });
        });

        elements.recordTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.recordTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const mode = tab.dataset.mode;
                elements.keyboardRecords.style.display = mode === 'keyboard' ? 'block' : 'none';
                elements.morseRecords.style.display = mode === 'morse' ? 'block' : 'none';
            });
        });

        elements.startBtn.addEventListener('click', () => {
            if (!trainingData.started) {
                startTraining();
            } else {
                restartTraining();
            }
        });

        elements.clearRecordsBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить все рекорды? Это действие нельзя отменить.')) {
                records = { keyboard: [], morse: [] };
                saveRecords();
                updateRecordsDisplay();
            }
        });

        elements.layoutSelect.addEventListener('change', () => {
            currentLayout = elements.layoutSelect.value;
            updateReference();
            if (trainingActive) {
                generateSequence();
                updateTargetChar();
            }
        });

        elements.clearBtn.addEventListener('click', clearMorseInput);

        elements.morseText.addEventListener('input', function(e) {
            const val = e.target.value.replace(/[^.-]/g, '');
            morseSymbol = val;
            e.target.value = val;
            
            if (trainingActive) {
                autoCheckMorse();
            }
        });

        document.querySelectorAll('.btn[data-char]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!trainingActive) return;
                morseSymbol += btn.dataset.char;
                elements.morseText.value = morseSymbol;
                elements.morseText.focus();
                autoCheckMorse();
            });
        });

        elements.toggleRef.addEventListener('click', () => {
            elements.refContent.classList.toggle('visible');
            elements.toggleRef.textContent = 
                elements.refContent.classList.contains('visible') ? 'Скрыть' : 'Показать';
        });

        document.addEventListener('keydown', handleKeyPress);
    }

    function showNameModal() {
        elements.playerNameInput.value = playerName || '';
        elements.nameModal.style.display = 'flex';
        elements.playerNameInput.focus();
    }

    function handleKeyPress(e) {
        if (!trainingActive || currentMode !== 'keyboard') return;
        
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        const key = e.key.toLowerCase();
        const keyMap = keyMaps[currentLayout];
        
        if (keyMap && keyMap[key]) {
            e.preventDefault();
            currentKey = key;
            elements.typedChar.textContent = currentKey.toUpperCase();
            elements.typedChar.classList.remove('error');
            trainingData.typedChars++;
            
            setTimeout(() => {
                checkKeyboardAnswer();
            }, 100);
        }
    }

    function checkKeyboardAnswer() {
        if (!currentKey || !trainingActive) return;
        
        const keyMap = keyMaps[currentLayout];
        const pressedChar = keyMap[currentKey];
        const targetChar = trainingData.targetChar.toLowerCase();
        
        elements.errorMessage.style.display = 'none';
        elements.errorMessage.textContent = '';
        elements.feedback.className = 'feedback';
        
        if (pressedChar === targetChar) {
            elements.feedback.textContent = `✓ Правильно! Нажали: ${currentKey.toUpperCase()}`;
            elements.feedback.classList.add('correct');
            
            trainingData.correct++;
            trainingData.correctChars++;
            trainingData.streak++;
            if (trainingData.streak > trainingData.bestStreak) {
                trainingData.bestStreak = trainingData.streak;
            }
            
            setTimeout(() => {
                nextRound();
            }, 1000);
            
        } else {
            elements.feedback.textContent = '';
            elements.errorMessage.textContent = `✗ Ошибка! Пропущена буква ${trainingData.targetChar.toUpperCase()}`;
            elements.errorMessage.style.display = 'block';
            
            elements.typedChar.classList.add('error');
            
            trainingData.errors++;
            trainingData.streak = 0;
            
            setTimeout(() => {
                elements.errorMessage.style.display = 'none';
                clearTypedChar();
                skipRound();
            }, 2000);
        }
        
        updateStats();
        currentKey = '';
    }

    function skipRound() {
        trainingData.currentRound++;
        updateProgress();
        
        if (trainingData.currentRound < trainingData.totalRounds) {
            updateTargetChar();
            clearTypedChar();
            clearMorseInput();
            elements.feedback.textContent = currentMode === 'keyboard' ? 
                'Нажмите следующий символ' : 'Введите следующий код';
            elements.feedback.className = 'feedback';
            
            if (currentMode === 'morse') {
                elements.morseText.focus();
            }
        } else {
            finishTraining();
        }
    }

    function autoCheckMorse() {
        if (!trainingActive || currentMode !== 'morse' || !morseSymbol) return;
        
        const table = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        const decodedChar = table[morseSymbol];
        
        elements.errorMessage.style.display = 'none';
        elements.errorMessage.textContent = '';
        elements.feedback.className = 'feedback';
        
        if (decodedChar) {
            trainingData.typedChars++;
            
            if (decodedChar.toLowerCase() === trainingData.targetChar.toLowerCase()) {
                elements.feedback.textContent = `✓ Правильно! ${trainingData.targetChar.toUpperCase()} = ${morseSymbol.replace(/\./g, '•').replace(/-/g, '—')}`;
                elements.feedback.classList.add('correct');
                
                trainingData.correct++;
                trainingData.correctChars++;
                trainingData.streak++;
                if (trainingData.streak > trainingData.bestStreak) {
                    trainingData.bestStreak = trainingData.streak;
                }
                
                setTimeout(() => {
                    nextRound();
                    clearMorseInput();
                }, 1000);
                
                updateStats();
            } else {
                elements.feedback.textContent = `✗ Ошибка! ${decodedChar.toUpperCase()} ≠ ${trainingData.targetChar.toUpperCase()}`;
                elements.feedback.classList.add('error');
                elements.feedback.textContent = `✗ Ошибка! Пропущена буква ${trainingData.targetChar.toUpperCase()}`;
                
                trainingData.errors++;
                trainingData.streak = 0;
                
                setTimeout(() => {
                    clearMorseInput();
                    skipRound();
                }, 2000);
                
                updateStats();
            }
        } else {
            elements.feedback.textContent = "Ввод не завершен";
        }
    }

    function clearMorseInput() {
        morseSymbol = '';
        elements.morseText.value = '';
        elements.feedback.className = 'feedback';
        elements.feedback.textContent = currentMode === 'morse' ? 'Введите код Морзе' : '';
        elements.errorMessage.style.display = 'none';
    }

    function clearTypedChar() {
        currentKey = '';
        elements.typedChar.textContent = '—';
        elements.typedChar.classList.remove('error');
        elements.errorMessage.style.display = 'none';
    }

    function startTraining() {
        trainingActive = true;
        trainingData.started = true;
        currentLayout = elements.layoutSelect.value;
        trainingData.totalRounds = parseInt(elements.roundsSelect.value);
        trainingData.startTime = new Date();
        
        generateSequence();
        
        trainingData.currentRound = 0;
        trainingData.correct = 0;
        trainingData.errors = 0;
        trainingData.streak = 0;
        trainingData.bestStreak = 0;
        trainingData.typedChars = 0;
        trainingData.correctChars = 0;
        
        updateTargetChar();
        updateProgress();
        updateStats();
        
        elements.startBtn.textContent = '🔄 Перезапустить';
        elements.feedback.className = 'feedback';
        elements.feedback.textContent = currentMode === 'keyboard' ? 
            'Наберите символ' : 'Введите код Морзе';
        
        elements.errorMessage.style.display = 'none';
        
        updateHint();
        
        if (currentMode === 'morse') {
            elements.morseText.focus();
        }
    }

    function restartTraining() {
        clearTypedChar();
        clearMorseInput();
        startTraining();
    }

    function generateSequence() {
        trainingData.sequence = [];
        const table = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        const chars = Object.values(table).filter(c => c.length === 1 && c.match(/[a-zа-я]/i));
        
        for (let i = 0; i < trainingData.totalRounds; i++) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            trainingData.sequence.push(randomChar);
        }
    }

    function updateTargetChar() {
        if (trainingData.sequence[trainingData.currentRound]) {
            trainingData.targetChar = trainingData.sequence[trainingData.currentRound];
            elements.targetChar.textContent = trainingData.targetChar.toUpperCase();
        }
    }

    function updateHint() {
        if (currentMode === 'keyboard') {
            elements.hint.textContent = 'Нажмите соответствующий символ';
        } else {
            elements.hint.textContent = 'Введите код Морзе (точки и тире)';
        }
    }

    function nextRound() {
        trainingData.currentRound++;
        updateProgress();
        
        if (trainingData.currentRound < trainingData.totalRounds) {
            updateTargetChar();
            clearTypedChar();
            clearMorseInput();
            elements.feedback.textContent = currentMode === 'keyboard' ? 
                'Нажмите следующий символ' : 'Введите следующий код';
            elements.feedback.className = 'feedback';
            
            if (currentMode === 'morse') {
                elements.morseText.focus();
            }
        } else {
            finishTraining();
        }
    }

    function finishTraining() {
        trainingActive = false;
        trainingData.endTime = new Date();
        const timeDiff = (trainingData.endTime - trainingData.startTime) / 1000;
        const charAccuracy = trainingData.typedChars > 0 ? 
            Math.round((trainingData.correctChars / trainingData.typedChars) * 100) : 0;
        const roundAccuracy = Math.round((trainingData.correct / trainingData.totalRounds) * 100);
        
        elements.feedback.textContent = `Тренировка завершена! Точность по буквам: ${charAccuracy}% (${roundAccuracy}% по раундам) • Время: ${timeDiff.toFixed(1)}с`;
        elements.feedback.className = 'feedback';
        
        elements.hint.textContent = `Нажмите "Перезапустить" чтобы начать заново`;
        
        saveRecord(charAccuracy, roundAccuracy, timeDiff);
    }

    function saveRecord(charAccuracy, roundAccuracy, time) {
        const record = {
            id: Date.now(),
            playerName: playerName || 'Аноним',
            mode: currentMode,
            layout: currentLayout,
            date: new Date().toISOString(),
            correct: trainingData.correct,
            total: trainingData.totalRounds,
            charAccuracy: charAccuracy,
            roundAccuracy: roundAccuracy,
            time: time.toFixed(1),
            bestStreak: trainingData.bestStreak,
            typedChars: trainingData.typedChars,
            correctChars: trainingData.correctChars
        };
        
        records[currentMode].push(record);
        
        records[currentMode].sort((a, b) => {
            if (b.charAccuracy !== a.charAccuracy) return b.charAccuracy - a.charAccuracy;
            if (b.roundAccuracy !== a.roundAccuracy) return b.roundAccuracy - a.roundAccuracy;
            return a.time - b.time;
        });
        
        records[currentMode] = records[currentMode].slice(0, 10);
        
        trainingData.currentRecordId = record.id;
        
        saveRecords();
        updateRecordsDisplay();
    }

    function updateProgress() {
        const percent = (trainingData.currentRound / trainingData.totalRounds) * 100;
        elements.progressFill.style.width = `${percent}%`;
        elements.currentRound.textContent = trainingData.currentRound;
        elements.totalRounds.textContent = trainingData.totalRounds;
    }

    function updateStats() {
        elements.correctCount.textContent = trainingData.correct;
        elements.errorCount.textContent = trainingData.errors;
        elements.streakCount.textContent = trainingData.streak;
        
        const charAccuracy = trainingData.typedChars > 0 ? 
            Math.round((trainingData.correctChars / trainingData.typedChars) * 100) : 0;
        elements.accuracy.textContent = `${charAccuracy}%`;
    }

    init();
});