import React, { useState } from 'react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
* @description DynamicCalendar component that displays a calendar for the current month and year.
* It allows navigation between months and highlights the current date.
* @component
* @returns {JSX.Element} The rendered DynamicCalendar component.
*/

const DynamicCalendar: React.FC = () => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
    // Returns number of days in given month/year
    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month + 1, 0).getDate();
    };
    // Returns the day of week (0=Sun..6=Sat) the month starts on
    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month, 1).getDay();
    };
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    // Prepare array to represent calendar cells (null for empty cells before first day)
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }
    const handlePrevMonth = (): void => {
        setCurrentMonth((prevMonth) => {
            if (prevMonth === 0) {
                setCurrentYear((prevYear) => prevYear - 1);
                return 11;
            }
            return prevMonth - 1;
        });
    };
    const handleNextMonth = (): void => {
        setCurrentMonth((prevMonth) => {
            if (prevMonth === 11) {
                setCurrentYear((prevYear) => prevYear + 1);
                return 0;
            }
            return prevMonth + 1;
        });
    };
    return (<div style={{
            width: '110%',
            height: '50%',
            margin: '20px auto',
            borderRadius: '10px',
            overflow: 'hidden'
        }}>
      <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
        }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'blue', fontSize: '20px', cursor: 'pointer' }} aria-label="Previous Month">
          &#8592;
        </button>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'blue', fontSize: '20px', cursor: 'pointer' }} aria-label="Next Month">
          &#8594;
        </button>
      </div>

      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            // backgroundColor: '#f0f0f0',
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '10px 0'
        }}>
        {dayNames.map(day => (<div key={day} style={{ padding: '5px 0' }}>{day}</div>))}
      </div>

      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            padding: '10px'
        }}>
        {calendarDays.map((date, idx) => {
            const isToday = date === today.getDate()
                && currentMonth === today.getMonth()
                && currentYear === today.getFullYear();
            return (<div key={idx} style={{
                    padding: '15% 0',
                    borderRadius: '50%',
                    backgroundColor: isToday ? '#3f51b5' : 'transparent',
                    color: isToday ? 'white' : 'black',
                    width: '35px',
                    height: '25px',
                    margin: '0 auto',
                    userSelect: 'auto',
                }}>
              {date || ''}
            </div>);
        })}
      </div>
    </div>);
};
export default DynamicCalendar;
