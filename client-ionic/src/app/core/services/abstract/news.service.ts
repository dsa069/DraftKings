import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { News } from '../../models/news.model';
import { AuthService } from './auth.service';

@Injectable()
export abstract class NewsService {
  protected abstract apiUrl: string;
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);

  // SIGNALS INTERNOS (Mutables solo dentro del servicio)
  protected readonly _newsList = signal<News[]>([]);
  protected readonly _selectedNews = signal<News | null>(null);
  protected readonly _loading = signal<boolean>(false);

  // SIGNALS PÚBLICOS (Readonly para los componentes)
  public readonly newsList: Signal<News[]> = computed(() => this._newsList());
  public readonly selectedNews: Signal<News | null> = computed(() =>
    this._selectedNews()
  );
  public readonly loading: Signal<boolean> = computed(() => this._loading());

  // UC_ver_noticias
  abstract getNews(): Promise<News[]>;

  // UC_ver_noticia
  abstract getNewsById(id: string | number): Promise<News>;

  // UC_crear_noticia
  abstract createNews(news: News): Promise<News>;
}
