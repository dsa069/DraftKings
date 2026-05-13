import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePlayersNewsPage } from './create-players-news.page';

describe('CreatePlayersNewsPage', () => {
  let component: CreatePlayersNewsPage;
  let fixture: ComponentFixture<CreatePlayersNewsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePlayersNewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
