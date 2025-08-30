import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityTab } from './priority-tab';

describe('PriorityTab', () => {
  let component: PriorityTab;
  let fixture: ComponentFixture<PriorityTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorityTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
