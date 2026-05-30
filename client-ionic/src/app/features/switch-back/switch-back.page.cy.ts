import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchBackPage } from './switch-back.page';

describe('SwitchBackPage', () => {
  let component: SwitchBackPage;
  let fixture: ComponentFixture<SwitchBackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchBackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
