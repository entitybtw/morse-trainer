document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        targetChar: document.getElementById('target-char'),
        typedChar: document.getElementById('typed-char'),
        feedback: document.getElementById('feedback'),
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
        modeButtons: document.querySelectorAll('.mode-btn')
    };

    let currentMode = 'keyboard';
    let currentLayout = 'en';
    let trainingActive = false;
    let currentKey = '';
    let morseSymbol = '';
    
    let trainingData = {
        targetChar: '',
        currentRound: 0,
        totalRounds: 10,
        correct: 0,
        errors: 0,
        streak: 0,
        bestStreak: 0,
        sequence: [],
        started: false
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
            'а': 'ф', 'б': 'и', 'в': 'в', 'г': 'п', 'д': 'р',
            'е': 'о', 'ё': 'щ', 'ж': 'л', 'з': 'д', 'и': 'ь',
            'й': 'т', 'к': 'ы', 'л': 'м', 'м': 'ц', 'н': 'ч',
            'о': 'н', 'п': 'я', 'р': 'е', 'с': 'г', 'т': 'ш',
            'у': 'ю', 'ф': 'з', 'х': 'х', 'ц': 'ъ', 'ч': 'э',
            'ш': 'ж', 'щ': 'б', 'ъ': 'ё', 'ы': 'с', 'ь': 'м',
            'э': 'у', 'ю': 'к', 'я': 'а'
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
            ".-": "ф", "-...": "и", ".--": "в", "--.": "п", "-..": "л",
            ".": "т", "...-": "щ", "--..": "р", "..": "ы", ".---": "ь",
            "-.-": "о", ".-..": "д", "--": "м", "-.": "н", "---": "я",
            ".--.": "г", ".-.": "ш", "...": "у", "-": "е", "..-": "а",
            "..-.": "ж", "....": "х", "-.-.": "ц", "---.": "ч", "----": "б",
            "--.-": "ю", "--.--": "с", "-.--": "ь", ".-.-": "ъ", "..-..": "э",
            ".-.-.": "з"
        }
    };

    function init() {
        updateReference();
        setupEventListeners();
    }

    function updateReference() {
        const table = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        let html = '<div class="ref-grid">';
        
        Object.entries(table).forEach(([code, char]) => {
            if (char.length === 1 && char.match(/[a-zа-я]/i)) {
                html += `
                    <div class="ref-item">
                        <div class="ref-char">${char.toUpperCase()}</div>
                        <div class="ref-code">${code.replace(/\./g, '•').replace(/-/g, '—')}</div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        elements.refContent.innerHTML = html;
    }

    function setupEventListeners() {
        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                if (currentMode === 'keyboard') {
                    elements.keyboardInput.style.display = 'block';
                    elements.morseInput.style.display = 'none';
                    elements.hint.textContent = 'Нажмите соответствующую клавишу';
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

        elements.startBtn.addEventListener('click', () => {
            if (!trainingData.started) {
                startTraining();
            } else {
                restartTraining();
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

    function handleKeyPress(e) {
        if (!trainingActive || currentMode !== 'keyboard') return;
        
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        const key = e.key.toLowerCase();
        const keyMap = keyMaps[currentLayout];
        
        if (keyMap && keyMap[key]) {
            e.preventDefault();
            currentKey = key;
            elements.typedChar.textContent = currentKey.toUpperCase();
            
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
        
        elements.feedback.className = 'feedback';
        
        if (pressedChar === targetChar) {
            elements.feedback.textContent = `✓ Правильно! Нажали: ${currentKey.toUpperCase()}`;
            elements.feedback.classList.add('correct');
            
            trainingData.correct++;
            trainingData.streak++;
            if (trainingData.streak > trainingData.bestStreak) {
                trainingData.bestStreak = trainingData.streak;
            }
            
            setTimeout(() => {
                nextRound();
            }, 1000);
            
        } else {
            elements.feedback.textContent = `✗ Ошибка! Нужно было: ${targetChar.toUpperCase()}`;
            elements.feedback.classList.add('error');
            
            trainingData.errors++;
            trainingData.streak = 0;
            
            showCorrectKey();
        }
        
        updateStats();
        currentKey = '';
    }

    function showCorrectKey() {
        const targetChar = trainingData.targetChar.toLowerCase();
        const keyMap = keyMaps[currentLayout];
        
        let correctKey = '';
        for (const [key, value] of Object.entries(keyMap)) {
            if (value === targetChar) {
                correctKey = key;
                break;
            }
        }
        
        if (correctKey) {
            const originalText = elements.typedChar.textContent;
            elements.typedChar.textContent = correctKey.toUpperCase();
            elements.typedChar.style.color = 'var(--error)';
            
            setTimeout(() => {
                elements.typedChar.textContent = originalText;
                elements.typedChar.style.color = '';
                clearTypedChar();
            }, 2000);
        }
    }

    function autoCheckMorse() {
        if (!trainingActive || currentMode !== 'morse' || !morseSymbol) return;
        
        const table = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        const decodedChar = table[morseSymbol];
        
        elements.feedback.className = 'feedback';
        
        if (decodedChar) {
            elements.feedback.textContent = `Получен символ: ${decodedChar.toUpperCase()}`;
            elements.feedback.classList.add('correct');
            
            if (decodedChar.toLowerCase() === trainingData.targetChar.toLowerCase()) {
                elements.feedback.textContent = `✓ Правильно! ${trainingData.targetChar.toUpperCase()} = ${morseSymbol.replace(/\./g, '•').replace(/-/g, '—')}`;
                
                trainingData.correct++;
                trainingData.streak++;
                if (trainingData.streak > trainingData.bestStreak) {
                    trainingData.bestStreak = trainingData.streak;
                }
                
                setTimeout(() => {
                    nextRound();
                    clearMorseInput();
                }, 1000);
                
                updateStats();
            }
        } else {
            elements.feedback.textContent = "Неизвестный код Морзе";
            elements.feedback.classList.add('error');
        }
    }

    function clearMorseInput() {
        morseSymbol = '';
        elements.morseText.value = '';
        elements.feedback.className = 'feedback';
        elements.feedback.textContent = currentMode === 'morse' ? 'Введите код Морзе' : '';
    }

    function clearTypedChar() {
        currentKey = '';
        elements.typedChar.textContent = '—';
    }

    function startTraining() {
        trainingActive = true;
        trainingData.started = true;
        currentLayout = elements.layoutSelect.value;
        trainingData.totalRounds = parseInt(elements.roundsSelect.value);
        
        generateSequence();
        
        trainingData.currentRound = 0;
        trainingData.correct = 0;
        trainingData.errors = 0;
        trainingData.streak = 0;
        trainingData.bestStreak = 0;
        
        updateTargetChar();
        updateProgress();
        updateStats();
        
        elements.startBtn.textContent = '🔄 Перезапустить';
        elements.feedback.className = 'feedback';
        elements.feedback.textContent = currentMode === 'keyboard' ? 
            'Нажмите клавишу на клавиатуре' : 'Введите код Морзе';
        
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
            elements.hint.textContent = 'Нажмите соответствующую клавишу на клавиатуре';
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
                'Нажмите следующую клавишу' : 'Введите следующий код';
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
        const accuracy = Math.round((trainingData.correct / trainingData.totalRounds) * 100);
        
        elements.feedback.textContent = `Тренировка завершена! Точность: ${accuracy}%`;
        elements.feedback.className = 'feedback';
        
        elements.hint.textContent = `Нажмите "Перезапустить" чтобы начать заново`;
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
        
        const total = trainingData.correct + trainingData.errors;
        const accuracy = total > 0 ? Math.round((trainingData.correct / total) * 100) : 0;
        elements.accuracy.textContent = `${accuracy}%`;
    }

    init();
});
