import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlayerPage } from './new-player.page';

describe('NewPlayerPage', () => {
  let component: NewPlayerPage;
  let fixture: ComponentFixture<NewPlayerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPlayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
