// iCalendar Parser and Integration
class ICalParser {
    constructor() {
        this.events = [];
        this.loaded = false;
    }

    // Parse iCalendar data from text
    parseICalData(icalText) {
        console.log('Parsing iCal data, length:', icalText.length);
        this.events = [];
        const lines = icalText.split('\n');
        let currentEvent = {};
        let inEvent = false;
        let eventCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === 'BEGIN:VEVENT') {
                inEvent = true;
                currentEvent = {};
                eventCount++;
            } else if (line === 'END:VEVENT') {
                if (inEvent) {
                    const processedEvent = this.processEvent(currentEvent);
                    console.log(`Processing event ${eventCount}:`, processedEvent);
                    this.events.push(processedEvent);
                    currentEvent = {};
                    inEvent = false;
                }
            } else if (inEvent) {
                this.parseEventLine(line, currentEvent);
            }
        }

        console.log(`Total events parsed: ${this.events.length}`);
        this.loaded = true;
        return this.events;
    }

    // Parse individual event lines
    parseEventLine(line, event) {
        if (line.startsWith('SUMMARY:')) {
            event.summary = line.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';');
        } else if (line.startsWith('DESCRIPTION:')) {
            event.description = line.substring(12).replace(/\\,/g, ',').replace(/\\;/g, ';');
        } else if (line.startsWith('DTSTART:')) {
            event.start = line.substring(8);
            console.log('Found DTSTART:', event.start);
        } else if (line.startsWith('DTEND:')) {
            event.end = line.substring(6);
            console.log('Found DTEND:', event.end);
        } else if (line.startsWith('LOCATION:')) {
            event.location = line.substring(9).replace(/\\,/g, ',').replace(/\\;/g, ';');
        } else if (line.startsWith('UID:')) {
            event.uid = line.substring(4);
        }
    }

    // Parse iCalendar date/time format
    parseDateTime(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') {
            console.log('Invalid date string:', dateStr);
            return new Date();
        }
        
        console.log('=== PARSING DATE TIME (STANDARD UTC TO MELBOURNE) ===');
        console.log('UTC input string:', dateStr);
        
        // Handle different iCalendar date formats
        let cleanDateStr = dateStr;
        
        // Remove timezone info but convert to Melbourne time using standard method
        if (dateStr.includes('Z')) {
            // Parse UTC time and convert to Melbourne time using JavaScript's built-in conversion
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-11
            const day = parseInt(dateStr.substring(6, 8));
            const hours = parseInt(dateStr.substring(9, 11));
            const minutes = parseInt(dateStr.substring(11, 13));
            const seconds = parseInt(dateStr.substring(13, 15)) || 0;
            
            console.log('UTC components:', { year, month: month + 1, day, hours, minutes, seconds });
            
            // Create date using UTC constructor - JavaScript automatically converts to local timezone
            const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
            
            console.log('Standard UTC to Melbourne conversion:', {
                utcDate: utcDate.toISOString(),
                melbourneDate: utcDate.toString(),
                melbourneISO: utcDate.toISOString(),
                melbourneHours: utcDate.getHours(),
                melbourneMinutes: utcDate.getMinutes(),
                timezoneOffset: utcDate.getTimezoneOffset()
            });
            
            return utcDate;
        }
        
        if (cleanDateStr.includes('T')) {
            // Local datetime format (no Z): YYYYMMDDTHHMMSS
            const year = parseInt(cleanDateStr.substring(0, 4));
            const month = parseInt(cleanDateStr.substring(4, 6)) - 1; // JS months are 0-11
            const day = parseInt(cleanDateStr.substring(6, 8));
            const hours = parseInt(cleanDateStr.substring(9, 11));
            const minutes = parseInt(cleanDateStr.substring(11, 13));
            const seconds = parseInt(cleanDateStr.substring(13, 15)) || 0;
            
            const date = new Date(year, month, day, hours, minutes, seconds);
            console.log('Local datetime (no conversion):', date.toString());
            return date;
        } else {
            // Date only format: YYYYMMDD
            const year = parseInt(cleanDateStr.substring(0, 4));
            const month = parseInt(cleanDateStr.substring(4, 6)) - 1; // JS months are 0-11
            const day = parseInt(cleanDateStr.substring(6, 8));
            
            const date = new Date(year, month, day);
            console.log('Local date (no conversion):', date.toString());
            return date;
        }
    }

    // Process parsed event data
    processEvent(eventData) {
        console.log('=== PROCESSING EVENT ===');
        console.log('Raw event data:', eventData);
        
        const event = {
            summary: eventData.summary || 'Untitled Event',
            description: eventData.description || '',
            location: eventData.location || '',
            uid: eventData.uid || Date.now().toString(),
            start: eventData.start ? this.parseDateTime(eventData.start) : new Date(),
            end: eventData.end ? this.parseDateTime(eventData.end) : new Date(),
            allDay: false
        };
        
        // Extract attending staff from description
        let attendingStaff = '';
        if (event.description && event.description.includes('Attending Staff :')) {
            const staffMatch = event.description.match(/Attending Staff\s*:\s*([^\n\\]+)/);
            if (staffMatch) {
                attendingStaff = staffMatch[1].trim();
            }
        }
        
        // Store extracted data
        event.attendingStaff = attendingStaff;
        
        console.log('Event processing details:', {
            summary: event.summary,
            subject: event.summary, // Subject is typically in summary
            attendingStaff: attendingStaff,
            location: event.location,
            originalStart: eventData.start,
            parsedStart: event.start.toString(),
            parsedStartISO: event.start.toISOString(),
            parsedStartLocal: event.start.toLocaleString(),
            originalEnd: eventData.end,
            parsedEnd: event.end.toString(),
            parsedEndISO: event.end.toISOString(),
            parsedEndLocal: event.end.toLocaleString()
        });
        
        return event;
    }

    // Fetch iCalendar from URL
    async fetchFromURL(url) {
        console.log('Starting fetch from URL:', url);
        
        try {
            console.log('Making fetch request...');
            const response = await fetch(url);
            console.log('Fetch response status:', response.status);
            console.log('Fetch response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Getting response text...');
            const icalText = await response.text();
            console.log('Response text length:', icalText.length);
            console.log('First 200 chars of response:', icalText.substring(0, 200));
            
            const events = this.parseICalData(icalText);
            console.log('Fetch completed successfully');
            return events;
        } catch (error) {
            console.error('Fetch error details:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    // Get events for a specific date range
    getEventsInRange(startDate, endDate) {
        console.log('=== GET EVENTS IN RANGE ===');
        console.log('Start date:', startDate.toISOString());
        console.log('End date:', endDate.toISOString());
        console.log('Total events to filter:', this.events.length);
        
        const filteredEvents = this.events.filter((event, index) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            const isInRange = eventStart <= endDate && eventEnd >= startDate;
            
            console.log(`Event ${index}:`, {
                summary: event.summary,
                start: eventStart.toISOString(),
                end: eventEnd.toISOString(),
                inRange: isInRange
            });
            
            return isInRange;
        });
        
        console.log('Filtered events count:', filteredEvents.length);
        console.log('=== END GET EVENTS IN RANGE ===');
        
        return filteredEvents;
    }

    // Get events for a specific week
    getWeekEvents(date) {
        console.log('=== GETTING WEEK EVENTS ===');
        console.log('Input date:', date.toISOString());
        console.log('Input date (local):', date.toString());
        
        // Get Monday of the current week
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        
        // Adjust to Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Get Friday of the same week (school week is Mon-Fri)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4); // Monday + 4 = Friday
        endOfWeek.setHours(23, 59, 59, 999);

        console.log('Week calculation:', {
            inputDate: date.toISOString(),
            dayOfWeek: dayOfWeek,
            daysToMonday: daysToMonday,
            startOfWeek: startOfWeek.toISOString(),
            startOfWeekLocal: startOfWeek.toString(),
            endOfWeek: endOfWeek.toISOString(),
            endOfWeekLocal: endOfWeek.toString()
        });

        console.log('All available events:');
        this.events.forEach((event, index) => {
            console.log(`Event ${index}:`, {
                summary: event.summary,
                start: event.start.toISOString(),
                startLocal: event.start.toString(),
                end: event.end.toISOString(),
                endLocal: event.end.toString()
            });
        });

        const weekEvents = this.getEventsInRange(startOfWeek, endOfWeek);
        console.log('Week events returned:', weekEvents.length);
        
        return weekEvents;
    }

    // Get events for a specific day
    getDayEvents(date) {
        console.log('Getting events for date:', date.toISOString());
        
        // Start of the day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        // End of the day
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Day range:', {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString()
        });

        const dayEvents = this.getEventsInRange(startOfDay, endOfDay);
        console.log('Day events returned:', dayEvents.length);
        
        return dayEvents;
    }
}

// Calendar Display Manager
class CalendarDisplay {
    constructor() {
        this.parser = new ICalParser();
        // Set to current date instead of default date
        this.currentWeek = new Date();
        console.log('=== CALENDAR DISPLAY INITIALIZATION ===');
        console.log('Current date set to:', this.currentWeek.toISOString());
        console.log('Current date (local):', this.currentWeek.toString());
        console.log('Current date (date string):', this.currentWeek.toDateString());
        console.log('Today is:', this.currentWeek.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }));
    }

    // Initialize calendar with iCal URL
    async initialize(icalUrl) {
        console.log('=== CALENDAR INITIALIZATION START ===');
        console.log('URL provided:', icalUrl);
        
        try {
            console.log('Calling fetchFromURL...');
            
            const events = await this.parser.fetchFromURL(icalUrl);
            console.log('Events returned from fetch:', events.length);
            console.log('Parser loaded status:', this.parser.loaded);
            console.log('Parser events array:', this.parser.events);
            
            console.log('Calling renderCalendar...');
            this.renderCalendar();
            
            console.log('=== CALENDAR INITIALIZATION SUCCESS ===');
        } catch (error) {
            console.error('=== CALENDAR INITIALIZATION ERROR ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            this.renderEmptyCalendar();
        }
    }

    // Render calendar grid
    renderCalendar() {
        console.log('renderCalendar called');
        const calendarGrid = document.querySelector('.calendar-grid');
        const weekHeader = document.getElementById('currentWeek');
        
        console.log('Calendar grid found:', !!calendarGrid);
        console.log('Week header found:', !!weekHeader);
        
        if (!calendarGrid) return;

        // Update week header
        if (weekHeader) {
            const weekStart = new Date(this.currentWeek);
            const dayOfWeek = weekStart.getDay();
            
            // Adjust to Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToMonday);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 4); // Monday + 4 = Friday
            
            weekHeader.textContent = weekStart.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
            }) + ' - ' + weekEnd.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
            });
        }

        calendarGrid.innerHTML = '';

        // Add weekday headers
        const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            calendarGrid.appendChild(dayHeader);
        });

        // Get current week events
        const weekEvents = this.parser.getWeekEvents(this.currentWeek);
        console.log('Total events parsed:', this.parser.events.length);
        console.log('Week events found:', weekEvents.length);
        console.log('Week events:', weekEvents);
        
        // Add day cells
        for (let i = 0; i < 5; i++) {
            const dayDate = new Date(this.currentWeek);
            const dayOfWeek = dayDate.getDay();
            
            // Adjust to Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            dayDate.setDate(dayDate.getDate() - daysToMonday + i);
            
            console.log(`=== DAY ${i} CALCULATION ===`);
            console.log('CurrentWeek date:', this.currentWeek.toDateString());
            console.log('DayOfWeek:', dayOfWeek);
            console.log('DaysToMonday:', daysToMonday);
            console.log('Final dayDate:', dayDate.toISOString());
            console.log('Final dayDate (local):', dayDate.toString());
            console.log('Final dayDate (date string):', dayDate.toDateString());
            
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            
            // Add events for this day
            const dayEvents = weekEvents.filter((event, index) => {
                const eventDate = new Date(event.start);
                const dayDateStr = dayDate.toDateString();
                const eventDateStr = eventDate.toDateString();
                const matches = eventDateStr === dayDateStr;
                
                console.log(`Day ${i} - Event ${index} filtering:`, {
                    dayDate: dayDateStr,
                    eventDate: eventDateStr,
                    matches: matches,
                    eventSummary: event.summary,
                    eventStart: event.start.toString(),
                    eventStartISO: event.start.toISOString()
                });
                
                return matches;
            });
            
            // Sort events by start time (earliest to latest)
            dayEvents.sort((a, b) => {
                const timeA = new Date(a.start).getTime();
                const timeB = new Date(b.start).getTime();
                return timeA - timeB;
            });
            
            console.log(`Day ${i} (${dayDate.toDateString()}) events after sorting:`, dayEvents.map(e => ({
                summary: e.summary,
                startTime: new Date(e.start).toLocaleTimeString(),
                startHour: new Date(e.start).getHours()
            })));
            
            console.log(`Day ${i} (${dayDate.toDateString()}) final events count:`, dayEvents.length);

            dayEvents.forEach(event => {
                console.log(`=== RENDERING EVENT: ${event.summary} ===`);
                
                const eventDiv = document.createElement('div');
                eventDiv.style.marginBottom = '3px';
                eventDiv.style.padding = '2px';
                eventDiv.style.backgroundColor = 'var(--panel)';
                eventDiv.style.borderRadius = '3px';
                eventDiv.style.fontSize = '11px';
                eventDiv.style.cursor = 'pointer';
                
                // Format start and end times
                const startTime = new Date(event.start);
                const endTime = new Date(event.end);
                
                const startTimeString = window.formatTime ? window.formatTime(startTime) : 
                    startTime.toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    
                const endTimeString = window.formatTime ? window.formatTime(endTime) : 
                    endTime.toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                
                // Build event display string with all details
                let eventDisplay = `${startTimeString} - ${endTimeString}`;
                
                // Add subject/summary
                if (event.summary) {
                    eventDisplay += `\n${event.summary}`;
                }
                
                // Add attending staff
                if (event.attendingStaff) {
                    eventDisplay += `\nStaff: ${event.attendingStaff}`;
                }
                
                // Add location
                if (event.location) {
                    eventDisplay += `\nRoom: ${event.location}`;
                }
                
                console.log('Event rendering details:', {
                    subject: event.summary,
                    attendingStaff: event.attendingStaff,
                    location: event.location,
                    startTime: startTimeString,
                    endTime: endTimeString,
                    startHour: startTime.getHours(),
                    endHour: endTime.getHours(),
                    eventDisplay: eventDisplay
                });
                
                // Use innerHTML to allow line breaks
                eventDiv.innerHTML = eventDisplay.replace(/\n/g, '<br>');
                
                // Build tooltip with all information
                let tooltipText = `Subject: ${event.summary}`;
                if (event.attendingStaff) {
                    tooltipText += `\nStaff: ${event.attendingStaff}`;
                }
                if (event.location) {
                    tooltipText += `\nLocation: ${event.location}`;
                }
                tooltipText += `\nTime: ${startTimeString} - ${endTimeString}`;
                if (event.description) {
                    tooltipText += `\nDescription: ${event.description}`;
                }
                
                eventDiv.title = tooltipText;
                
                // Add click handler for event details
                eventDiv.onclick = () => this.showEventDetails(event);
                
                dayCell.appendChild(eventDiv);
                console.log(`Event rendered: ${event.summary}`);
            });

            calendarGrid.appendChild(dayCell);
        }
        
        // Add current time indicator
        this.addCurrentTimeIndicator();
    }

    // Add current time indicator to calendar
    addCurrentTimeIndicator() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.getDay();
        
        console.log('Adding current time indicator:', {
            currentHour,
            currentMinute,
            currentDay,
            currentTime: now.toLocaleTimeString()
        });
        
        // Only show indicator on weekdays (Mon-Fri)
        if (currentDay === 0 || currentDay === 6) {
            console.log('Current time indicator: Weekend - not showing');
            return;
        }
        
        // Calculate which day column (0-4 for Mon-Fri)
        let dayColumn = currentDay - 1; // Monday=0, Tuesday=1, etc.
        if (currentDay === 0) dayColumn = 6 - 1; // Sunday becomes Monday
        
        // Only show if within school hours (8 AM - 5 PM)
        if (currentHour < 8 || currentHour > 17) {
            console.log('Current time indicator: Outside school hours - not showing');
            return;
        }
        
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        // Remove existing indicator if any
        const existingIndicator = calendarGrid.querySelector('.current-time-indicator');
        const existingLabel = calendarGrid.querySelector('.current-time-label');
        if (existingIndicator) existingIndicator.remove();
        if (existingLabel) existingLabel.remove();
    }

    // Navigate to previous/next week
    navigateWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7));
        this.renderCalendar();
    }

    // Render empty calendar with manual upload option
    renderEmptyCalendar() {
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;

        calendarGrid.innerHTML = '';

        // Add weekday headers
        const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            calendarGrid.appendChild(dayHeader);
        });

        // Add empty day cells
        for (let i = 0; i < 5; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            // Leave completely empty
            calendarGrid.appendChild(dayCell);
        }
    }

    // Show event details modal
    showEventDetails(event) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        // Format start and end times
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        
        const startTimeString = window.formatTime ? window.formatTime(startTime) : 
            startTime.toLocaleTimeString('en-AU', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
        const endTimeString = window.formatTime ? window.formatTime(endTime) : 
            endTime.toLocaleTimeString('en-AU', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        
        const dateStr = startTime.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${event.summary}</h2>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${startTimeString} - ${endTimeString}</p>
                ${event.attendingStaff ? `<p><strong>Staff:</strong> ${event.attendingStaff}</p>` : ''}
                ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                <div class="modal-actions">
                    <button onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }
}

// Calendar Upload Modal
function showCalendarUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Upload Calendar</h2>
            <p>Enter your iCalendar URL to load your timetable:</p>
            <form id="calendarUploadForm">
                <label for="calendarUrl">iCalendar URL:</label>
                <input type="url" id="calendarUrl" placeholder="https://example.com/calendar.ics" required>
                <div class="modal-actions">
                    <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit">Load Calendar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('#calendarUploadForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const url = document.getElementById('calendarUrl').value;
        
        if (url) {
            // Save to localStorage
            localStorage.calendarUrl = url;
            
            // Initialize calendar
            if (window.calendarDisplay) {
                await window.calendarDisplay.initialize(url);
            }
            
            modal.remove();
        }
    };
    
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Initialize calendar system
let calendarDisplay;

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED ===');
    console.log('Starting calendar initialization...');
    
    calendarDisplay = new CalendarDisplay();
    window.calendarDisplay = calendarDisplay;
    
    console.log('Calendar display created:', calendarDisplay);
    console.log('Window.calendarDisplay set:', window.calendarDisplay);
    
    // Check for saved calendar URL
    const savedUrl = localStorage.calendarUrl;
    console.log('Saved calendar URL found:', savedUrl);
    
    if (savedUrl) {
        console.log('Found saved URL, initializing calendar...');
        calendarDisplay.initialize(savedUrl);
    } else {
        console.log('No saved URL, rendering empty calendar...');
        // Show empty calendar with upload option
        calendarDisplay.renderEmptyCalendar();
    }
    
    console.log('=== CALENDAR SYSTEM INITIALIZED ===');
});
