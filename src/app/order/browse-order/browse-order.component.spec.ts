import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseOrderComponent } from './browse-order.component';

describe('BrowseOrderComponent', () => {
  let component: BrowseOrderComponent;
  let fixture: ComponentFixture<BrowseOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
