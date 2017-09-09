import { LearnModule } from './learn.module';

describe('LearnModule', () => {
  let learnModule: LearnModule;

  beforeEach(() => {
    learnModule = new LearnModule();
  });

  it('should create an instance', () => {
    expect(learnModule).toBeTruthy();
  });
});
