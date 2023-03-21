//
// Unit test for eventmodel.ts
//

import { GeneralEvent, RecurEvent, EventHabit, EventHabitDetail } from './eventmodel';
import * as moment from 'moment';
import * as hih from './common';

describe('GeneralEvent', () => {
  let instance: GeneralEvent;

  beforeEach(() => {
    instance = new GeneralEvent();
  });

  it('onSetData', () => {
    instance.onSetData({
      Id: 1,
      HomeID: 1,
      Name: 'Logon to elder mailbox | 1 / 29',
      StartDate: '2018-07-13',
      EndDate: '2018-07-13',
      CompleteDate: '2018-08-14',
      Content: 'Logon elder mailbox',
      IsPublic: false,
      Assignee: 'e8d92277-a682-4328-ba92-27b6e9627012',
      RefRecurrID: 1,
      CreatedAt: '2018-07-13T00:00:00+08:00',
      Createdby: 'e8d92277-a682-4328-ba92-27b6e9627012',
      UpdatedAt: '2018-08-14T00:00:00+08:00',
      Updatedby: 'e8d92277-a682-4328-ba92-27b6e9627012',
    });
    expect(instance.ID).toEqual(1);
    expect(instance.HID).toEqual(1);
    expect(instance.Name).toEqual('Logon to elder mailbox | 1 / 29');
  });

  it('writeJsonObject and onSetData', () => {
    instance.Name = 'test';
    instance.IsPublic = false;
    instance.ID = 1;
    instance.HID = 1;
    instance.StartDate = moment();
    instance.Assignee = 'test';
    instance.Content = 'test_content';

    expect(instance.StartDateDisplayString).toBeTruthy();
    expect(instance.EndDateDisplayString).toEqual('');

    const jsondata: any = instance.writeJSONObject();
    expect(jsondata).toBeTruthy();

    const instance2: GeneralEvent = new GeneralEvent();
    instance2.onSetData(jsondata);
    expect(instance2).toBeTruthy();
    expect(instance2.HID).toEqual(1);
    expect(instance2.ID).toEqual(1);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Content).toEqual(instance.Content);
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
    expect(instance.EndDateDisplayString).toEqual('');

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
