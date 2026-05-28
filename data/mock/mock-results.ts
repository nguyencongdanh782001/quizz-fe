import { ExamAttempt } from '@/types/exam.types';

export const mockResults: ExamAttempt[] = [
  {
    id: 'attempt-001',
    examId: 'exam-002',
    userId: 'st-001',
    answers: {
      'q-002-01': {
        question_id: 'q-002-01',
        checkbox_answer: ['a', 'b', 'c'],
      },
      'q-002-02': {
        question_id: 'q-002-02',
        radio_answer: 'b',
      },
    },
    score: 18,
    totalPoints: 30,
    percentage: 60,
    passed: true,
    startedAt: '2024-10-21T08:00:00Z',
    submittedAt: '2024-10-21T08:14:00Z',
    timeSpent: 840,
  },
  {
    id: 'attempt-002',
    examId: 'exam-003',
    userId: 'st-001',
    answers: {
      'q-003-01': {
        question_id: 'q-003-01',
        radio_answer: 'a',
      },
      'q-003-02': {
        question_id: 'q-003-02',
        radio_answer: 'b',
      },
      'q-003-03': {
        question_id: 'q-003-03',
        checkbox_answer: ['a', 'b', 'd'],
      },
      'q-003-04': {
        question_id: 'q-003-04',
        radio_answer: 'b',
      },
      'q-003-05': {
        question_id: 'q-003-05',
        radio_answer: 'a',
      },
    },
    score: 22,
    totalPoints: 22,
    percentage: 88,
    passed: true,
    startedAt: '2024-10-19T10:00:00Z',
    submittedAt: '2024-10-19T10:28:00Z',
    timeSpent: 1680,
  },
];

export function getResultsByUserId(userId: string): ExamAttempt[] {
  return mockResults.filter(r => r.userId === userId);
}
