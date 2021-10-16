import React, {useEffect, useState} from 'react';
import {useLocalStorage} from './useLocalStorage';

export interface Pause {
  id: string
  start: number
  end: number
}

const rand = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

const formatWithTwoDigits = (n: number): string => {
  return `00${n}`.substr(-2);
};

function Timer() {

  // for re-rendering
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now), 1);
    return () => clearInterval(interval);
  }, []);

  const [startTime, setStartTime] = useLocalStorage<number | null>('start-time', null);
  const [endTime, setEndTime] = useLocalStorage<number | null>('end-time', null);
  const [pauseStartTime, setPauseStartTime] = useLocalStorage<number | null>('pause-start-time', null);
  const [pauses, setPauses] = useLocalStorage<Pause[]>('pauses', []);

  const getCurrentTime = () => {
    return Date.now();
  };

  const startTimer = () => {
    setStartTime(getCurrentTime());
  };

  const stopTimer = () => {
    setEndTime(getCurrentTime());
  };

  const pauseTimer = () => {
    setPauseStartTime(getCurrentTime());
  }

  const resumeTimer = () => {
    const newPause: Pause = {
      id: rand(),
      start: pauseStartTime!,
      end: getCurrentTime(),
    };
    setPauses([...pauses, newPause]);
    setPauseStartTime(null);
  }

  const resumeFromEndTime = () => {
    const newPause: Pause = {
      id: rand(),
      start: endTime!,
      end: getCurrentTime(),
    };
    setPauses([...pauses, newPause]);
    setEndTime(null);
  };

  const reset = () => {
    if (!window.confirm('🔥 you sure? 🔥')) return;

    setStartTime(null);
    setEndTime(null);
    setPauseStartTime(null);
    setPauses([]);
  };

  const isRunning = startTime !== null && endTime === null;
  const isPaused = pauseStartTime !== null;
  const isEnded = endTime !== null;
  const isUnused = startTime === null && endTime === null;

  const getCurrentAmountOfTimeTotal = () => {

    if (isUnused) return 0;

    const endPoint = isEnded ? endTime :
      isPaused ? pauseStartTime : getCurrentTime();
    let totalElapsed = endPoint - startTime!;

    pauses.forEach((pause: Pause) => {
      totalElapsed -= pause.end - pause.start;
    });

    return totalElapsed;
  }

  const getTimeDisplay = () => {
    const total = getCurrentAmountOfTimeTotal();
    const secondsSince = Math.floor(total / 1_000);
    const minutesSince = Math.floor(secondsSince / 60);
    const hoursSince = Math.floor(minutesSince / 60);

    const _hoursFormatted = formatWithTwoDigits(hoursSince);
    const _minutesFormatted = formatWithTwoDigits(minutesSince % 60);
    const _secondsFormatted = formatWithTwoDigits(secondsSince % 60);

    return `${_hoursFormatted}:${_minutesFormatted}:${_secondsFormatted}`;
  }

  return (
    <div
      className="timer-app"
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: 'blue'
      }}>
      <div
        style={{
          width: '90%',
          maxWidth: '500px',
          margin: 'auto',
          padding: '10px',
        }}
      >
        <div
          className='time-container'
          style={{
            margin: '20px',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontSize: '8px',
            color: 'white',
            textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
          }}
        >
          {time}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div className='main-controls'>
            {
              !isEnded && <button
                disabled={isPaused}
                onClick={isUnused ? startTimer : stopTimer}
              >
                {isRunning ? '🛑 Stop 🛑' : '⭐ Start ⭐'}
              </button>
            }
            {
              isRunning && !isPaused && <button
                onClick={pauseTimer}
              >
                ⏸ Pause ⏸
              </button>
            }
            {
              isPaused && <button
                onClick={resumeTimer}
              >
                🔁 Continue 🔁
              </button>
            }
            {
              isEnded && <button
                onClick={resumeFromEndTime}
              >
                👍 Jk, keep going 👍
              </button>
            }
          </div>
          <div className='reset-controls'>
            <button
              onClick={reset}
            >
              🔥 Reset 🔥
            </button>
          </div>
        </div>

        <div
          className='time-container'
          style={{
            margin: '50px',
            fontFamily: 'monospace',
            fontSize: '42px',
            color: isEnded ? 'greenyellow' : isPaused ? 'dimgrey' : 'white',
            textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
          }}
        >
          {getTimeDisplay()}
        </div>

        {pauses.length !== 0 && <div style={{color: 'white', width: '60%', margin: 'auto'}}>
          Pauses
            {pauses.map(pause => {
              return <PauseDetails
                pause={pause}
              />
            })}
          </div>
        }
      </div>


    </div>
  );
}

export default Timer;

export const PauseDetails = ({pause}: {pause: Pause}) => {

  const getDateString = (time: number) => {
    const date = new Date(time);
    return `${formatWithTwoDigits(date.getHours())}:${formatWithTwoDigits(date.getMinutes())}:${formatWithTwoDigits(date.getSeconds())}`;
  };

  return (
    <div style={{
      textAlign: 'center',
      margin: '10px',
    }}>
      {getDateString(pause.start)} to {getDateString(pause.end)}
    </div>
  )
}
