import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlayersNewsPage } from './new-players-news.page';

describe('NewPlayersNewsPage', () => {
  let component: NewPlayersNewsPage;
  let fixture: ComponentFixture<NewPlayersNewsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPlayersNewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
