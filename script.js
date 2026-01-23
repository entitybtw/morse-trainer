document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        targetChar: document.getElementById('target-char'),
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
        symbolModeSelect: document.getElementById('symbol-mode-select'),
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
        cancelNameBtn: document.getElementById('cancel-name-btn'),
        keyboardInputField: document.getElementById('keyboard-input-field')
    };

    let currentMode = 'keyboard';
    let currentLayout = 'en';
    let symbolMode = 'letters';
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

    const keyMapsNumbers = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9"
    };

    const keyMapsPunctuation = {
        ".": ".", ",": ",", "…": "…", "?": "?", "!": "!", 
        "\"": "\"", "-": "-", "'": "'", "(": "(", ")": ")", 
        ":": ":", ";": ";", "/": "/", "=": "=", "&": "&", "@": "@"
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
        },
        numbers: {
            "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4", 
            ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9"
        },
        punctuation: {
            ".-.-.-": ".", "--..--": ",", "---...": "…",
            "..--..": "?", "-.-.--": "!", ".----.": "\"", "-....-": "-", 
            ".-..-.": "'", "-.--.": "(", "-.--.-": ")", 
            "...-..-": ":", "...-.-": ";", "..-.-.": "/", 
            "-...-": "=", ".-...": "&", "...-.": "@"
        },
        punctuationRu: {
            ".-.-.-": ".", "--..--": ",", "..--..": "?", "-.-.--": "!", 
            ".----.": "'", "-....-": "-", ".-..-.": "\"", "-.--.": "(",
            "-.--.-": ")", "...-..-": ":", "...-.-": ";", "..-.-.": "/",
            "-...-": "=", ".-...": "&", "...-.": "@"
        }
    };

    const russianPunctuationCodes = {
        "ТЧК": ".",        // NXR → ТЧК
        "ЗПТ": ",",        // PGN → ЗПТ  
        "ВОПР": "?",       // DJGH → ВОПР
        "ВОСКЛ": "!",      // DJCRK → ВОСКЛ
        "КТЧК": "'",       // RDXR → КТЧК
        "ДЕФ": "-",        // LTA → ДЕФ
        "АПСН": "\"",      // FGCNH → АПСН
        "СКО": "(",        // CRJ → СКО
        "СКЗ": ")",        // CRP → СКЗ
        "ДВТЧ": ":",       // LDNX → ДВТЧ
        "ТЗПТ": ";",       // NPGN → ТЗПТ
        "ДРО<": "/",       // LHJ< → ДРО<
        "РВН": "=",        // HDY → РВН
        "И": "&",          // B → И
        "СО<": "@"         // CJ< → СО<
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
            const symbolModeText = getSymbolModeText(record.symbolMode);
            
            html += `
                <div class="record-item ${isCurrent ? 'current' : ''}">
                    <div class="record-rank ${rankClass}">${index + 1}</div>
                    <div class="record-info">
                        <div class="record-player">${record.playerName || 'Аноним'}</div>
                        <div class="record-details">
                            ${record.mode === 'keyboard' ? '⌨️' : '••---'} • 
                            ${record.layout === 'ru' ? 'Русская' : 'Английская'} • 
                            ${symbolModeText} • 
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

    function getSymbolModeText(symbolMode) {
        switch(symbolMode) {
            case 'letters': return 'Буквы';
            case 'numbers': return 'Цифры';
            case 'letters_numbers': return 'Буквы+Цифры';
            case 'punctuation': return 'Знаки препинания';
            case 'punctuation_numbers': return 'Знаки+Цифры';
            case 'punctuation_letters': return 'Знаки+Буквы';
            case 'all': return 'Все символы';
            default: return 'Буквы+Цифры';
        }
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
        let table = {};
        const letterTable = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        const numberTable = morseTables.numbers;
        const punctuationTable = currentLayout === 'ru' ? morseTables.punctuationRu : morseTables.punctuation;
        
        const isEnglish = currentLayout === 'en';
        const isRussian = currentLayout === 'ru';
        
        switch(symbolMode) {
            case 'letters':
                table = letterTable;
                break;
            case 'numbers':
                table = numberTable;
                break;
            case 'letters_numbers':
                table = {...letterTable, ...numberTable};
                break;
            case 'punctuation':
                table = punctuationTable;
                break;
            case 'punctuation_numbers':
                table = {...punctuationTable, ...numberTable};
                break;
            case 'punctuation_letters':
                table = {...punctuationTable, ...letterTable};
                break;
            case 'all':
                if (isEnglish) {
                    table = {...letterTable, ...numberTable, ...punctuationTable};
                } else {
                    table = {...letterTable, ...numberTable, ...punctuationTable};
                }
                break;
        }
        
        let html = '<div class="ref-grid">';
        
        Object.entries(table).forEach(([code, char]) => {
            if (code && char) {
                const formattedCode = code.split('').join(' ');
                const displayChar = char.length === 1 ? char.toUpperCase() : char;
                
                if (isRussian && symbolMode.includes('punctuation') && russianPunctuationCodes) {
                    const rusCode = Object.keys(russianPunctuationCodes).find(key => russianPunctuationCodes[key] === char);
                    if (rusCode) {
                        html += `
                            <div class="ref-item">
                                <div class="ref-char">${displayChar}</div>
                                <div class="ref-code">${rusCode}<br>${formattedCode.replace(/\./g, '•').replace(/-/g, '—')}</div>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="ref-item">
                                <div class="ref-char">${displayChar}</div>
                                <div class="ref-code">${formattedCode.replace(/\./g, '•').replace(/-/g, '—')}</div>
                            </div>
                        `;
                    }
                } else {
                    html += `
                        <div class="ref-item">
                            <div class="ref-char">${displayChar}</div>
                            <div class="ref-code">${formattedCode.replace(/\./g, '•').replace(/-/g, '—')}</div>
                        </div>
                    `;
                }
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
                    elements.hint.textContent = 'Введите символ в текстовое поле';
                    clearMorseInput();
                    setTimeout(() => elements.keyboardInputField.focus(), 100);
                } else {
                    elements.keyboardInput.style.display = 'none';
                    elements.morseInput.style.display = 'block';
                    elements.hint.textContent = 'Введите код Морзе';
                    clearTypedChar();
                    setTimeout(() => elements.morseText.focus(), 100);
                }
                
                if (trainingActive) {
                    updateHint();
                }
            });
        });

        elements.keyboardInputField.addEventListener('input', function(e) {
            if (!trainingActive || currentMode !== 'keyboard') return;
            
            let value = e.target.value;
            
            if (value.length > 0) {
                currentKey = value.charAt(0);
                
                setTimeout(() => {
                    checkKeyboardAnswer();
                }, 300);
            }
        });

        elements.keyboardInputField.addEventListener('keydown', function(e) {
            if (!trainingActive || currentMode !== 'keyboard') return;
            
            if (e.key === 'Backspace') {
                this.value = '';
                currentKey = '';
            }
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
            
            const isEnglish = currentLayout === 'en';
            const punctuationOptions = ['punctuation', 'punctuation_numbers', 'punctuation_letters', 'all'];
            
            const currentOption = elements.symbolModeSelect.value;
            
            if (!isEnglish && punctuationOptions.includes(currentOption)) {
                elements.symbolModeSelect.value = 'letters';
                symbolMode = 'letters';
            }
            
            updateReference();
            if (trainingActive) {
                generateSequence();
                updateTargetChar();
            }
        });

        elements.symbolModeSelect.addEventListener('change', () => {
            const newSymbolMode = elements.symbolModeSelect.value;
            const isEnglish = currentLayout === 'en';
            const punctuationOptions = ['punctuation', 'punctuation_numbers', 'punctuation_letters', 'all'];
            
            
            symbolMode = newSymbolMode;
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
    }

    function showNameModal() {
        elements.playerNameInput.value = playerName || '';
        elements.nameModal.style.display = 'flex';
        elements.playerNameInput.focus();
    }

    function checkKeyboardAnswer() {
        if (!currentKey || !trainingActive) return;

        const isEnglish = currentLayout === 'en';
        const isRussian = currentLayout === 'ru';
        let expectedChar = trainingData.targetChar.toLowerCase();
        let pressedChar = currentKey.toLowerCase();

        let isValidChar = false;
        
        switch(symbolMode) {
            case 'letters':
                if (currentLayout === 'en') {
                    isValidChar = keyMaps.en[pressedChar] !== undefined;
                } else {
                    isValidChar = keyMaps.ru[pressedChar] !== undefined;
                }
                break;
                
            case 'numbers':
                isValidChar = keyMapsNumbers[pressedChar] !== undefined;
                break;
                
            case 'letters_numbers':
                if (currentLayout === 'en') {
                    isValidChar = (keyMaps.en[pressedChar] !== undefined) || (keyMapsNumbers[pressedChar] !== undefined);
                } else {
                    isValidChar = (keyMaps.ru[pressedChar] !== undefined) || (keyMapsNumbers[pressedChar] !== undefined);
                }
                break;
                
            case 'punctuation':
                if (isEnglish) {
                    isValidChar = keyMapsPunctuation[pressedChar] !== undefined;
                } else if (isRussian) {
                    isValidChar = Object.values(morseTables.punctuationRu).includes(pressedChar) || 
                                  Object.keys(russianPunctuationCodes).includes(pressedChar.toUpperCase());
                }
                break;
                
            case 'punctuation_numbers':
                if (isEnglish) {
                    isValidChar = (keyMapsPunctuation[pressedChar] !== undefined) || (keyMapsNumbers[pressedChar] !== undefined);
                } else if (isRussian) {
                    isValidChar = Object.values(morseTables.punctuationRu).includes(pressedChar) || 
                                  (keyMapsNumbers[pressedChar] !== undefined) ||
                                  Object.keys(russianPunctuationCodes).includes(pressedChar.toUpperCase());
                }
                break;
                
            case 'punctuation_letters':
                if (isEnglish) {
                    isValidChar = (keyMapsPunctuation[pressedChar] !== undefined) || (keyMaps.en[pressedChar] !== undefined);
                } else if (isRussian) {
                    isValidChar = Object.values(morseTables.punctuationRu).includes(pressedChar) || 
                                  (keyMaps.ru[pressedChar] !== undefined) ||
                                  Object.keys(russianPunctuationCodes).includes(pressedChar.toUpperCase());
                }
                break;
                
            case 'all':
                if (isEnglish) {
                    isValidChar = (keyMaps.en[pressedChar] !== undefined) || 
                                  (keyMapsNumbers[pressedChar] !== undefined) || 
                                  (keyMapsPunctuation[pressedChar] !== undefined);
                } else if (isRussian) {
                    isValidChar = (keyMaps.ru[pressedChar] !== undefined) || 
                                  (keyMapsNumbers[pressedChar] !== undefined) ||
                                  Object.values(morseTables.punctuationRu).includes(pressedChar) ||
                                  Object.keys(russianPunctuationCodes).includes(pressedChar.toUpperCase());
                }
                break;
        }

        if (!isValidChar) {
            elements.feedback.textContent = '';
            elements.errorMessage.textContent = `Недопустимый символ для выбранного режима!`;
            elements.errorMessage.style.display = 'block';
            
            setTimeout(() => {
                elements.keyboardInputField.value = '';
                elements.errorMessage.style.display = 'none';
                clearTypedChar();
                currentKey = '';
            }, 1000);
            return;
        }

        elements.keyboardInputField.value = pressedChar.toUpperCase();
        elements.errorMessage.style.display = 'none';
        elements.errorMessage.textContent = '';
        elements.feedback.className = 'feedback';

        let isCorrect = false;
        
        if (pressedChar === expectedChar) {
            isCorrect = true;
        } else if (isRussian && Object.keys(russianPunctuationCodes).includes(pressedChar.toUpperCase())) {
            const decodedChar = russianPunctuationCodes[pressedChar.toUpperCase()];
            if (decodedChar && decodedChar.toLowerCase() === expectedChar) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            elements.feedback.textContent = `✓ Правильно! Введено: ${pressedChar.toUpperCase()}`;
            elements.feedback.classList.add('correct');

            trainingData.correct++;
            trainingData.streak++;

            if (trainingData.streak > trainingData.bestStreak) {
                trainingData.bestStreak = trainingData.streak;
            }

            setTimeout(() => {
                elements.keyboardInputField.value = '';
                nextRound();
            }, 1000);
        } else {
            elements.feedback.textContent = '';
            elements.errorMessage.textContent = `✗ Ошибка! Ожидалось: ${expectedChar.toUpperCase()}`;
            elements.errorMessage.style.display = 'block';

            trainingData.errors++;
            trainingData.streak = 0;

            setTimeout(() => {
                elements.keyboardInputField.value = '';
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
            elements.feedback.textContent = 'Введите следующий символ';
            elements.feedback.className = 'feedback';
            elements.keyboardInputField.focus();
        } else {
            finishTraining();
        }
    }

    function autoCheckMorse() {
        if (!trainingActive || currentMode !== 'morse' || !morseSymbol) return;
        
        const isEnglish = currentLayout === 'en';
        let fullTable = {};
        
        switch(symbolMode) {
            case 'letters':
                fullTable = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
                break;
            case 'numbers':
                fullTable = morseTables.numbers;
                break;
            case 'letters_numbers':
                const letterTable = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
                fullTable = {...letterTable, ...morseTables.numbers};
                break;
            case 'punctuation':
                if (isEnglish) {
                    fullTable = morseTables.punctuation;
                } else {
                    fullTable = morseTables.punctuationRu;
                }
                break;
            case 'punctuation_numbers':
                if (isEnglish) {
                    fullTable = {...morseTables.punctuation, ...morseTables.numbers};
                } else {
                    fullTable = {...morseTables.punctuationRu, ...morseTables.numbers};
                }
                break;
            case 'punctuation_letters':
                if (isEnglish) {
                    const letterTable = morseTables.en;
                    fullTable = {...morseTables.punctuation, ...letterTable};
                } else {
                    const letterTable = morseTables.ru;
                    fullTable = {...morseTables.punctuationRu, ...letterTable};
                }
                break;
            case 'all':
                if (isEnglish) {
                    fullTable = {...morseTables.en, ...morseTables.numbers, ...morseTables.punctuation};
                } else {
                    fullTable = {...morseTables.ru, ...morseTables.numbers, ...morseTables.punctuationRu};
                }
                break;
        }
        
        const decodedChar = fullTable[morseSymbol];
        
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
                elements.feedback.textContent = `✗ Ошибка! Ожидалось: ${trainingData.targetChar.toUpperCase()}`;
                elements.feedback.classList.add('error');
                
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
        elements.keyboardInputField.value = '';
        elements.errorMessage.style.display = 'none';
    }

    function startTraining() {
        trainingActive = true;
        trainingData.started = true;
        currentLayout = elements.layoutSelect.value;
        symbolMode = elements.symbolModeSelect.value;
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
        elements.feedback.textContent = 'Введите символ в текстовое поле';
        
        elements.errorMessage.style.display = 'none';
        
        elements.keyboardInputField.focus();
    }

    function restartTraining() {
        clearTypedChar();
        clearMorseInput();
        startTraining();
    }

    function generateSequence() {
        trainingData.sequence = [];
        let availableSymbols = [];
        
        const isEnglish = currentLayout === 'en';
        const isRussian = currentLayout === 'ru';
        const letterTable = currentLayout === 'ru' ? morseTables.ru : morseTables.en;
        const numberTable = morseTables.numbers;
        const punctuationTable = isRussian ? morseTables.punctuationRu : morseTables.punctuation;
        
        switch(symbolMode) {
            case 'letters':
                availableSymbols = Object.values(letterTable)
                    .filter(c => c.length === 1);
                break;
                
            case 'numbers':
                availableSymbols = Object.values(numberTable)
                    .filter(c => c.length === 1);
                break;
                
            case 'letters_numbers':
                const letters = Object.values(letterTable)
                    .filter(c => c.length === 1);
                const numbers = Object.values(numberTable)
                    .filter(c => c.length === 1);
                availableSymbols = [...letters, ...numbers];
                break;
                
            case 'punctuation':
                availableSymbols = Object.values(punctuationTable)
                    .filter(c => c.length === 1);
                break;
                
            case 'punctuation_numbers':
                const punctuation = Object.values(punctuationTable)
                    .filter(c => c.length === 1);
                const nums = Object.values(numberTable)
                    .filter(c => c.length === 1);
                availableSymbols = [...punctuation, ...nums];
                break;
                
            case 'punctuation_letters':
                const punct = Object.values(punctuationTable)
                    .filter(c => c.length === 1);
                const lets = Object.values(letterTable)
                    .filter(c => c.length === 1);
                availableSymbols = [...punct, ...lets];
                break;
                
            case 'all':
                const allPunct = Object.values(punctuationTable)
                    .filter(c => c.length === 1);
                const allLets = Object.values(letterTable)
                    .filter(c => c.length === 1);
                const allNums = Object.values(numberTable)
                    .filter(c => c.length === 1);
                availableSymbols = [...allLets, ...allNums, ...allPunct];
                break;
        }
        
        for (let i = 0; i < trainingData.totalRounds; i++) {
            if (availableSymbols.length > 0) {
                const randomChar = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
                trainingData.sequence.push(randomChar);
            }
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
            elements.hint.textContent = 'Введите символ в текстовое поле';
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
            elements.feedback.textContent = 'Введите следующий символ';
            elements.feedback.className = 'feedback';
            elements.keyboardInputField.focus();
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
        
        elements.feedback.textContent = `Тренировка завершена! Точность по символам: ${charAccuracy}% (${roundAccuracy}% по раундам) • Время: ${timeDiff.toFixed(1)}с`;
        elements.feedback.className = 'feedback';
        
        elements.hint.textContent = `Нажмите "Перезапустить" чтобы начать заново`;
        
        saveRecord(charAccuracy, roundAccuracy, timeDiff);
    }

    function saveRecord(charAccuracy, roundAccuracy, time) {
        const record = {
            id: Date.now(),
            playerName: playerName || 'Аноним',
            mode: currentMode,
            symbolMode: symbolMode,
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
