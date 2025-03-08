export const formatVEDate = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/Caracas'
    };
    
    return dateObj.toLocaleDateString('es-VE', options)
        .replace(/^\w/, (c) => c.toUpperCase());
};

export const formatVETime = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/Caracas'
    };
    
    return dateObj.toLocaleTimeString('es-VE', options)
        .replace(/\./g, ':')
        .toUpperCase();
};

export const formatVEDateTime = (date) => {
    if (!date) return '';
    return `${formatVEDate(date)} - ${formatVETime(date)}`;
};

// Para fechas sin hora (solo fecha)
export const formatVEShortDate = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        timeZone: 'America/Caracas'
    };
    
    return dateObj.toLocaleDateString('es-VE', options);
};

// Para inputs tipo date
export const formatVEDateForInput = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    return dateObj.toISOString().split('T')[0];
}; 