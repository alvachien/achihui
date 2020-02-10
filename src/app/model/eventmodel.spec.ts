//
// Unit test for eventmodel.ts
//

import { GeneralEvent, RecurEvent, EventHabit, EventHabitDetail, } from './eventmodel';
import * as moment from 'moment';
import * as hih from './common';

describe('GeneralEvent', () => {
  let instance: GeneralEvent;

  beforeEach(() => {
    instance = new GeneralEvent();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';
    instance.IsPublic = false;
    instance.ID = 1;
    instance.HID = 1;
    instance.StartTime = moment();
    instance.Assignee = 'test';
    instance.Content = 'test_content';

    expect(instance.StartTimeFormatString).toBeTruthy();
    expect(instance.EndTimeFormatString).toEqual('');

    const jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    const instance2: GeneralEvent = new GeneralEvent();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('RecurEvent', () => {
  let instance: RecurEvent;

  beforeEach(() => {
    instance = new RecurEvent();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';
    instance.IsPublic = false;
    instance.ID = 1;
    instance.HID = 1;
    instance.Assignee = 'test';
    instance.Content = 'test_content';
    expect(instance.EndTimeFormatString).toEqual('');

    const jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    const instance2: RecurEvent = new RecurEvent();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('EventHabit', () => {
  let instance: EventHabit;

  beforeEach(() => {
    instance = new EventHabit();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';
    instance.ID = 1;
    instance.HID = 1;
    instance.assignee = 'test';
    instance.content = 'test_content';

    const jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    const instance2: EventHabit = new EventHabit();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

describe('EventHabitDetail', () => {
  let instance: EventHabitDetail;

  beforeEach(() => {
    instance = new EventHabitDetail();
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';
    instance.ID = 1;
    instance.HabitID = 1;

    const jsondata: any = {};
    expect(jsondata).toBeTruthy();

    const instance2: EventHabitDetail = new EventHabitDetail();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
  });
});

