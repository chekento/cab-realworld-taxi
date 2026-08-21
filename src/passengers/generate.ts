import type { PassengerDNA } from '../core/contracts';

const FIRST_NAMES = ['Nora', 'Timo', 'Mara', 'Jonas', 'Lea', 'David', 'Aylin', 'Felix', 'Samira', 'Mats', 'Sofia', 'Ben'];
const LAST_NAMES = ['Becker', 'Nguyen', 'Scholz', 'Kaya', 'Meyer', 'Rossi', 'Fischer', 'Nowak', 'Wagner', 'Lindholm', 'Klein', 'Santos'];
const OCCUPATIONS = [
  'nurse',
  'software engineer',
  'teacher',
  'musician',
  'hotel manager',
  'student',
  'architect',
  'chef',
  'sales representative',
  'researcher',
  'photographer',
  'event technician'
];
const TEMPERAMENTS: PassengerDNA['temperament'][] = ['calm', 'chatty', 'impatient', 'reserved', 'eccentric'];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function score(): number {
  return Math.round(Math.random() * 100);
}

export function generatePassenger(): PassengerDNA {
  return {
    id: crypto.randomUUID(),
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    age: 18 + Math.floor(Math.random() * 63),
    occupation: pick(OCCUPATIONS),
    temperament: pick(TEMPERAMENTS),
    localKnowledge: score(),
    routeTolerance: score(),
    humor: score(),
    comfortPriority: score(),
    punctualityPriority: score(),
    tipGenerosity: score()
  };
}
