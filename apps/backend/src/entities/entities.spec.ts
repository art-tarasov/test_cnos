import { UserRole } from './user.entity';
import { QuizStatus } from './quiz.entity';
import { QuestionType } from './question.entity';
import { QuestionAnswer } from './question-answer.entity';

describe('UserRole', () => {
  it('has expected string values', () => {
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.AUTHOR).toBe('author');
    expect(UserRole.PARTICIPANT).toBe('participant');
  });
});

describe('QuizStatus', () => {
  it('has expected string values', () => {
    expect(QuizStatus.DRAFT).toBe('draft');
    expect(QuizStatus.PUBLISHED).toBe('published');
  });
});

describe('QuestionType', () => {
  it('has expected string values', () => {
    expect(QuestionType.SINGLE_CHOICE).toBe('single_choice');
    expect(QuestionType.MULTIPLE_CHOICE).toBe('multiple_choice');
    expect(QuestionType.TRUE_FALSE).toBe('true_false');
    expect(QuestionType.SHORT_TEXT).toBe('short_text');
  });
});

describe('QuestionAnswer composite key', () => {
  it('holds questionId and optionId as independent fields', () => {
    const a = new QuestionAnswer();
    a.questionId = 'q-uuid-1';
    a.optionId = 'o-uuid-1';

    const b = new QuestionAnswer();
    b.questionId = 'q-uuid-1';
    b.optionId = 'o-uuid-2';

    expect(a.questionId).toBe(b.questionId);
    expect(a.optionId).not.toBe(b.optionId);
  });
});
