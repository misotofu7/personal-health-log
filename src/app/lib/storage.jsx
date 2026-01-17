export function getFromStorage(key, fallback){
    if(typeof window === "undefined")
        return fallback;

    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback; 
    } catch(err) {
        console.error("Error reading from localStorage:", err); 
        return fallback;
    }
}

export function saveToStorage(key, value) { // items are stored as key-value pairs
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error("Error writing to localStorage:", err)
    }
    
}