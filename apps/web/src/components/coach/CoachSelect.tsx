import React, { useState } from 'react';
import { COACHES, formatTopicLabel as formatTopic } from '../../data/coaches';
import './CoachSelect.css';

interface CoachSelectProps {
  onSelect: (coachId: string, topic?: string, autoStart?: boolean) => void;
}

export function CoachSelect({ onSelect }: CoachSelectProps) {
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string>>({});

  return (
    <div className="coach-select">
      <div className="coach-select__header">
        <h1>Choose Your Coach</h1>
        <p>Select a specialist based on what you're working on</p>
      </div>
      <div className="coach-select__grid">
        {COACHES.map((coach) => (
          <button
            key={coach.id}
            className="coach-card"
            onClick={() => onSelect(coach.id, selectedTopics[coach.id])}
            style={{ '--accent': coach.accentColor } as React.CSSProperties}
          >
            <div className="coach-card__photo-wrap">
              <img
                className="coach-card__photo"
                src={coach.previewUrl}
                alt={coach.name}
                loading="lazy"
              />
            </div>
            <div className="coach-card__body">
              <span className="coach-card__badge">{coach.specialty}</span>
              <div className="coach-card__name-row">
                <span className="coach-card__name">{coach.name}</span>
                <button
                  className="coach-card__play"
                  aria-label={`Launch ${coach.name}`}
                  onClick={(e) => { e.stopPropagation(); onSelect(coach.id, selectedTopics[coach.id], true); }}
                >
                  <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L7 4L0 8V0Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              <select
                className="coach-card__topic-select"
                value={selectedTopics[coach.id] ?? ''}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedTopics(prev => ({ ...prev, [coach.id]: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">{coach.title}</option>
                {coach.topics.map(t => (
                  <option key={t} value={t}>{formatTopic(t)}</option>
                ))}
              </select>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
