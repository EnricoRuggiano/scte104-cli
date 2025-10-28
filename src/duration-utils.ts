import type { Duration } from 'date-fns';

/**
 * Converts FFmpeg time duration string to date-fns Duration object
 * Supports formats:
 * - [-][HH:]MM:SS[.m...] (e.g., "01:30:45.500", "30:45", "-01:30:45")
 * - [-]S+[.m...][s|ms|us] (e.g., "3661.5", "3661500ms", "3661500000us", "-30s")
 */
export function parseFFmpegDuration(durationStr: string): Duration {
    // Regex for [-][HH:]MM:SS[.m...] format
    const timeFormatRegex = /^(-)?(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})(?:\.(\d+))?$/;
    
    // Regex for [-]S+[.m...][s|ms|us] format
    const secondsFormatRegex = /^(-)?(\d+)(?:\.(\d+))?(s|ms|us)?$/;
    
    let match = durationStr.match(timeFormatRegex);
    
    if (match) {
        // Handle [-][HH:]MM:SS[.m...] format
        const [, negative, hours, minutes, seconds, fractional] = match;
        
        let totalSeconds = 0;
        
        if (hours) {
            totalSeconds += parseInt(hours) * 3600;
        }
        totalSeconds += parseInt(minutes) * 60;
        totalSeconds += parseInt(seconds);
        
        if (fractional) {
            // Convert fractional part to decimal seconds
            const fractionalSeconds = parseFloat(`0.${fractional}`);
            totalSeconds += fractionalSeconds;
        }
        
        if (negative) {
            totalSeconds = -totalSeconds;
        }
        
        return {
            seconds: totalSeconds
        };
    }
    
    match = durationStr.match(secondsFormatRegex);
    
    if (match) {
        // Handle [-]S+[.m...][s|ms|us] format
        const [, negative, integerPart, fractionalPart, unit] = match;
        
        let totalValue = parseInt(integerPart);
        let fractionalValue = 0;
        
        if (fractionalPart) {
            fractionalValue = parseFloat(`0.${fractionalPart}`);
        }
        
        const fullValue = totalValue + fractionalValue;
        
        let totalSeconds: number;
        
        switch (unit) {
            case 'ms':
                totalSeconds = fullValue / 1000;
                break;
            case 'us':
                totalSeconds = fullValue / 1000000;
                break;
            case 's':
            case undefined: // Default to seconds if no unit specified
                totalSeconds = fullValue;
                break;
            default:
                throw new Error(`Unsupported time unit: ${unit}`);
        }
        
        if (negative) {
            totalSeconds = -totalSeconds;
        }
        
        return {
            seconds: totalSeconds
        };
    }
    else {
        throw new Error(`Invalid FFmpeg duration format: ${durationStr}`);
    }
}