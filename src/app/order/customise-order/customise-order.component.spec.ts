import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomiseOrderComponent } from './customise-order.component';

describe('CustomiseOrderComponent', () => {
  let component: CustomiseOrderComponent;
  let fixture: ComponentFixture<CustomiseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomiseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomiseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
