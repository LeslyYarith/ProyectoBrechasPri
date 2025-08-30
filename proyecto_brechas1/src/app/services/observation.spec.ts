import { TestBed } from '@angular/core/testing';

import { Observation } from './observation';

describe('Observation', () => {
  let service: Observation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Observation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
