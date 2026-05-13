import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDetailPage } from './player-detail.page';

describe('PlayerDetailPage', () => {
  let component: PlayerDetailPage;
  let fixture: ComponentFixture<PlayerDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
