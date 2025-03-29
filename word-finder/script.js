/*
 * Static Word Finder Script
 * Fetches, parses, caches, and filters a word list based on user criteria.
 * Handles Gzip compressed word list files (.gz).
 * Uses IndexedDB for caching large parsed data sets.
 * Features localStorage for filter settings persistence.
 *
 * Base functionality written by Google's Gemini model.
 */

// --- Configuration ---
const WORD_LIST_URL = "./count_1w.txt.gz"; // Local file path to the Gzip compressed file
// IndexedDB Configuration
const DB_NAME = "wordFinderDB";
const DB_VERSION = 1; // Increment this if schema changes
const STORE_NAME = "wordStore";
const DATA_KEY = "parsedWordData"; // Key for the single entry in the store
// Cache expiry: 7 days in milliseconds
const CACHE_EXPIRY_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
// LocalStorage keys for filter settings (remain the same)
const LS_KEY_FILTER_TOP_N = 'wordFinder_filter_topN';
const LS_KEY_FILTER_MIN_LEN = 'wordFinder_filter_minLen';
const LS_KEY_FILTER_MAX_LEN = 'wordFinder_filter_maxLen';
const LS_KEY_FILTER_PATTERN = 'wordFinder_filter_pattern';
const LS_KEY_FILTER_SORT_BY = 'wordFinder_filter_sortBy';

// --- DOM Elements ---
const filterForm = document.getElementById('filter-form');
const findButton = document.getElementById('find-button');
const topNInput = document.getElementById('top-n');
const minLenInput = document.getElementById('min-len');
const maxLenInput = document.getElementById('max-len');
const patternInput = document.getElementById('pattern');
const sortBySelect = document.getElementById('sort-by');
const statusDiv = document.getElementById('status');
const resultsPre = document.getElementById('results');

// --- Global State ---
let wordData = []; // Holds Array of [word, count] sorted by freq
let isDataReady = false;
let isProcessing = false;
let db = null; // To hold the IndexedDB database instance

// --- Functions ---

function updateStatus(message, isError = false) {
    console.log(message);
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
}

// --- IndexedDB Helper Functions ---

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) { // If db is already open, resolve with it
           resolve(db);
           return;
        }
        updateStatus("Initializing data store (IndexedDB)...");
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(`IndexedDB error: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database opened successfully.");
            resolve(db);
        };

        // This event only runs if the DB version changes or doesn't exist
        request.onupgradeneeded = (event) => {
            console.log("Upgrading database...");
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.log(`Creating object store: ${STORE_NAME}`);
                db.createObjectStore(STORE_NAME); // Simple key-value store
            }
            // If migrating versions later, add upgrade logic here based on event.oldVersion
        };
    });
}

function saveDataToDB(dataArray) {
    return new Promise(async (resolve, reject) => {
        if (!db) {
            try {
                db = await openDB(); // Ensure DB is open first
            } catch (error) {
                reject(`Failed to open DB for saving: ${error}`);
                return;
            }
        }
        if (!db) { // Still no DB after trying to open?
             reject("Database is not available for saving.");
             return;
        }

        try {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const dataToStore = {
                timestamp: Date.now(),
                data: dataArray // Store the actual array
            };
            const request = store.put(dataToStore, DATA_KEY); // Use put to overwrite if exists

            request.onsuccess = () => {
                console.log("Data saved successfully to IndexedDB.");
                resolve();
            };

            request.onerror = (event) => {
                console.error("Error saving data to IndexedDB:", event.target.error);
                reject(`Error saving data: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                 console.log("Save transaction completed.");
            };
            transaction.onerror = (event) => {
                 console.error("Save transaction error:", event.target.error);
                 // Reject might have already been called by request.onerror
                 reject(`Save transaction failed: ${event.target.error}`);
            };
        } catch (error) {
             console.error("Error initiating save transaction:", error);
             reject(`Failed to initiate save transaction: ${error}`);
        }
    });
}

function loadDataFromDB() {
    return new Promise(async (resolve, reject) => {
        if (!db) {
            try {
                db = await openDB(); // Ensure DB is open first
            } catch (error) {
                 reject(`Failed to open DB for loading: ${error}`);
                 return;
            }
        }
         if (!db) { // Still no DB after trying to open?
             reject("Database is not available for loading.");
             return;
         }

        try {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(DATA_KEY);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result && result.timestamp && result.data) {
                    const cacheAge = Date.now() - result.timestamp;
                    if (cacheAge < CACHE_EXPIRY_MILLISECONDS) {
                        console.log("Valid cached data found in IndexedDB.");
                        resolve(result.data); // Return the actual data array
                    } else {
                        console.log("Cached data found in IndexedDB, but expired.");
                        // Optionally clear expired data here
                        clearDataFromDB().catch(err => console.warn("Could not clear expired DB data:", err));
                        resolve(null); // Expired
                    }
                } else {
                    console.log("No valid cached data found in IndexedDB.");
                    resolve(null); // No data found
                }
            };

            request.onerror = (event) => {
                console.error("Error loading data from IndexedDB:", event.target.error);
                reject(`Error loading data: ${event.target.error}`);
            };
             transaction.onerror = (event) => {
                 console.error("Load transaction error:", event.target.error);
                 // Reject might have already been called by request.onerror
                 reject(`Load transaction failed: ${event.target.error}`);
             };
        } catch(error) {
            console.error("Error initiating load transaction:", error);
            reject(`Failed to initiate load transaction: ${error}`);
        }
    });
}

// Optional: Function to clear the data if needed (e.g., for explicit cache clear or expiry)
function clearDataFromDB() {
     return new Promise(async (resolve, reject) => {
        if (!db) {
             try { db = await openDB(); } catch (error) { reject(`Failed to open DB for clearing: ${error}`); return; }
        }
        if (!db) { reject("Database is not available for clearing."); return; }

        try {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(DATA_KEY); // Delete the specific key

            request.onsuccess = () => { resolve(); };
            request.onerror = (event) => { reject(`Error deleting data: ${event.target.error}`); };
            transaction.onerror = (event) => { reject(`Clear transaction failed: ${event.target.error}`); };
        } catch (error) {
             reject(`Failed to initiate clear transaction: ${error}`);
        }
     });
}


// --- Fetch/Decompress (No change) ---
async function fetchAndDecompressWordList() {
    // ... (keep the existing fetchAndDecompressWordList function exactly as it was) ...
    updateStatus(`Loading compressed word list (${WORD_LIST_URL})...`);
    isProcessing = true;
    findButton.disabled = true;

    if (typeof DecompressionStream === 'undefined') {
        updateStatus("Error: Browser does not support the Compression Streams API required to read .gz files.", true);
        isProcessing = false;
        findButton.disabled = true;
        return null;
    }

    try {
        const response = await fetch(WORD_LIST_URL);
        if (!response.ok) {
            throw new Error(`Failed to load local word list! status: ${response.status} - Ensure ${WORD_LIST_URL} is in the same directory.`);
        }
        if (!response.body) {
            throw new Error("Response body is not available (required for decompression).");
        }

        updateStatus("Decompressing word list...");
        const decompressionStream = new DecompressionStream('gzip');
        const decompressedStream = response.body.pipeThrough(decompressionStream);
        const text = await new Response(decompressedStream).text();
        updateStatus("Word list loaded and decompressed.");
        return text;

    } catch (error) {
        updateStatus(`Error loading/decompressing word list: ${error.message}. Check console for details.`, true);
        console.error("Fetch/Decompression Error:", error);
        isProcessing = false;
        findButton.disabled = true;
        return null;
    }
}

// --- Parse Word Data (No change) ---
function parseWordData(text) {
    // ... (keep the existing parseWordData function exactly as it was) ...
    if (!text) return null;

    return new Promise((resolve) => {
        updateStatus("Parsing decompressed word list (this may take a moment)...");
        setTimeout(() => {
            try {
                const lines = text.split('\n');
                const data = [];
                let parsedCount = 0;
                let skippedFormat = 0;
                let skippedNonAlpha = 0;

                for (const line of lines) {
                    if (!line) continue;
                    const parts = line.split('\t');
                    if (parts.length !== 2) { skippedFormat++; continue; }
                    const word = parts[0].toLowerCase();
                    const count = parseInt(parts[1], 10);

                    if (isNaN(count)) { skippedFormat++; continue; }
                    if (/^[a-z]+$/.test(word)) {
                        data.push([word, count]);
                        parsedCount++;
                    } else { skippedNonAlpha++; }
                }

                updateStatus(`Parsed ${parsedCount} words. Sorting...`);
                console.log(`Skipped ${skippedFormat} lines (format/count), ${skippedNonAlpha} (non-alpha).`);
                data.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
                updateStatus(`Parsed data ready (${data.length} words).`);
                resolve(data);

            } catch (error) {
                 updateStatus(`Error during parsing: ${error.message}`, true);
                 console.error("Parsing error:", error);
                 resolve(null);
            }
        }, 50);
    });
}

// --- Main Data Loading Logic (Updated to use IndexedDB) ---
async function loadData() {
    updateStatus("Checking data store (IndexedDB)...");
    isDataReady = false;
    wordData = [];
    findButton.disabled = true;
    let needsFetchingParsing = true;

    try {
        // Try loading from IndexedDB first
        const cachedData = await loadDataFromDB(); // Returns data array or null

        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
            wordData = cachedData;
            isDataReady = true;
            needsFetchingParsing = false;
            updateStatus(`Loaded ${wordData.length} words from data store.`);
        } else if (cachedData === null) {
             // Data was explicitly null (not found or expired), proceed to fetch
             updateStatus("No valid cached data found. Loading from file...");
        } else {
             // Should not happen if loadDataFromDB resolves correctly, but handle anyway
             updateStatus("Unexpected state loading from cache. Reloading from file...");
        }

    } catch (error) {
        // Error occurred trying to load from DB (e.g., DB open failed, transaction error)
        updateStatus(`Error loading data from store: ${error}. Will attempt to load from file.`, true);
        console.error("IndexedDB Load Error:", error);
        needsFetchingParsing = true; // Ensure we try to fetch
        // Clear potentially corrupt DB state if loading failed badly? Maybe too aggressive.
        // await clearDataFromDB().catch(err => console.warn("Could not clear DB data after load error:", err));
    }


    // If we still need to fetch and parse
    if (needsFetchingParsing) {
        const decompressedText = await fetchAndDecompressWordList();

        if (decompressedText) {
            const parsedResult = await parseWordData(decompressedText);
            if (parsedResult) {
                wordData = parsedResult;
                isDataReady = true;
                updateStatus(`Parsed data ready (${wordData.length} words). Caching...`);

                // Save the newly parsed data to IndexedDB
                try {
                    await saveDataToDB(wordData);
                    updateStatus(`Parsed data cached (${wordData.length} words). Ready.`);
                    // Clean up old localStorage keys if they exist (optional, one-time)
                    // localStorage.removeItem("wordFinder_parsedDataJson");
                    // localStorage.removeItem("wordFinder_dataTimestamp");
                } catch (error) {
                    updateStatus(`Warning: Could not cache parsed data to IndexedDB. Error: ${error}`, true);
                    console.error("IndexedDB Save Error:", error);
                    updateStatus(`Parsed data ready (${wordData.length} words). Ready (caching failed).`);
                    // Data is still usable in memory for this session
                }
            } else {
                isDataReady = false; // Parsing failed
            }
        } else {
            isDataReady = false; // Fetching/decompression failed
        }
    }

    // Final state update
    isProcessing = false;
    findButton.disabled = !isDataReady;
}

// --- Filter Settings Persistence (No Change - Still uses localStorage) ---
function saveFilterSettings() {
    // ... (keep the existing saveFilterSettings function) ...
     try {
        localStorage.setItem(LS_KEY_FILTER_TOP_N, topNInput.value);
        localStorage.setItem(LS_KEY_FILTER_MIN_LEN, minLenInput.value);
        localStorage.setItem(LS_KEY_FILTER_MAX_LEN, maxLenInput.value);
        localStorage.setItem(LS_KEY_FILTER_PATTERN, patternInput.value);
        localStorage.setItem(LS_KEY_FILTER_SORT_BY, sortBySelect.value);
    } catch (e) {
        console.warn("Could not save filter settings to localStorage:", e);
    }
}

function loadFilterSettings() {
    // ... (keep the existing loadFilterSettings function) ...
    try {
        const savedTopN = localStorage.getItem(LS_KEY_FILTER_TOP_N);
        if (savedTopN !== null) topNInput.value = savedTopN;

        const savedMinLen = localStorage.getItem(LS_KEY_FILTER_MIN_LEN);
        if (savedMinLen !== null) minLenInput.value = savedMinLen;

        const savedMaxLen = localStorage.getItem(LS_KEY_FILTER_MAX_LEN);
        if (savedMaxLen !== null) maxLenInput.value = savedMaxLen;

        const savedPattern = localStorage.getItem(LS_KEY_FILTER_PATTERN);
        if (savedPattern !== null) patternInput.value = savedPattern;

        const savedSortBy = localStorage.getItem(LS_KEY_FILTER_SORT_BY);
        if (savedSortBy !== null) {
            if (Array.from(sortBySelect.options).some(opt => opt.value === savedSortBy)) {
                 sortBySelect.value = savedSortBy;
            } else {
                 localStorage.removeItem(LS_KEY_FILTER_SORT_BY);
            }
        }
    } catch (e) {
        console.warn("Could not load filter settings from localStorage:", e);
    }
}

// --- Filtering Logic (No change) ---
function filterAndDisplayWords(event) {
    // ... (keep the existing filterAndDisplayWords function) ...
     if (event) event.preventDefault();
    if (!isDataReady || isProcessing) {
        updateStatus("Data is not ready or still processing. Please wait.", true);
        return;
    }
    if (wordData.length === 0) {
         updateStatus("No word data available to filter.", true);
         return;
    }

    updateStatus("Filtering...");
    isProcessing = true;
    findButton.disabled = true;

    setTimeout(() => {
        try {
            const topN = topNInput.value ? parseInt(topNInput.value, 10) : null;
            const minLen = minLenInput.value ? parseInt(minLenInput.value, 10) : null;
            const maxLen = maxLenInput.value ? parseInt(maxLenInput.value, 10) : null;
            const patternStr = patternInput.value.trim();
            const sortBy = sortBySelect.value;
            let compiledRe = null;
            if (patternStr) {
                try { compiledRe = new RegExp(patternStr, 'i'); }
                catch (e) { updateStatus(`Invalid Regex: ${e.message}`, true); throw e; }
            }

            saveFilterSettings(); // Save settings on filter execution

            let filteredTuples = (topN && topN > 0) ? wordData.slice(0, topN) : wordData;

            filteredTuples = filteredTuples.filter(([word, count]) => {
                if (minLen && word.length < minLen) return false;
                if (maxLen && word.length > maxLen) return false;
                if (compiledRe && !compiledRe.test(word)) return false;
                return true;
            });

            let finalWords = [];
            if (filteredTuples.length > 0) {
                 if (sortBy === 'freq') {
                    finalWords = filteredTuples.map(item => item[0]);
                 } else {
                    finalWords = filteredTuples.map(item => item[0]).sort();
                 }
            }

            resultsPre.textContent = finalWords.length > 0 ? finalWords.join('\n') : "(No words match filters)";
            updateStatus(`Found ${finalWords.length} words.`);

        } catch (error) {
             if (!statusDiv.textContent.startsWith("Invalid Regex")) {
                updateStatus(`Error during filtering: ${error.message}`, true);
             }
            console.error("Filtering error:", error);
            resultsPre.textContent = "(Error during filtering)";
        } finally {
            isProcessing = false;
            findButton.disabled = !isDataReady;
        }
    }, 50);
}

// --- Initialization ---
filterForm.addEventListener('submit', filterAndDisplayWords);

// Load saved filter settings *before* initial data load
loadFilterSettings();

// Load data when the page loads (will now use IndexedDB)
// We don't need to explicitly openDB here, loadData will handle it.
loadData();

// Clean up old localStorage data keys *after* initial load attempt
// Run this slightly delayed and only once conceptually
// setTimeout(() => {
//     console.log("Removing old localStorage cache keys if present...");
//     localStorage.removeItem("wordFinder_parsedDataJson");
//     localStorage.removeItem("wordFinder_dataTimestamp");
// }, 5000); // Run after 5 seconds
